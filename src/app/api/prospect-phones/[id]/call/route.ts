import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspectPhone } from '@/utils/prospect-phone-mapping';
import { getTemplate } from '@/lib/email/templates';
import { sendGmailEmail } from '@/lib/email/gmail-sender';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: prospectPhoneId } = await params;
    const body = await request.json();
    const {
        callerName,
        outcome,
        phoneUsed,
        email,
        extras,
        followUpAt,
        lockoutUntil,
        skipEmail
    } = body;

    if (!callerName || !outcome) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: currentPhone, error: fetchError } = await supabase
        .from('prospect_phones')
        .select('*, prospects(id, property_name, address, city, state, market, submarket, zip)')
        .eq('id', prospectPhoneId)
        .single();

    if (fetchError || !currentPhone) {
        return NextResponse.json({ error: 'Prospect phone not found' }, { status: 404 });
    }

    const prospectId = currentPhone.prospect_id;

    const phoneUpdate: Record<string, unknown> = {
        call_status: outcome,
        last_called_at: new Date().toISOString(),
        last_called_by: callerName,
        call_count: (currentPhone.call_count ?? 0) + 1,
        viewing_by: null,
        viewing_since: null,
        updated_at: new Date().toISOString()
    };
    if (email) phoneUpdate.contact_email = email;
    if (followUpAt) phoneUpdate.follow_up_at = followUpAt;
    if (lockoutUntil) phoneUpdate.lockout_until = lockoutUntil;
    if (extras) {
        phoneUpdate.extras = { ...(currentPhone.extras || {}), ...extras };
    }

    // Log call to prospect_calls table
    const { data: callLog, error: logError } = await supabase
        .from('prospect_calls')
        .insert({
            prospect_id: prospectId,
            prospect_phone_id: prospectPhoneId,
            caller_name: callerName,
            outcome,
            phone_used: phoneUsed || currentPhone.phone_number,
            email_captured: email,
            // Initialize LinkedIn automation
            linkedin_status: 'search_pending' // Will be processed by batch job at 6pm
        })
        .select()
        .single();

    if (logError) {
        console.error('Error logging call:', logError);
    } else {
        console.log(`[LinkedIn] Search scheduled for call ${callLog?.id} - will run at 6pm`);
    }

    const { data: updatedPhone, error: updateError } = await supabase
        .from('prospect_phones')
        .update(phoneUpdate)
        .eq('id', prospectPhoneId)
        .select(`
            *,
            prospects (
                id,
                property_name,
                address,
                city,
                state,
                market,
                submarket,
                zip
            ),
            prospect_calls (*)
        `)
        .order('called_at', { foreignTable: 'prospect_calls', ascending: false })
        .single();

    if (updateError) {
        console.error('Error updating prospect phone:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const mappedResult = mapProspectPhone(updatedPhone);

    const eligibleOutcomes = ['pending_signup', 'no_answer', 'invalid_number'];
    const finalOutcome = outcome === 'answered' ? 'pending_signup' : outcome;
    const isEmailTriggered = !skipEmail && email && eligibleOutcomes.includes(finalOutcome);

    if (isEmailTriggered && mappedResult.callHistory) {
        const latestCall = mappedResult.callHistory.find(c => c.callerName === callerName && c.outcome === outcome);
        if (latestCall) latestCall.emailStatus = 'pending';
    }

    if (isEmailTriggered) {
        const callLogId = updatedPhone.prospect_calls?.find((c: any) =>
            c.caller_name === callerName && c.outcome === outcome
        )?.id;

        const CALLER_EMAILS: Record<string, string> = {
            'Jeff': 'jeff@ozlistings.com',
            'Todd': 'todd@ozlistings.com',
            'Michael': 'michael@ozlistings.com',
            'Param': 'param@ozlistings.com',
            'Aryan': 'aryan@ozlistings.com'
        };

        (async () => {
            try {
                const prospect = updatedPhone.prospects;
                const { subject, html } = getTemplate(finalOutcome, {
                    prospectName: mappedResult.contactName || 'Developer',
                    propertyName: prospect?.property_name || 'Property',
                    callerName,
                    extras
                });
                const callerEmail = CALLER_EMAILS[callerName] || `${callerName.toLowerCase()}@ozlistings.com`;

                await sendGmailEmail({
                    to: email,
                    cc: callerEmail,
                    fromName: callerName,
                    subject,
                    html,
                    prospectId,
                    callLogId,
                    outcome: finalOutcome,
                    templateUsed: finalOutcome
                });
            } catch (error) {
                console.error('Follow-up email background error:', error);
            }
        })();
    }

    // ... existing email logic ...

    // --- LinkedIn Automation Trigger ---
    // Trigger for all outcomes
    // Run in background (fire and forget)
    (async () => {
        try {
            // Determine context (Company Name or Entity Name)
            // Priority: Entity Name -> Property Name
            const entityName = updatedPhone.entity_names?.split(',')[0]?.trim();
            const propertyName = updatedPhone.prospects?.property_name;
            const context = entityName || propertyName || '';

            if (!context) {
                console.log('[LinkedIn Trigger] Skipping: No context (Company/Property) available');
                return;
            }

            // First, update status to pending
            const { error: pendingError } = await supabase
                .from('prospect_calls')
                .update({ linkedin_status: 'search_pending' })
                .eq('id', logError ? '' : (updatedPhone.prospect_calls?.find((c: any) =>
                    c.caller_name === callerName && c.outcome === outcome && c.id // simplistic match, ideally we use the returned ID if we had it
                    // Better: we need the ID of the inserted call.
                    // Since we didn't return it from the insert above (createClient bug with insert vs select), 
                    // we rely on the select in updatedPhone.
                )?.id));

            // RE-FETCH the specific call ID we just created to be safe
            // The insert above didn't return data. The update below fetched updatedPhone.
            // We need to find the specific call log ID.
            const latestCallLog = updatedPhone.prospect_calls?.sort((a: any, b: any) =>
                new Date(b.called_at).getTime() - new Date(a.called_at).getTime()
            )[0];

            if (latestCallLog) {
                // Set pending
                await supabase.from('prospect_calls').update({ linkedin_status: 'search_pending' }).eq('id', latestCallLog.id);

                // Trigger Search
                const { processLinkedInSearchForCall } = await import('@/lib/services/tavily');
                await processLinkedInSearchForCall(
                    latestCallLog.id,
                    prospectPhoneId,
                    updatedPhone.phone_number,
                    context
                );
            }

        } catch (err) {
            console.error('[LinkedIn Trigger] Failed to trigger search:', err);
        }
    })();

    return NextResponse.json({ success: true, data: mappedResult });
}
