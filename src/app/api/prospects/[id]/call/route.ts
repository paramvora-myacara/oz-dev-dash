import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspect } from '@/utils/prospect-mapping';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
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

    // 1. Get current phone numbers to update the specific one
    const { data: prospect, error: fetchError } = await supabase
        .from('prospects')
        .select('phone_numbers')
        .eq('id', id)
        .single();

    if (fetchError || !prospect) {
        return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // 2. Update the phone number entry
    const updatedPhoneNumbers = prospect.phone_numbers.map((p: any) => {
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
        extras: extras || {},
        viewing_by: null, // Release lock after call
        viewing_since: null
    };

    if (followUpAt) prospectUpdate.follow_up_at = followUpAt;
    if (lockoutUntil) prospectUpdate.lockout_until = lockoutUntil;

    // 4. Update prospect and insert call record in a transaction (simulated)
    const { data: updatedProspect, error: updateError } = await supabase
        .from('prospects')
        .update(prospectUpdate)
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating prospect:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 5. Insert call log
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
        // Note: Prospect was already updated, so we might want to handle this better in a real txn
    }

    return NextResponse.json({ success: true, data: mapProspect(updatedProspect) });
}
