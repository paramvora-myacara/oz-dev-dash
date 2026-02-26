import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
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
        .limit(100)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
