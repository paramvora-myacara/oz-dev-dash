import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import Papa from 'papaparse';
import { generateEmailHtml } from '@/lib/email/generateEmailHtml';
import { generateUnsubscribeUrl } from '@/lib/email/unsubscribe';

// Convert any rich-text/HTML into plain text for text-mode campaigns
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

// POST /api/campaigns/:id/generate
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

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only generate emails for draft campaigns' },
        { status: 400 }
      );
    }

    // 2. Parse CSV from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

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

    // 3. Validate required Email column
    const firstRow = rows[0];
    if (!('Email' in firstRow) && !('email' in firstRow)) {
      return NextResponse.json({
        error: 'CSV must have an "Email" column',
        availableColumns: Object.keys(firstRow),
      }, { status: 400 });
    }

    // 4. Helper to replace template variables
    const replaceVariables = (text: string, row: Record<string, string>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = row[varName] || row[varName.toLowerCase()] || row[varName.toUpperCase()];
        return value !== undefined ? value : match;
      });
    };

    // 5. Validate emails and detect duplicates
    const seenEmails = new Set<string>();
    const errors: string[] = [];
    const validRows: Array<{ row: Record<string, string>; email: string }> = [];

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const emailField = (row.Email || row.email || '').trim();
      
      if (!emailField) {
        errors.push(`Row ${i + 2}: Missing email`);
        continue;
      }

      // Split by comma and process each email
      const emailAddresses = emailField.split(',').map(e => e.trim()).filter(e => e.length > 0);
      
      if (emailAddresses.length === 0) {
        errors.push(`Row ${i + 2}: Missing email`);
        continue;
      }

      // Validate each email address
      const validEmails: string[] = [];
      for (const email of emailAddresses) {
        const normalizedEmail = email.toLowerCase().trim();
        
        // Skip if empty after normalization
        if (!normalizedEmail) {
          continue;
        }

        // Validate email format
        if (!emailRegex.test(normalizedEmail)) {
          errors.push(`Row ${i + 2}: Invalid email format "${email}"`);
          continue;
        }

        // Check for duplicates (across all rows)
        if (seenEmails.has(normalizedEmail)) {
          errors.push(`Row ${i + 2}: Duplicate email "${email}"`);
          continue;
        }

        seenEmails.add(normalizedEmail);
        validEmails.push(normalizedEmail);
      }

      // Create a queue entry for each valid email (using the same row metadata)
      for (const email of validEmails) {
        validRows.push({ row, email });
      }
    }

    if (validRows.length === 0) {
      return NextResponse.json({
        error: 'No valid recipients found',
        details: errors,
      }, { status: 400 });
    }

    // 6. Delete any existing staged emails for this campaign
    await supabase
      .from('email_queue')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('status', 'staged');

    // 7. Generate emails for each recipient
    const subjectLineContent = campaign.subject_line?.content || '';
    const sections = campaign.sections || [];
    
    const queueRows = validRows.map(({ row, email }) => {
      // Replace variables in subject
      const subject = replaceVariables(subjectLineContent, row);
      
      // Generate body based on format
      let body: string;
      const unsubscribeUrl = generateUnsubscribeUrl(email, process.env.NEXT_PUBLIC_APP_URL);
      
      if (campaign.email_format === 'text') {
        // Plain text: concatenate sections
        body = sections
          .filter((s: any) => s.type === 'text')
          .map((s: any) => stripHtmlToText(replaceVariables(s.content || '', row)))
          .join('\n\n');
        // Add unsubscribe link for text emails
        body += `\n\n---\nIf you'd prefer not to receive these emails, you can unsubscribe here: ${unsubscribeUrl}`;
      } else {
        // HTML: use the renderer with unsubscribe URL
        body = generateEmailHtml(sections, subject, row, unsubscribeUrl);
      }

      return {
        campaign_id: campaignId,
        to_email: email,
        subject,
        body,
        status: 'staged',
        metadata: row, // Store all CSV data for reference
        is_edited: false,
        // These are set at launch time:
        from_email: null,
        domain_index: null,
        scheduled_for: null,
        delay_seconds: 0,
      };
    });

    // 8. Bulk insert
    const { error: insertError } = await supabase
      .from('email_queue')
      .insert(queueRows);

    if (insertError) {
      return NextResponse.json({
        error: 'Failed to insert emails',
        details: insertError.message,
      }, { status: 500 });
    }

    // 9. Update campaign status and recipient count
    await supabase
      .from('campaigns')
      .update({
        status: 'staged',
        total_recipients: validRows.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    return NextResponse.json({
      success: true,
      staged: validRows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('POST /api/campaigns/:id/generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
