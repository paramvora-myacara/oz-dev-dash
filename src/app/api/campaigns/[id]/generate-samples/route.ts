import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import Papa from 'papaparse';
import { generateEmailHtml } from '@/lib/email/generateEmailHtml';
import { generateUnsubscribeUrl } from '@/lib/email/unsubscribe';
import { generatePersonalizedBatch } from '@/lib/ai/generatePersonalizedContent';
import type { SampleEmail, Section } from '@/types/email-editor';

const DEFAULT_SAMPLE_COUNT = 5;

// Convert any rich-text/HTML into plain text for text-mode previews
const stripHtmlToText = (input: string): string =>
  input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

// POST /api/campaigns/:id/generate-samples
// Generates sample emails without persisting to the database
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const supabase = createAdminClient();

    // 1. Get campaign configuration
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const emailFormat = formData.get('emailFormat') as 'html' | 'text' || campaign.email_format || 'text';
    const countParam = formData.get('count');
    const sampleCount = countParam ? parseInt(countParam as string, 10) : DEFAULT_SAMPLE_COUNT;

    if (!file) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

    // 3. Save email format to campaign
    await supabase
      .from('campaigns')
      .update({
        email_format: emailFormat,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    // 4. Parse CSV
    const csvText = await file.text();
    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parsing failed',
        details: parseResult.errors.map(e => e.message),
      }, { status: 400 });
    }

    const rows = parseResult.data;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // 5. Validate required Email column
    const firstRow = rows[0];
    if (!('Email' in firstRow) && !('email' in firstRow)) {
      return NextResponse.json({
        error: 'CSV must have an "Email" column',
        availableColumns: Object.keys(firstRow),
      }, { status: 400 });
    }

    // 6. Helper to replace template variables
    const replaceVariables = (text: string, row: Record<string, string>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = row[varName] || row[varName.toLowerCase()] || row[varName.toUpperCase()];
        return value !== undefined ? value : match;
      });
    };

    // 7. Select sample rows (randomly or first N, depending on list size)
    let sampleRows: Record<string, string>[];
    if (rows.length <= sampleCount) {
      // If we have fewer rows than requested samples, use all of them
      sampleRows = rows;
    } else {
      // Randomly select N rows for better representation
      const shuffled = [...rows].sort(() => Math.random() - 0.5);
      sampleRows = shuffled.slice(0, sampleCount);
    }

    // 8. Validate emails in sample rows
    const errors: string[] = [];
    const validSampleRows: Array<{ row: Record<string, string>; email: string }> = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const row of sampleRows) {
      const email = (row.Email || row.email || '').toLowerCase().trim();

      if (!email) {
        errors.push(`Missing email in sample row`);
        continue;
      }

      if (!emailRegex.test(email)) {
        errors.push(`Invalid email format: "${email}"`);
        continue;
      }

      validSampleRows.push({ row, email });
    }

    if (validSampleRows.length === 0) {
      return NextResponse.json({
        error: 'No valid sample recipients found',
        details: errors,
      }, { status: 400 });
    }

    // 9. Generate sample emails (without persisting)
    const subjectLineContent = campaign.subject_line?.content || '';
    const sections: Section[] = campaign.sections || [];
    const personalizedSections = sections.filter((s) => s.mode === 'personalized');

    // Generate AI content for personalized sections if needed
    let aiContentMap = new Map<string, Map<string, string>>();

    if (personalizedSections.length > 0) {
      try {
        const batchRecipients = validSampleRows.map(({ row }, index) => ({
          index,
          fields: row,
        }));

        const batchResults = await generatePersonalizedBatch(
          sections,
          personalizedSections,
          batchRecipients
        );

        // Build map of email -> sectionId -> content
        for (const result of batchResults) {
          const { row, email } = validSampleRows[result.recipientIndex];
          const sectionMap = new Map<string, string>();
          for (const section of result.sections) {
            sectionMap.set(section.sectionId, section.content);
          }
          aiContentMap.set(email, sectionMap);
        }
      } catch (aiError) {
        console.error('AI generation error for samples:', aiError);
        // Continue with placeholders if AI fails
      }
    }

    const samples: SampleEmail[] = validSampleRows.map(({ row, email }) => {
      // Replace variables in subject
      const subject = replaceVariables(subjectLineContent, row);

      // Generate body based on format
      let body: string;
      const unsubscribeUrl = generateUnsubscribeUrl(email, process.env.NEXT_PUBLIC_APP_URL);
      const recipientAiContent = aiContentMap.get(email);

      if (emailFormat === 'text') {
        // Plain text: concatenate sections
        body = sections
          .filter((s: Section) => s.type === 'text')
          .sort((a, b) => a.order - b.order)
          .map((s: Section) => {
            if (s.mode === 'personalized') {
              // Use AI-generated content or fallback to placeholder
              const aiContent = recipientAiContent?.get(s.id);
              return aiContent || `[${s.name} - AI generation pending]`;
            }
            return stripHtmlToText(replaceVariables(s.content || '', row));
          })
          .join('\n\n');
        // Add unsubscribe link for text emails
        body += `\n\n---\nIf you'd prefer not to receive these emails, you can unsubscribe here: ${unsubscribeUrl}`;
      } else {
        // HTML: use the renderer with AI-populated sections
        const sectionsWithAiContent = sections.map((s: Section) => {
          if (s.mode === 'personalized') {
            const aiContent = recipientAiContent?.get(s.id);
            return {
              ...s,
              content: aiContent || `[${s.name} - AI generation pending]`,
            };
          }
          return s;
        });
        body = generateEmailHtml(sectionsWithAiContent, subject, row, unsubscribeUrl);
      }

      return {
        toEmail: email,
        subject,
        body,
        recipientData: row,
      };
    });

    return NextResponse.json({
      success: true,
      samples,
      totalRecipients: rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('POST /api/campaigns/:id/generate-samples error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
