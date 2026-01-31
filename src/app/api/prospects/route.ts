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
        const statusFilters = status.split(',').map(s => s.trim());

        // Separate filters by type
        const callStatusFilters: string[] = [];
        const hasAvailable = statusFilters.includes('AVAILABLE');
        const hasLocked = statusFilters.includes('LOCKED');

        if (statusFilters.includes('FOLLOW_UP')) {
            callStatusFilters.push('follow_up');
        }
        if (statusFilters.includes('PENDING_SIGNUP')) {
            callStatusFilters.push('pending_signup');
        }
        if (statusFilters.includes('INVALID_NUMBER')) {
            callStatusFilters.push('invalid_number');
        }

        // Apply call_status filters using .in() for multiple values
        if (callStatusFilters.length > 0) {
            if (callStatusFilters.length === 1) {
                query = query.eq('call_status', callStatusFilters[0]);
            } else {
                query = query.in('call_status', callStatusFilters);
            }
        }

        // Apply lockout_until filters (only if no call_status filters are selected)
        // If both types are selected, we apply call_status filters and ignore lockout filters
        // This means selecting INVALID_NUMBER will only show invalid_number, not available/locked ones
        if (callStatusFilters.length === 0) {
            if (hasAvailable && hasLocked) {
                // If both selected, show all (no filter needed)
            } else if (hasAvailable) {
                query = query.or('lockout_until.is.null,lockout_until.lt.now()');
            } else if (hasLocked) {
                query = query.gt('lockout_until', new Date().toISOString());
            }
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
