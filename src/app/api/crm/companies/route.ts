import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    console.log('[API] GET /api/crm/companies - Start');
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || 'all';

    console.log(`[API] Params: page=${page}, limit=${limit}, search="${search}", tag="${tag}"`);

    // Removed heavy person_organizations join to fix timeout issues
    let query = supabase
        .from('organizations')
        .select('*', { count: 'exact' });

    if (search) {
        const ftsQuery = search.trim().split(/\s+/).join(' & ');
        console.log(`[API] Applying text search: ${ftsQuery}`);
        query = query.textSearch('search_vector', ftsQuery);
    }

    if (tag && tag !== 'all') {
        console.log(`[API] Applying tag filter: ${tag}`);
        query = query.eq('org_type', tag);
    }

    console.log('[API] Executing Supabase query...');
    const startTime = Date.now();

    const { data, count, error } = await query
        .range(page * limit, (page + 1) * limit - 1)
        .order('created_at', { ascending: false });

    const duration = Date.now() - startTime;
    console.log(`[API] Query finished in ${duration}ms`);

    if (error) {
        console.error('[API] Database Error:', error);
        return NextResponse.json({
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        }, { status: 500 });
    }

    console.log(`[API] Success: Found ${data?.length} records (Total count: ${count})`);
    return NextResponse.json({ data, count });
}
