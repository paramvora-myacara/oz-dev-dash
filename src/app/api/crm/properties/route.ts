import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('properties')
        .select(`
    *,
    person_properties(people(id, first_name, last_name, display_name), role)
        `)
        .limit(100)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
