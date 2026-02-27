import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();

    // In Next 15, params must be awaited if it's treated as a Promise. Since Next 15 app router pass it as Promise-like.
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('people')
        .select(`
            *,
            person_organizations ( organizations ( * ), title, is_primary ),
            person_emails ( emails ( * ), is_primary ),
            person_phones ( phones ( * ), is_primary ),
            person_linkedin ( linkedin_profiles ( * ), is_primary ),
            person_properties ( properties ( * ), role )
        `)
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
