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

    const rawPhones = (data || []).map(mapProspectPhone);
    const aggregated = new Map<string, any>();

    for (const phone of rawPhones) {
        if (!aggregated.has(phone.phoneNumber)) {
            aggregated.set(phone.phoneNumber, {
                ...phone,
                prospect: undefined, // Remove single prospect link
                propertyCount: 0,
                properties: []
            });
        }

        const agg = aggregated.get(phone.phoneNumber);
        agg.propertyCount++;

        if (phone.prospect) {
            agg.properties.push({
                id: phone.id,
                prospectId: phone.prospect.id,
                propertyName: phone.prospect.propertyName,
                address: phone.prospect.address,
                city: phone.prospect.city,
                state: phone.prospect.state,
                market: phone.prospect.market,
                submarket: phone.prospect.submarket,
                zip: phone.prospect.zip,
                callStatus: phone.callStatus
            });
        }
    }

    return NextResponse.json({ data: Array.from(aggregated.values()) });
}
