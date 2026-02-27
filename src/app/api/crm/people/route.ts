import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // Filters
    const tagsParam = searchParams.get('tag') || searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : [];
    const location = searchParams.get('location') || '';
    const role = searchParams.get('role') || '';
    const source = searchParams.get('source') || '';
    const leadStatusParam = searchParams.get('lead_status');
    const leadStatuses = leadStatusParam ? leadStatusParam.split(',') : [];
    const emailStatusParam = searchParams.get('email_status');
    const emailStatuses = emailStatusParam ? emailStatusParam.split(',') : [];

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

    if (tags.length > 0) {
        // Use overlaps operator (&&) for OR logic: person has ANY of these tags
        query = query.overlaps('tags', tags);
    }

    if (location) {
        query = query.ilike('details->>location', `%${location}%`);
    }

    if (role) {
        query = query.ilike('person_organizations.title', `%${role}%`);
    }

    if (source) {
        query = query.ilike('details->>import_source', `%${source}%`);
    }

    if (leadStatuses.length > 0) {
        query = query.in('lead_status', leadStatuses);
    }

    if (emailStatuses.length > 0) {
        // Filter by email status. This requires joining through person_emails to emails table.
        // We use the dot notation for the filter.
        query = query.filter('person_emails.emails.status', 'in', `(${emailStatuses.join(',')})`);
    }


    const { data, count, error } = await query
        .range(page * limit, (page + 1) * limit - 1)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count });
}

