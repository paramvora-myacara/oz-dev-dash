import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspectPhone } from '@/utils/prospect-phone-mapping';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number');

    if (!number) {
        return NextResponse.json({ error: 'Missing number' }, { status: 400 });
    }

    // Normalize number
    const normalized = number.replace(/\D/g, '').trim();
    if (!normalized) {
        return NextResponse.json({ error: 'Invalid number' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('prospect_phones')
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
            )
        `)
        .ilike('phone_number', `%${normalized}%`)
        .limit(5);

    if (error) {
        console.error('Error checking phone:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: (data || []).map(mapProspectPhone) });
}
