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

    await supabase
        .from('prospect_phones')
        .update({ viewing_by: null, viewing_since: null })
        .eq('viewing_by', userName);

    const { data, error } = await supabase
        .from('prospect_phones')
        .update({
            viewing_by: userName,
            viewing_since: new Date().toISOString()
        })
        .eq('id', id)
        .is('viewing_by', null)
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
        .single();

    if (error) {
        console.error('Error acquiring lock:', error);
        return NextResponse.json({ error: 'Could not acquire lock. It may be locked by someone else.' }, { status: 409 });
    }

    return NextResponse.json({ success: true, data: mapProspectPhone(data) });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userName } = await request.json();

    const supabase = await createClient();

    const { error } = await supabase
        .from('prospect_phones')
        .update({ viewing_by: null, viewing_since: null })
        .eq('id', id)
        .eq('viewing_by', userName);

    if (error) {
        console.error('Error releasing lock:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
