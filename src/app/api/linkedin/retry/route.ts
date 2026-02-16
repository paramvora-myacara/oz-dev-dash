import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { processLinkedInSearchForCall } from '@/lib/services/tavily';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { callId } = body;

        if (!callId) {
            return NextResponse.json({ error: 'Missing callId' }, { status: 400 });
        }

        const supabase = await createClient();

        console.log(`[Retry API] Received callId: ${callId}`);

        // 1. Get the call details
        const { data: call, error: fetchError } = await supabase
            .from('prospect_calls')
            .select(`
                *,
                prospect_phones (
                    id,
                    phone_number,
                    contact_name,
                    entity_names,
                    prospects (
                        property_name
                    )
                )
            `)
            .eq('id', callId)
            .single();

        if (fetchError || !call) {
            console.error(`[Retry API] Failed to find call ${callId}:`, fetchError);
            return NextResponse.json({ error: 'Call not found' }, { status: 404 });
        }

        // 2. Determine context (same logic as in the trigger)
        const entityName = call.prospect_phones?.entity_names?.split(',')[0]?.trim();
        const propertyName = call.prospect_phones?.prospects?.property_name;
        const context = entityName || propertyName || '';

        // 3. Clear existing results for this call (optional, but cleaner)
        await supabase
            .from('linkedin_search_results')
            .delete()
            .eq('call_log_id', callId);

        // 4. Update status to pending
        await supabase
            .from('prospect_calls')
            .update({
                linkedin_status: 'search_pending',
                linkedin_error: null
            })
            .eq('id', callId);

        // 5. Trigger search immediately
        console.log(`[Retry API] Triggering LinkedIn search for call ${callId}...`);
        await processLinkedInSearchForCall(
            call.id,
            call.prospect_phone_id,
            call.prospect_phones?.phone_number,
            context
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Retry error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
