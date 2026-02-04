import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callerName = searchParams.get('caller');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    let query = supabase
        .from('prospect_calls')
        .select(`
            *,
            prospects (
                property_name,
                city,
                state
            )
        `, { count: 'exact' });

    if (callerName) {
        query = query.eq('caller_name', callerName);
    }

    query = query
        .order('called_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data,
        count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    });
}
