import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // Filters
    const tagsParam = searchParams.get('tag') || searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : [];
    const location = searchParams.get('location') || '';
    const role = searchParams.get('role') || '';
    const source = searchParams.get('source') || '';
    const leadStatusParam = searchParams.get('lead_status');
    const leadStatuses = leadStatusParam ? leadStatusParam.split(',') : [];
    const emailStatusParam = searchParams.get('email_status');
    const emailStatuses = emailStatusParam ? emailStatusParam.split(',') : [];

    const campaignHistoryParam = searchParams.get('campaign_history');
    const campaignResponseParam = searchParams.get('campaign_response');
    const excludeCampaignIdsParam = searchParams.get('exclude_campaign_ids') || searchParams.get('exclude_campaign_id');

    const campaignHistoryIds = campaignHistoryParam ? campaignHistoryParam.split(',').filter(id => id !== 'any' && id !== 'none') : [];
    const campaignResponseStatuses = campaignResponseParam ? campaignResponseParam.split(',') : [];
    const excludeCampaignIds = excludeCampaignIdsParam ? excludeCampaignIdsParam.split(',') : [];

    const hasEmail = searchParams.get('has_email');
    const hasLinkedin = searchParams.get('has_linkedin');
    const hasPhone = searchParams.get('has_phone');

    // Use RPC for filtering to avoid "URI too long" errors with large IN clauses
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_filtered_people_paginated', {
        p_search_query: search,
        p_tags: tags.length > 0 ? tags : null,
        p_location: location || null,
        p_role: role || null,
        p_source: source || null,
        p_lead_statuses: leadStatuses.length > 0 ? leadStatuses : null,
        p_verification_statuses: emailStatuses.filter(s => ['Valid', 'Catch-all', 'Unknown', 'Invalid'].includes(s)).length > 0 ? emailStatuses.filter(s => ['Valid', 'Catch-all', 'Unknown', 'Invalid'].includes(s)) : null,
        p_deliverability_statuses: emailStatuses.filter(s => !['Valid', 'Catch-all', 'Unknown', 'Invalid'].includes(s)).length > 0 ? emailStatuses.filter(s => !['Valid', 'Catch-all', 'Unknown', 'Invalid'].includes(s)) : null,
        p_has_email: hasEmail === 'true' ? true : hasEmail === 'false' ? false : null,
        p_has_linkedin: hasLinkedin === 'true' ? true : hasLinkedin === 'false' ? false : null,
        p_has_phone: hasPhone === 'true' ? true : hasPhone === 'false' ? false : null,
        p_campaign_history_param: (campaignHistoryParam === 'any' || campaignHistoryParam === 'none') ? campaignHistoryParam : null,
        p_campaign_history_ids: campaignHistoryIds.length > 0 ? campaignHistoryIds : null,
        p_campaign_response_statuses: campaignResponseStatuses.length > 0 ? campaignResponseStatuses : null,
        p_exclude_campaign_ids: excludeCampaignIds.length > 0 ? excludeCampaignIds : null,
        p_limit: limit,
        p_offset: page * limit
    });

    if (rpcError) {
        console.error('RPC Error:', rpcError);
        return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    const { ids, total_count } = rpcData as { ids: string[]; total_count: number };

    if (!ids || ids.length === 0) {
        return NextResponse.json({ data: [], count: total_count });
    }

    // Now fetch the full records for these specific IDs (only 50 max, so NO URI too long issue)
    const { data, error } = await supabase
        .from('people')
        .select(`
            *,
            person_organizations ( organizations ( * ), title, is_primary ),
            person_emails ( emails ( * ), is_primary ),
            person_phones ( phones ( * ), is_primary ),
            person_linkedin ( linkedin_profiles ( * ), is_primary ),
            person_properties ( properties ( * ), role ),
            campaign_recipients ( campaign_id, status, replied_at )
        `)
        .in('id', ids)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching full records:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: total_count });
}

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const payload = await request.json();
        const { data, error } = await supabase.rpc('create_contact_full', { payload });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Invalid request' }, { status: 400 });
    }
}

