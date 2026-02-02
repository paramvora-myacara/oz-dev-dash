import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspect } from '@/utils/prospect-mapping';
import { getTemplate } from '@/lib/email/templates';
import { sendGmailEmail } from '@/lib/email/gmail-sender';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const {
        callerName,
        outcome,
        phoneUsed,
        email,
        extras,
        followUpAt,
        lockoutUntil
    } = body;

    if (!callerName || !outcome) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get current data to merge updates
    const { data: currentProspect, error: fetchError } = await supabase
        .from('prospects')
        .select('phone_numbers, extras')
        .eq('id', id)
        .single();

    if (fetchError || !currentProspect) {
        return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // 2. Update the phone number entry
    const updatedPhoneNumbers = (currentProspect.phone_numbers || []).map((p: any) => {
        if (p.number === phoneUsed) {
            return {
                ...p,
                lastCalledAt: new Date().toISOString(),
                callCount: (p.callCount || 0) + 1,
                contactEmail: email || p.contactEmail // Update email if provided
            };
        }
        return p;
    });

    // 3. Prepare prospect update
    const prospectUpdate: any = {
        phone_numbers: updatedPhoneNumbers,
        call_status: outcome,
        last_called_at: new Date().toISOString(),
        last_called_by: callerName,
        extras: { ...(currentProspect.extras || {}), ...(extras || {}) },
        viewing_by: null, // Release lock after call
        viewing_since: null
    };

    if (followUpAt) prospectUpdate.follow_up_at = followUpAt;
    if (lockoutUntil) prospectUpdate.lockout_until = lockoutUntil;

    // 4. Insert call log
    const { error: logError } = await supabase
        .from('prospect_calls')
        .insert({
            prospect_id: id,
            caller_name: callerName,
            outcome: outcome,
            phone_used: phoneUsed,
            email_captured: email
        });

    if (logError) {
        console.error('Error logging call:', logError);
    }

    // 5. Update prospect and return fresh data with history
    const { data: updatedProspect, error: updateError } = await supabase
        .from('prospects')
        .update(prospectUpdate)
        .eq('id', id)
        .select('*, prospect_calls(*)')
        .single();

    if (updateError) {
        console.error('Error updating prospect:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 6. Trigger follow-up email (Async)
    const eligibleOutcomes = ['pending_signup', 'no_answer', 'invalid_number'];
    const finalOutcome = outcome === 'answered' ? 'pending_signup' : outcome;

    if (email && eligibleOutcomes.includes(finalOutcome)) {
        console.log(`[CallRoute] Triggering background follow-up for ${finalOutcome} (Recipient: ${email})`);
        // Find the newly created call log ID
        const callLogId = updatedProspect.prospect_calls?.find((c: any) =>
            c.caller_name === callerName && c.outcome === finalOutcome
        )?.id;

        const CALLER_EMAILS: Record<string, string> = {
            'Jeff': 'jeff@ozlistings.com',
            'Todd': 'todd@ozlistings.com',
            'Michael': 'michael@ozlistings.com',
            'Param': 'param@ozlistings.com'
        };

        // Fire and forget (don't await) or handle errors silently
        (async () => {
            try {
                const { subject, html } = getTemplate(finalOutcome, {
                    prospectName: updatedProspect.owner_name,
                    propertyName: updatedProspect.property_name,
                    callerName: callerName,
                    extras: extras
                });

                const callerEmail = 'aryan@ozlistings.com'; // TEST OVERRIDE
                const testRecipientEmail = 'aryan.jain@capmatch.com'; // TEST OVERRIDE

                console.log(`[CallRoute] Background sending ${finalOutcome} email via Gmail. (Overridden to: ${testRecipientEmail})`);

                const result = await sendGmailEmail({
                    to: testRecipientEmail,
                    cc: callerEmail,
                    subject,
                    html,
                    prospectId: id,
                    callLogId,
                    outcome: finalOutcome,
                    templateUsed: finalOutcome
                });

                console.log(`[CallRoute] Background send task result:`, result);
            } catch (error) {
                console.error('Follow-up email background error:', error);
            }
        })();
    }

    return NextResponse.json({ success: true, data: mapProspect(updatedProspect) });
}
