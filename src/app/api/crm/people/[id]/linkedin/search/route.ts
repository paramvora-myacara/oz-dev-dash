import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { searchLinkedInProfile } from '@/lib/services/tavily';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: personId } = await params;
    const body = await request.json();
    const { name, context } = body;

    if (!personId || !name) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        console.log(`[LinkedIn Search] Triggering search for ${name} in context ${context}`);

        // 1. Perform Tavily Search
        const searchResults = await searchLinkedInProfile(name, context || '');

        if (searchResults.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // 2. Store results in DB linked to person_id
        const dbInserts = searchResults.map((r, index) => ({
            person_id: personId,
            profile_url: r.url,
            profile_name: r.name,
            profile_title: r.title,
            profile_company: r.company,
            search_query: `${name} ${context || ''}`,
            rank: index + 1,
            selected: false
        }));

        // Delete previous search results for this person to keep it clean? 
        // Or keep them? Usually clean is better for "latest discovery".
        await supabase.from('linkedin_search_results').delete().eq('person_id', personId);

        const { data: inserted, error: insertError } = await supabase
            .from('linkedin_search_results')
            .insert(dbInserts)
            .select();

        if (insertError) {
            console.error('[LinkedIn Search] DB Error:', insertError);
            throw insertError;
        }

        return NextResponse.json({ data: inserted });

    } catch (error: any) {
        console.error('[LinkedIn Search] Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: personId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('linkedin_search_results')
        .select('*')
        .eq('person_id', personId)
        .order('rank', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
