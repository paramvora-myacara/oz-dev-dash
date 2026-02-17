import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');

    if (!callId) {
        return NextResponse.json({ error: 'Missing callId' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('linkedin_search_results')
        .select('*')
        .eq('call_log_id', callId)
        .order('rank', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
