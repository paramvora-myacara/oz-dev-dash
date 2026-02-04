import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspectPhone } from '@/utils/prospect-phone-mapping';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || null;
    const state = searchParams.get('state');
    const status = searchParams.get('status');
    const roles = searchParams.get('roles');
    const minProperties = parseInt(searchParams.get('minProperties') || '1');
    const maxProperties = searchParams.get('maxProperties') ? parseInt(searchParams.get('maxProperties')!) : null;
    const sortBy = searchParams.get('sortBy') || 'property_count';
    const sortDir = searchParams.get('sortDir') || 'DESC';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createClient();

    const stateFilter = (state && state !== 'ALL') ? state : null;

    let statusFilters: string[] | null = null;
    if (status && status.length > 0) {
        statusFilters = status.split(',').map(s => s.trim());
    }

    let roleFilters: string[] | null = null;
    if (roles && roles.length > 0) {
        roleFilters = roles.split(',').map(s => s.trim());
    }

    // 1. Fetch Unique Phones via RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_unique_prospect_phones', {
        p_page: page,
        p_limit: limit,
        p_search: search,
        p_state_filter: stateFilter,
        p_status_filters: statusFilters,
        p_role_filters: roleFilters,
        p_min_properties: minProperties,
        p_max_properties: maxProperties,
        p_sort_by: sortBy,
        p_sort_dir: sortDir
    });

    if (rpcError) {
        console.error('Error fetching unique prospect phones:', rpcError);
        return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    if (!rpcData || rpcData.length === 0) {
        return NextResponse.json({
            data: [],
            count: 0,
            page,
            totalPages: 0
        });
    }

    const totalCount = rpcData[0].full_count;
    const phoneNumbers = rpcData.map((row: any) => row.phone_number);

    // 2. Fetch All Details for these phones
    const { data: detailsData, error: detailsError } = await supabase
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
        .in('phone_number', phoneNumbers)
        .order('called_at', { foreignTable: 'prospect_calls', ascending: false })
        .limit(5000);

    if (detailsError) {
        console.error('Error fetching details:', detailsError);
        return NextResponse.json({ error: detailsError.message }, { status: 500 });
    }

    // 3. Aggregate in Memory
    const aggregatedMap = new Map();

    // Initialize with RPC data to preserve order and primary metadata
    rpcData.forEach((row: any) => {
        aggregatedMap.set(row.phone_number, {
            id: row.id, // The 'best_id' selected by RPC
            phoneNumber: row.phone_number,
            propertyCount: parseInt(row.property_count),
            callStatus: row.call_status,
            lockoutUntil: row.lockout_until,
            followUpAt: row.follow_up_at,
            createdAt: row.created_at,
            // placeholders
            labels: [],
            contactName: null,
            contactEmail: null,
            entityNames: null,
            lastCalledAt: null,
            lastCalledBy: null,
            callCount: 0,
            properties: [],
            callHistory: []
        });
    });

    (detailsData || []).forEach((item: any) => {
        const agg = aggregatedMap.get(item.phone_number);
        if (!agg) return;

        // Merge Details
        if (item.labels && Array.isArray(item.labels)) {
            item.labels.forEach((l: string) => {
                if (!agg.labels.includes(l)) agg.labels.push(l);
            });
        }

        if (!agg.contactName && item.contact_name) agg.contactName = item.contact_name;
        if (!agg.contactEmail && item.contact_email) agg.contactEmail = item.contact_email;

        if (item.id === agg.id) {
            agg.entityNames = item.entity_names;
            agg.lastCalledAt = item.last_called_at;
            agg.lastCalledBy = item.last_called_by;
        }

        agg.callCount += (item.call_count || 0);

        // Add to properties list
        if (item.prospects) {
            agg.properties.push({
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
                labels: item.labels || []
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
            agg.callHistory.push(...histories);
        }
    });

    // Final Sort of Call History & Cleanup
    const results = Array.from(aggregatedMap.values()).map(agg => {
        agg.callHistory.sort((a: any, b: any) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());

        if (!agg.entityNames && agg.properties.length > 0) {
            agg.entityNames = agg.properties[0].propertyName;
        }

        return agg;
    });

    return NextResponse.json({
        data: results,
        count: totalCount,
        page,
        totalPages: Math.ceil((totalCount || 0) / limit)
    });
}
