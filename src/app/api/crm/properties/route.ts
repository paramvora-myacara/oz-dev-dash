import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    let query = supabase
        .from('properties')
        .select(`
    *,
    person_properties(people(id, first_name, last_name, display_name), role),
    property_organizations(organizations(id, name, org_type), role)
        `, { count: 'exact' });

    if (search) {
        const ftsQuery = search.trim().split(/\s+/).join(' & ');
        query = query.textSearch('search_vector', ftsQuery);
    }

    const { data, count, error } = await query
        .range(page * limit, (page + 1) * limit - 1)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count });
}
