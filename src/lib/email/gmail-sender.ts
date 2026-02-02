import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = 'communications@ozlistings.com';

export async function sendGmailEmail({
    to,
    cc,
    subject,
    html,
    prospectId,
    callLogId,
    outcome,
    templateUsed
}: {
    to: string;
    cc?: string;
    subject: string;
    html: string;
    prospectId: string;
    callLogId?: string;
    outcome: string;
    templateUsed: string;
}) {
    const supabase = await createClient();

    try {
        if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
            throw new Error('Missing Gmail OAuth credentials in environment variables');
        }

        const oauth2Client = new google.auth.OAuth2(
            GMAIL_CLIENT_ID,
            GMAIL_CLIENT_SECRET,
            'https://oauth2.googleapis.com/token' // This doesn't matter for refresh token flow
        );

        oauth2Client.setCredentials({
            refresh_token: GMAIL_REFRESH_TOKEN
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Build the email message
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: OZListings <${GMAIL_USER}>`,
            `To: ${to}`,
            cc ? `Cc: ${cc}` : null,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            html,
        ].filter(Boolean);

        const message = messageParts.join('\n');

        // The body needs to be base64url encoded
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        // Log to audit table
        await supabase.from('prospect_follow_up_emails').insert({
            prospect_id: prospectId,
            call_log_id: callLogId,
            caller_name: cc ? cc.split('@')[0] : 'System',
            to_email: to,
            outcome: outcome,
            template_used: templateUsed,
            gmail_message_id: res.data.id,
            status: 'sent'
        });

        return { success: true, messageId: res.data.id };

    } catch (error: any) {
        console.error('Failed to send Gmail email:', error);

        // Log failure to audit table
        await supabase.from('prospect_follow_up_emails').insert({
            prospect_id: prospectId,
            call_log_id: callLogId,
            caller_name: cc ? cc.split('@')[0] : 'System',
            to_email: to,
            outcome: outcome,
            template_used: templateUsed,
            status: 'failed',
            error: error.message || String(error)
        });

        return { success: false, error: error.message };
    }
}
