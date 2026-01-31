import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspect } from '@/utils/prospect-mapping';

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
        .from('prospects')
        .select('*, prospect_calls(*)', { count: 'exact' });

    // Text Search
    if (search) {
        query = query.textSearch('property_name', search);
    }

    // State Filter
    if (state && state !== 'ALL') {
        query = query.eq('state', state);
    }

    // Status Filter (Custom Logic)
    if (status) {
        const statusFilters = status.split(',');

        const conditions = [];

        if (statusFilters.includes('AVAILABLE')) {
            conditions.push('lockout_until.is.null', 'lockout_until.lt.now()');
        }

        if (statusFilters.includes('LOCKED')) {
            conditions.push('lockout_until.gt.now()');
        }

        if (statusFilters.includes('FOLLOW_UP')) {
            conditions.push('call_status.eq.follow_up');
        }

        if (statusFilters.includes('PENDING_SIGNUP')) {
            conditions.push('call_status.eq.pending_signup');
        }

        if (conditions.length > 0) {
            // This is a bit tricky with Supabase's chained or(...) if we want cross-column OR
            // For now, let's keep it simple or use a single filter if only one provided
            if (statusFilters.length === 1) {
                if (statusFilters[0] === 'AVAILABLE') query = query.or('lockout_until.is.null,lockout_until.lt.now()');
                else if (statusFilters[0] === 'LOCKED') query = query.gt('lockout_until', new Date().toISOString());
                else if (statusFilters[0] === 'FOLLOW_UP') query = query.eq('call_status', 'follow_up');
                else if (statusFilters[0] === 'PENDING_SIGNUP') query = query.eq('call_status', 'pending_signup');
            }
            // If multiple, would need complex .or(...)
        }
    }

    // Pagination
    query = query
        .order('property_name', { ascending: true })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching prospects:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data: (data || []).map(mapProspect),
        count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    });
}
