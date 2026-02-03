import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspectPhone } from '@/utils/prospect-phone-mapping';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const state = searchParams.get('state');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    let query = supabase
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
        `, { count: 'exact' })
        .order('called_at', { foreignTable: 'prospect_calls', ascending: false });

    // Full-text search on prospect_phones
    if (search) {
        query = query.textSearch('search_vector', search);
    }

    // State filter via prospect_id: get matching prospect ids
    if (state && state !== 'ALL') {
        const { data: prospectsInState } = await supabase.from('prospects').select('id').eq('state', state);
        const prospectIds = (prospectsInState || []).map((p: { id: string }) => p.id);
        if (prospectIds.length > 0) {
            query = query.in('prospect_id', prospectIds);
        } else {
            query = query.eq('prospect_id', '00000000-0000-0000-0000-000000000000');
        }
    }

    // Status filter
    if (status) {
        const statusFilters = status.split(',').map(s => s.trim());
        const callStatusFilters: string[] = [];
        const hasNeverContacted = statusFilters.includes('NEVER_CONTACTED');
        const hasLocked = statusFilters.includes('LOCKED');

        if (statusFilters.includes('FOLLOW_UP')) callStatusFilters.push('follow_up');
        if (statusFilters.includes('PENDING_SIGNUP')) callStatusFilters.push('pending_signup');
        if (statusFilters.includes('INVALID_NUMBER')) callStatusFilters.push('invalid_number');
        if (statusFilters.includes('NO_ANSWER')) callStatusFilters.push('no_answer');
        if (hasNeverContacted) callStatusFilters.push('new');

        if (callStatusFilters.length > 0) {
            if (callStatusFilters.length === 1) {
                query = query.eq('call_status', callStatusFilters[0]);
            } else {
                query = query.in('call_status', callStatusFilters);
            }
        }
        if (callStatusFilters.length === 0 && hasLocked) {
            query = query.gt('lockout_until', new Date().toISOString());
        }
    }

    query = query
        .order('created_at', { ascending: false, nullsFirst: false })
        .order('phone_number', { ascending: true })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching prospect phones:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data: (data || []).map(mapProspectPhone),
        count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    });
}
