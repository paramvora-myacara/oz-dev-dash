
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const currentUser = searchParams.get('user');

    const supabase = await createClient();

    try {
        let query = supabase
            .from('prospect_calls')
            .select(`
                *,
                prospect_phones!inner (
                    *,
                    prospects (*)
                ),
                linkedin_search_results (*)
            `)
            .not('linkedin_status', 'is', null) // Ensure it's not null
            .order('called_at', { ascending: false });

        if (currentUser) {
            query = query.eq('caller_name', currentUser);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching LinkedIn queue:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
