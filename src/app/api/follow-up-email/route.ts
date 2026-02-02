import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendGmailEmail } from '@/lib/email/gmail-sender';
import { getTemplate } from '@/lib/email/templates';

const CALLER_EMAILS: Record<string, string> = {
    'Jeff': 'jeff@ozlistings.com',
    'Todd': 'todd@ozlistings.com',
    'Michael': 'michael@ozlistings.com',
    'Param': 'param@ozlistings.com'
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prospectId, callerName, outcome, email, extras, callLogId } = body;

        console.log(`[FollowUpAPI] Received request for prospect: ${prospectId}, outcome: ${outcome}`);

        if (!prospectId || !callerName || !outcome || !email) {
            console.warn('[FollowUpAPI] Missing required fields in request body');
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        // Fetch prospect details for template
        const { data: prospect, error: fetchError } = await supabase
            .from('prospects')
            .select('owner_name, property_name')
            .eq('id', prospectId)
            .single();

        if (fetchError || !prospect) {
            return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
        }

        // Get template
        try {
            const { subject, html } = getTemplate(outcome, {
                prospectName: prospect.owner_name,
                propertyName: prospect.property_name,
                callerName: callerName,
                extras: extras
            });

            const callerEmail = CALLER_EMAILS[callerName] || `${callerName.toLowerCase()}@ozlistings.com`;
            const testRecipientEmail = 'aryan@ozlistings.com'; // TEST RECIPIENT

            console.log(`[FollowUpAPI] Sending ${outcome} email. Recipient: ${testRecipientEmail}, CC: ${callerEmail}, From: ${callerName}`);

            // Send email
            const result = await sendGmailEmail({
                to: testRecipientEmail,
                cc: callerEmail,
                fromName: callerName,
                subject,
                html,
                prospectId,
                callLogId,
                outcome,
                templateUsed: outcome
            });

            console.log(`[FollowUpAPI] Send result:`, result);
            return NextResponse.json(result);
        } catch (templateError: any) {
            console.error('Template error:', templateError);
            return NextResponse.json({
                success: false,
                error: `No template for outcome: ${outcome}`
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('API Error in follow-up-email:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
