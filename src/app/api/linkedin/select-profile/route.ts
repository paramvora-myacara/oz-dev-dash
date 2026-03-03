import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    const body = await request.json();
    const { callId, action, profileUrl } = body;

    if (!callId || !action) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    let updateData: any = {};

    if (action === 'select' || action === 'manual_entry') {
        if (!profileUrl) return NextResponse.json({ error: 'Missing profileUrl' }, { status: 400 });
        updateData = {
            linkedin_status: 'connection_pending',
            linkedin_url: profileUrl,
            linkedin_error: null
        };
    } else if (action === 'not_found') {
        updateData = {
            linkedin_status: 'search_failed',
            linkedin_error: 'User marked as not found'
        };
    }

    const { error } = await supabase
        .from('prospect_calls')
        .update(updateData)
        .eq('id', callId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

