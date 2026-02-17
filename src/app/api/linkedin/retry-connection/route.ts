import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { callId } = body;

        if (!callId) {
            return NextResponse.json({ error: 'Missing callId' }, { status: 400 });
        }

        const supabase = await createClient();

        console.log(`[Retry Connection API] Received callId: ${callId}`);

        // Update status to pending connection and touch updated_at
        const { error } = await supabase
            .from('prospect_calls')
            .update({
                linkedin_status: 'connection_pending',
                linkedin_error: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', callId);

        if (error) {
            console.error(`[Retry Connection API] Failed to update call ${callId}:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Retry connection error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
