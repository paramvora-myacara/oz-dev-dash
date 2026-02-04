import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspectPhone } from '@/utils/prospect-phone-mapping';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userName } = await request.json();

    if (!userName) {
        return NextResponse.json({ error: 'User name is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get the phone number for this ID
    const { data: phoneRow, error: phoneError } = await supabase
        .from('prospect_phones')
        .select('phone_number')
        .eq('id', id)
        .single();

    if (phoneError || !phoneRow) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const phoneNumber = phoneRow.phone_number;

    // 2. Clear any existing locks held by this user elsewhere
    await supabase
        .from('prospect_phones')
        .update({ viewing_by: null, viewing_since: null })
        .eq('viewing_by', userName);

    // 3. Check if any row with this phone number is locked by someone else
    const { data: existingLocks } = await supabase
        .from('prospect_phones')
        .select('viewing_by')
        .eq('phone_number', phoneNumber)
        .not('viewing_by', 'is', null)
        .neq('viewing_by', userName);

    if (existingLocks && existingLocks.length > 0) {
        return NextResponse.json({
            error: `This contact is currently being viewed by ${existingLocks[0].viewing_by}.`
        }, { status: 409 });
    }

    // 4. Acquire lock on all rows with this phone number
    const { data, error } = await supabase
        .from('prospect_phones')
        .update({
            viewing_by: userName,
            viewing_since: new Date().toISOString()
        })
        .eq('phone_number', phoneNumber)
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
        `);

    if (error || !data || data.length === 0) {
        console.error('Error acquiring lock:', error);
        return NextResponse.json({ error: 'Could not acquire lock.' }, { status: 409 });
    }

    // Return the specific ID requested (it will be one of the locked rows)
    const requestedRow = data.find(r => r.id === id) || data[0];
    return NextResponse.json({ success: true, data: mapProspectPhone(requestedRow) });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userName } = await request.json();

    const supabase = await createClient();

    // 1. Get the phone number for this ID
    const { data: phoneRow } = await supabase
        .from('prospect_phones')
        .select('phone_number')
        .eq('id', id)
        .single();

    if (!phoneRow) {
        return NextResponse.json({ success: true }); // Already gone or never existed
    }

    // 2. Release lock on all rows with this phone number held by this user
    const { error } = await supabase
        .from('prospect_phones')
        .update({ viewing_by: null, viewing_since: null })
        .eq('phone_number', phoneRow.phone_number)
        .eq('viewing_by', userName);

    if (error) {
        console.error('Error releasing lock:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
