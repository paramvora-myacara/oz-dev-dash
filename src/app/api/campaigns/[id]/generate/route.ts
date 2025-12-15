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

    // Allow re-generating (re-staging) if status is draft OR staged associated with edits
    // But strictly speaking, we usually only allow import in draft.
    // If simplifying, let's keep it draft or staged.
    if (!['draft', 'staged'].includes(campaign.status)) {
      return new Response(JSON.stringify({ error: 'Can only import emails for draft/staged campaigns' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Determine Source: CSV or Database
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const useDatabaseRecipients = formData.get('useDatabaseRecipients') === 'true';

    let validRows: Array<{ row: Record<string, string>; email: string }> = [];
    const errors: string[] = [];

    // --- PATH A: CSV Upload ---
    if (file) {
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

      // Validate required Email column
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
          validEmails.push(normalizedEmail);
        }

        for (const email of validEmails) {
          validRows.push({ row, email });
        }
      }
    }
    // --- PATH B: Database Recipients ---
    else if (useDatabaseRecipients) {
      // Fetch from campaign_recipients joined with contacts
      const { data: recipients, error: fetchError } = await supabase
        .from('campaign_recipients')
        .select(`
          status,
          contact_id,
          selected_email,
          contacts (
            name,
            email,
            company,
            role,
            location,
            phone_number,
            details
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'selected');

      if (fetchError) {
        return new Response(JSON.stringify({ error: 'Failed to fetch recipients: ' + fetchError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!recipients || recipients.length === 0) {
        return new Response(JSON.stringify({ error: 'No selected recipients found in database' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Map to consistent structure
      // We assume 'contacts' fields map to what we want in 'row' (metadata)
      for (const r of recipients) {
        // Handle contacts being returned as array or single object depending on Supabase client version/types
        const contactData = Array.isArray(r.contacts) ? r.contacts[0] : r.contacts;

        if (!contactData) continue;

        // Use selected_email if specific choice was made, else contact.email (could be multiple, but we default to first here ideally or raw)
        // If contact.email is "a, b", we really should have selected_email logic handle it.
        // For now, if no selected_email, we take the first valid one from contact.email
        let targetEmail = r.selected_email;

        if (!targetEmail) {
          const emails = (contactData.email || '').split(',').map((e: string) => e.trim()).filter((e: string) => e);
          if (emails.length > 0) targetEmail = emails[0];
        }

        if (!targetEmail) {
          errors.push(`Contact ${r.contact_id} has no valid email`);
          continue;
        }

        // Flatten contact data for metadata use ({{Name}}, {{Company}})
        // We prioritize explicit fields over JSON details
        const row: Record<string, string> = {
          ...((contactData.details as Record<string, string>) || {}), // Spread details first so standard fields overwrite
          Name: contactData.name || '',
          Email: targetEmail,
          Company: contactData.company || '',
          Role: contactData.role || '',
          Location: contactData.location || '',
        };

        // Remove duplicates where details might have lowercase versions of standard fields
        // e.g. if details has 'name', remove it since we have 'Name'
        delete row['name'];
        delete row['email'];
        delete row['company'];
        delete row['role'];
        delete row['location'];


        validRows.push({ row, email: targetEmail });
      }

    } else {
      return new Response(JSON.stringify({ error: 'CSV file OR usage of database recipients is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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
          // Only if we are doing a fresh import (which this route implies)
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
          // Also update total_recipients to match the valid set
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
