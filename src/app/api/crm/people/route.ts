import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || 'all';

    let query = supabase
        .from('people')
        .select(`
      *,
      person_organizations ( organizations ( * ), title, is_primary ),
      person_emails ( emails ( * ), is_primary ),
      person_phones ( phones ( * ), is_primary ),
      person_linkedin ( linkedin_profiles ( * ), is_primary ),
      person_properties ( properties ( * ), role )
    `, { count: 'exact' });

    if (search) {
        const ftsQuery = search.trim().split(/\s+/).join(' & ');
        query = query.textSearch('search_vector', ftsQuery);
    }

    if (tag && tag !== 'all') {
        query = query.contains('tags', [tag]);
    }

    const { data, count, error } = await query
        .range(page * limit, (page + 1) * limit - 1)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count });
}
