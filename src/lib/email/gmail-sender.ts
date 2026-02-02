import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = 'communications@ozlistings.com';

export async function sendGmailEmail({
    to,
    cc,
    fromName,
    subject,
    html,
    prospectId,
    callLogId,
    outcome,
    templateUsed
}: {
    to: string;
    cc?: string;
    fromName?: string;
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
        const fromHeader = fromName ? `${fromName} <${GMAIL_USER}>` : `OZListings <${GMAIL_USER}>`;
        const messageParts = [
            `From: ${fromHeader}`,
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

        // Log success to calls table
        if (callLogId) {
            await supabase.from('prospect_calls').update({
                email_status: 'sent',
                email_template: templateUsed,
                email_message_id: res.data.id,
                email_error: null
            }).eq('id', callLogId);
        }

        return { success: true, messageId: res.data.id };

    } catch (error: any) {
        console.error('Failed to send Gmail email:', error);

        // Log failure to calls table
        if (callLogId) {
            await supabase.from('prospect_calls').update({
                email_status: 'failed',
                email_error: error.message || String(error),
                email_template: templateUsed
            }).eq('id', callLogId);
        }

        return { success: false, error: error.message };
    }
}
