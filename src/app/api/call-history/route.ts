import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callerName = searchParams.get('caller');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // 1. Fetch activities ONLY from the new CRM activities table
    let activityQuery = supabase
        .from('activities')
        .select(`
            id,
            timestamp,
            metadata,
            people (
                display_name,
                person_properties (
                    properties (property_name, city, state)
                )
            )
        `, { count: 'exact' })
        .eq('type', 'call_logged');

    if (callerName) {
        activityQuery = activityQuery.eq('metadata->>caller_name', callerName);
    }

    const { data: activityData, error, count } = await activityQuery
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Activity History Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Map to unified format
    const formattedData = (activityData || []).map((act: any) => {
        const m = act.metadata || {};
        const person = act.people || {};
        const prop = person.person_properties?.[0]?.properties || {};

        return {
            id: act.id,
            called_at: act.timestamp,
            caller_name: m.caller_name || 'Unknown',
            outcome: m.outcome || 'unknown',
            phone_used: m.phone_used || '-',
            email_captured: m.email_captured,
            prospects: {
                property_name: prop.property_name || person.display_name || '-',
                city: prop.city || '',
                state: prop.state || ''
            }
        };
    });

    return NextResponse.json({
        data: formattedData,
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    });
}
