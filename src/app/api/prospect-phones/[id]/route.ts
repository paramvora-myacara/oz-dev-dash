import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspectPhone } from '@/utils/prospect-phone-mapping';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Get the target phone number first
    const { data: initial, error: initialError } = await supabase
        .from('prospect_phones')
        .select('phone_number')
        .eq('id', id)
        .single();

    if (initialError || !initial) {
        return NextResponse.json({ error: 'Prospect phone not found' }, { status: 404 });
    }

    const phoneNumber = initial.phone_number;

    // 2. Fetch ALL properties and history for this phone number
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
            ),
            prospect_calls (*)
        `)
        .eq('phone_number', phoneNumber)
        .order('called_at', { foreignTable: 'prospect_calls', ascending: false });

    if (error || !data || data.length === 0) {
        return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
    }

    // 3. Aggregate
    const first = data[0];
    const aggregated: any = {
        id: id, // Preserve the ID that was requested
        phoneNumber: phoneNumber,
        propertyCount: data.length,
        callStatus: first.call_status,
        lockoutUntil: first.lockout_until,
        followUpAt: first.follow_up_at,
        createdAt: first.created_at,
        labels: [],
        contactName: null,
        contactEmail: null,
        entityNames: null,
        lastCalledAt: null,
        lastCalledBy: null,
        callCount: 0,
        properties: [],
        callHistory: []
    };

    data.forEach((item: any) => {
        if (item.labels && Array.isArray(item.labels)) {
            item.labels.forEach((l: string) => {
                if (!aggregated.labels.includes(l)) aggregated.labels.push(l);
            });
        }
        if (!aggregated.contactName && item.contact_name) aggregated.contactName = item.contact_name;
        if (!aggregated.contactEmail && item.contact_email) aggregated.contactEmail = item.contact_email;

        // Use details from the specific ID row if it matches, otherwise fallback
        if (item.id === id) {
            aggregated.entityNames = item.entity_names;
            aggregated.lastCalledAt = item.last_called_at;
            aggregated.lastCalledBy = item.last_called_by;
            aggregated.callStatus = item.call_status;
        }

        aggregated.callCount += (item.call_count || 0);

        if (item.prospects) {
            aggregated.properties.push({
                id: item.id,
                prospectId: item.prospects.id,
                propertyName: item.prospects.property_name,
                address: item.prospects.address,
                city: item.prospects.city,
                state: item.prospects.state,
                market: item.prospects.market,
                submarket: item.prospects.submarket,
                zip: item.prospects.zip,
                callStatus: item.call_status,
                labels: item.labels || [],
                entityNames: item.entity_names
            });
        }

        if (item.prospect_calls) {
            const histories = item.prospect_calls.map((c: any) => ({
                id: c.id,
                callerName: c.caller_name,
                outcome: c.outcome,
                phoneUsed: c.phone_used,
                email: c.email_captured,
                calledAt: c.called_at,
                emailStatus: c.email_status,
                emailError: c.email_error
            }));
            aggregated.callHistory.push(...histories);
        }
    });

    // Ensure entityNames exists
    if (!aggregated.entityNames && aggregated.properties.length > 0) {
        aggregated.entityNames = aggregated.properties[0].propertyName;
    }

    // Sort history
    aggregated.callHistory.sort((a: any, b: any) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());

    // Sort properties by role priority: OWNER > MANAGER > other
    const rolePriority: Record<string, number> = {
        'OWNER': 100,
        'MANAGER': 80,
    };

    const getBestRoleScore = (labels: string[]) => {
        if (!labels || labels.length === 0) return 0;
        return Math.max(...labels.map(l => rolePriority[l.toUpperCase()] || 0));
    };

    aggregated.properties.sort((a: any, b: any) => {
        const scoreA = getBestRoleScore(a.labels);
        const scoreB = getBestRoleScore(b.labels);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.propertyName.localeCompare(b.propertyName); // Fallback to name sort
    });

    return NextResponse.json({ data: aggregated });
}
