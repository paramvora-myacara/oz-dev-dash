import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: contactId } = await params;

        // 1. Verify admin authentication
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();

        // 2. Fetch Contact Info
        const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', contactId)
            .single();

        if (contactError || !contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        const userId = contact.user_id;
        let websiteEvents: any[] = [];
        let profileData: any = {};
        let signedUpAt: string | null = null;

        // 3. If linked to a user, fetch website activity and profile flags
        if (userId) {
            // Get signup date and other auth info if needed
            // Note: auth.users is protected, usually better to join or use admin client 
            // but here we can check the created_at from user_profiles if available or just use user_id logic

            // Fetch website events
            const { data: events, error: eventsError } = await supabase
                .from('user_events')
                .select('event_type, metadata, endpoint, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!eventsError) {
                websiteEvents = events.map(event => ({
                    eventType: event.event_type,
                    metadata: event.metadata,
                    endpoint: event.endpoint,
                    createdAt: event.created_at
                }));
            }

            // Fetch profile summaries with error handling (similar to user events)
            const interests = await supabase.from('user_interests').select('*').eq('user_id', userId).single();
            const devProfile = await supabase.from('developer_profiles').select('*').eq('user_id', userId).single();
            const invProfile = await supabase.from('investor_profiles').select('*').eq('user_id', userId).single();

            profileData = {
                communityMember: interests.error ? false : interests.data?.community_member || false,
                viewedListings: interests.error ? false : interests.data?.viewed_listings || false,
                investPageInterested: interests.error ? false : interests.data?.invest_page_interested || false,
                dashboardAccessed: interests.error ? false : interests.data?.dashboard_accessed || false,
                developerInfo: devProfile.error ? null : {
                    locationOfDevelopment: devProfile.data.location_of_development,
                    ozStatus: devProfile.data.oz_status,
                    geographicalZone: devProfile.data.geographical_zone
                },
                investorInfo: invProfile.error ? null : {
                    hasCapitalGain: invProfile.data.cap_gain_or_not,
                    gainSize: invProfile.data.size_of_cap_gain,
                    gainTiming: invProfile.data.time_of_cap_gain
                }
            };
        }

        // 4. Fetch Campaign History
        const { data: campaigns, error: campaignsError } = await supabase
            .from('campaign_recipients')
            .select(`
        campaign_id,
        status,
        sent_at,
        replied_at,
        bounced_at,
        unsubscribed_at,
        exit_reason,
        campaigns (
          name
        ),
        current_step_id
      `)
            .eq('contact_id', contactId)
            .order('created_at', { ascending: false });

        const formattedCampaigns = campaigns?.map(c => ({
            campaignId: c.campaign_id,
            campaignName: (c.campaigns as any)?.name || 'Unknown Campaign',
            status: c.status,
            sentAt: c.sent_at,
            repliedAt: c.replied_at,
            bouncedAt: c.bounced_at,
            unsubscribedAt: c.unsubscribed_at,
            exitReason: c.exit_reason,
            currentStepId: c.current_step_id
        })) || [];

        // 5. Combine and Return
        return NextResponse.json({
            contact: {
                id: contact.id,
                email: contact.email,
                name: contact.name,
                company: contact.company,
                role: contact.role,
                location: contact.location,
                source: contact.source,
                contactType: contact.contact_type,
                details: contact.details,
                createdAt: contact.created_at
            },
            isSignedUp: !!userId,
            websiteEvents,
            campaigns: formattedCampaigns,
            profile: profileData
        });

    } catch (error) {
        console.error('Error fetching contact 360 profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
