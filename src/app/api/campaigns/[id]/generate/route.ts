import { NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import Papa from 'papaparse';
import { generateUnsubscribeUrl } from '@/lib/email/unsubscribe';
import type { Section } from '@/types/email-editor';

// Helper to replace template variables (only used for subject line here)
const replaceVariables = (text: string, row: Record<string, string>): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = row[varName] || row[varName.toLowerCase()] || row[varName.toUpperCase()];
    return value !== undefined ? value : match;
  });
};

// POST /api/campaigns/:id/generate
// NOW RENAMED LOGICALLY TO "IMPORT & STAGE" - AI Generation happens at send-time
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const encoder = new TextEncoder();

  // Helper to send SSE event
  const sendEvent = (controller: ReadableStreamDefaultController, data: object) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
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
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (campaign.status !== 'draft') {
      return new Response(JSON.stringify({ error: 'Can only import emails for draft campaigns' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Parse CSV from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'CSV file is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const csvText = await file.text();
    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
    });

    if (parseResult.errors.length > 0) {
      return new Response(JSON.stringify({
        error: 'CSV parsing failed',
        details: parseResult.errors.map(e => e.message),
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rows = parseResult.data;
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'CSV file is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Validate required Email column
    const firstRow = rows[0];
    if (!('Email' in firstRow) && !('email' in firstRow)) {
      return new Response(JSON.stringify({
        error: 'CSV must have an "Email" column',
        availableColumns: Object.keys(firstRow),
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Validate emails and detect duplicates
    const seenEmails = new Set<string>();
    const errors: string[] = [];
    const validRows: Array<{ row: Record<string, string>; email: string }> = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const emailField = (row.Email || row.email || '').trim();

      if (!emailField) {
        errors.push(`Row ${i + 2}: Missing email`);
        continue;
      }

      const emailAddresses = emailField.split(',').map(e => e.trim()).filter(e => e.length > 0);

      if (emailAddresses.length === 0) {
        errors.push(`Row ${i + 2}: Missing email`);
        continue;
      }

      const validEmails: string[] = [];
      for (const email of emailAddresses) {
        const normalizedEmail = email.toLowerCase().trim();

        if (!normalizedEmail) continue;

        if (!emailRegex.test(normalizedEmail)) {
          errors.push(`Row ${i + 2}: Invalid email format "${email}"`);
          continue;
        }

        if (seenEmails.has(normalizedEmail)) {
          errors.push(`Row ${i + 2}: Duplicate email "${email}"`);
          continue;
        }

        seenEmails.add(normalizedEmail);
        validEmails.push(normalizedEmail);
      }

      for (const email of validEmails) {
        validRows.push({ row, email });
      }
    }

    if (validRows.length === 0) {
      return new Response(JSON.stringify({
        error: 'No valid recipients found',
        details: errors,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create streaming response for progress
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 5. Delete any existing staged emails for this campaign
          await supabase
            .from('email_queue')
            .delete()
            .eq('campaign_id', campaignId)
            .eq('status', 'staged');

          sendEvent(controller, { type: 'start', total: validRows.length });

          const subjectLineContent = campaign.subject_line?.content || '';

          // 8. Prepare rows (NO AI GENERATION HERE)
          // We set body to empty string. The Worker will detect this and generate content at send-time.
          const queueRows = validRows.map(({ row, email }) => {
            const subject = replaceVariables(subjectLineContent, row);

            return {
              campaign_id: campaignId,
              to_email: email,
              subject,
              body: "", // EMPTY BODY -> TRIGGER SEND-TIME GENERATION
              status: 'staged',
              metadata: row,
              is_edited: false,
              from_email: null,
              domain_index: null,
              scheduled_for: null,
              delay_seconds: 0,
            };
          });

          sendEvent(controller, { type: 'phase', phase: 'inserting' });

          // 9. Bulk insert in chunks to avoid timeout
          const CHUNK_SIZE = 100;
          for (let i = 0; i < queueRows.length; i += CHUNK_SIZE) {
            const chunk = queueRows.slice(i, i + CHUNK_SIZE);
            const { error: insertError } = await supabase
              .from('email_queue')
              .insert(chunk);

            if (insertError) {
              throw new Error(`Failed to insert emails: ${insertError.message}`);
            }

            sendEvent(controller, {
              type: 'insert_progress',
              completed: Math.min(i + CHUNK_SIZE, queueRows.length),
              total: queueRows.length
            });
          }

          // 10. Update campaign status
          await supabase
            .from('campaigns')
            .update({
              status: 'staged',
              total_recipients: validRows.length,
              updated_at: new Date().toISOString(),
            })
            .eq('id', campaignId);

          sendEvent(controller, {
            type: 'done',
            success: true,
            staged: validRows.length,
            errors: errors.length > 0 ? errors : undefined,
          });

        } catch (error) {
          console.error('Stream error:', error);
          sendEvent(controller, {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('POST /api/campaigns/:id/generate error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
