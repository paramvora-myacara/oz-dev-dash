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
            person_properties ( properties ( * ), role ),
            activities (*),
            campaign_recipients (
                id, 
                campaign_id, 
                status, 
                sent_at, 
                replied_at, 
                created_at,
                campaigns ( name ) 
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching person:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        console.error('No data found for person ID:', id);
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    console.log('Successfully fetched person data:', !!data);

    const activities = data.activities || [];

    // Map campaign history to timeline events
    const campaignEvents = (data.campaign_recipients || [])
        .map((r: any) => ({
            id: r.id,
            type: 'email_sent',
            channel: 'email',
            description: `Campaign: ${r.campaigns?.name || 'Sent Email'}`,
            timestamp: r.sent_at || r.created_at, // Fallback to created_at if sent_at is null
            metadata: {
                campaign_id: r.campaign_id,
                status: r.status,
                replied_at: r.replied_at
            }
        }))
        .filter((ev: any) => ev.timestamp); // Ensure we have a date

    console.log(`Timeline metrics for ${id}:`, {
        activities: activities.length,
        campaignHistory: (data.campaign_recipients || []).length,
        mappedEvents: campaignEvents.length
    });

    const timeline = [...activities, ...campaignEvents].sort(
        (a: any, b: any) =>
            new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime(),
    );

    return NextResponse.json({ ...data, timeline });
}
