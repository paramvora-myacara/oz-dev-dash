import { createClient } from '@/utils/supabase/client';
import { ContactFilterBuilder } from './contacts/FilterBuilder';

// Define the filter interface
export interface ContactFilters {
    search?: string;
    role?: string;
    location?: string;
    source?: string;
    contactType?: string | string[]; // 'developer', 'investor', 'fund', or combinations like 'developer,investor,fund', or array
    campaignHistory?: 'any' | 'none' | string | string[]; // 'none' = never contacted, 'any' = contacted at least once, string = single campaign UUID, string[] = multiple campaign UUIDs
    emailStatus?: string | string[];
    leadStatus?: 'warm' | 'cold' | 'all';
    tags?: string | string[];
    websiteEvents?: { eventTypes: string[], operator?: 'any' | 'all' };
    campaignResponse?: { campaignId: string, response: 'replied' | 'no_reply' | 'bounced' | 'completed_sequence' };
    excludeCampaigns?: string[]; // Campaign IDs to exclude — contacts NOT in these campaigns
}

export interface Contact {
    id: string;
    email: string;
    name: string | null;
    company: string | null;
    role: string | null;
    location: string | null;
    source: string | null;
    contact_type: string;
    contact_types?: string[];
    details: any;
    is_valid_email?: boolean;
    globally_unsubscribed?: boolean;
    globally_bounced?: boolean;
    suppression_reason?: string;
    suppression_date?: string;
    history?: {
        campaign_id: string;
        status: string;
        sent_at: string | null;
        campaigns?: { name: string };
    }[];
}

/**
 * Shared logic to apply filters using the FilterBuilder.
 */
function applyFilters(builder: ContactFilterBuilder, filters: ContactFilters) {
    return builder
        .withTextSearch(filters.search)
        .withLocation(filters.location)
        .withRole(filters.role)
        .withSource(filters.source)
        .withContactType(filters.contactType)
        .withLeadStatus(filters.leadStatus)
        .withEmailStatus(filters.emailStatus)
        .withTags(filters.tags)
        .withWebsiteEvent(filters.websiteEvents?.eventTypes, { operator: filters.websiteEvents?.operator })
        .withCampaignResponse(filters.campaignResponse?.campaignId!, filters.campaignResponse?.response!)
        .withExcludeCampaigns(filters.excludeCampaigns);
}

// Helper function for "never contacted" filter
async function getNeverContactedContacts(filters: ContactFilters, page: number, pageSize: number) {
    const supabase = createClient();

    let query = supabase
        .from('contacts')
        .select(`
          *,
          globally_unsubscribed,
          globally_bounced,
          suppression_reason,
          suppression_date,
          history:campaign_recipients!left (
            campaign_id,
            status,
            sent_at,
            campaigns (name)
          )
        `, { count: 'exact' })
        .filter('history', 'is', null);

    const builder = new ContactFilterBuilder(query).excludeSuppressed();
    applyFilters(builder, filters);

    const { data, error, count } = await builder.build().query
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

    if (error) {
        console.error('Error searching contacts:', error);
        throw error;
    }

    return { data: data as Contact[], count };
}

export async function searchContactsForCampaign(filters: ContactFilters, page = 0, pageSize = 50) {
    const supabase = createClient();

    // 1. Determine the base query structure based on history filter
    let baseQuery;

    if (filters.campaignHistory === 'none') {
        return await getNeverContactedContacts(filters, page, pageSize);
    } else if (filters.campaignHistory === 'any') {
        baseQuery = supabase
            .from('contacts')
            .select(`
                *,
                globally_unsubscribed,
                globally_bounced,
                suppression_reason,
                suppression_date,
                history:campaign_recipients!inner (
                    campaign_id,
                    status,
                    sent_at,
                    campaigns (name)
                )
            `, { count: 'exact' });
    } else if (filters.campaignHistory && (typeof filters.campaignHistory === 'string' || Array.isArray(filters.campaignHistory))) {
        baseQuery = supabase
            .from('contacts')
            .select(`
                *,
                globally_unsubscribed,
                globally_bounced,
                suppression_reason,
                suppression_date,
                history:campaign_recipients!inner (
                    campaign_id,
                    status,
                    sent_at,
                    campaigns (name)
                )
            `, { count: 'exact' });

        if (Array.isArray(filters.campaignHistory)) {
            baseQuery = baseQuery.in('history.campaign_id', filters.campaignHistory);
        } else {
            baseQuery = baseQuery.eq('history.campaign_id', filters.campaignHistory);
        }
    } else {
        baseQuery = supabase
            .from('contacts')
            .select(`
                *,
                globally_unsubscribed,
                globally_bounced,
                suppression_reason,
                suppression_date,
                history:campaign_recipients!left (
                    campaign_id,
                    status,
                    sent_at,
                    campaigns (name)
                )
            `, { count: 'exact' });
    }

    // 2. Apply filters using the common builder
    const builder = new ContactFilterBuilder(baseQuery).excludeSuppressed();

    // Default email status for campaigns if not provided
    const emailStatus = filters.emailStatus || ['Valid', 'Catch-all'];
    applyFilters(builder, { ...filters, emailStatus });

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await builder.build().query
        .range(from, to)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

    if (error) {
        console.error('Error searching contacts:', error);
        throw error;
    }

    return { data: data as Contact[], count };
}

export async function searchContacts(filters: ContactFilters, page = 0, pageSize = 50) {
    const supabase = createClient();

    let baseQuery;

    if (filters.campaignHistory === 'none') {
        return await getNeverContactedContacts(filters, page, pageSize);
    } else if (filters.campaignHistory === 'any') {
        baseQuery = supabase
            .from('contacts')
            .select(`
                *,
                globally_unsubscribed,
                globally_bounced,
                suppression_reason,
                suppression_date,
                history:campaign_recipients!inner (
                    campaign_id,
                    status,
                    sent_at,
                    campaigns (name)
                )
            `, { count: 'exact' });
    } else if (filters.campaignHistory && (typeof filters.campaignHistory === 'string' || Array.isArray(filters.campaignHistory))) {
        baseQuery = supabase
            .from('contacts')
            .select(`
                *,
                globally_unsubscribed,
                globally_bounced,
                suppression_reason,
                suppression_date,
                history:campaign_recipients!inner (
                    campaign_id,
                    status,
                    sent_at,
                    campaigns (name)
                )
            `, { count: 'exact' });

        if (Array.isArray(filters.campaignHistory)) {
            baseQuery = baseQuery.in('history.campaign_id', filters.campaignHistory);
        } else {
            baseQuery = baseQuery.eq('history.campaign_id', filters.campaignHistory);
        }
    } else {
        baseQuery = supabase
            .from('contacts')
            .select(`
                *,
                globally_unsubscribed,
                globally_bounced,
                suppression_reason,
                suppression_date,
                history:campaign_recipients!left (
                    campaign_id,
                    status,
                    sent_at,
                    campaigns (name)
                )
            `, { count: 'exact' });
    }

    const builder = new ContactFilterBuilder(baseQuery);
    applyFilters(builder, filters);

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await builder.build().query
        .range(from, to)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

    if (error) {
        console.error('Error searching contacts:', error);
        throw error;
    }

    return { data: data as Contact[], count };
}

export async function getAllContactIds(filters: ContactFilters) {
    const supabase = createClient();

    let baseQuery;

    if (filters.campaignHistory === 'none') {
        const { data: recipients } = await supabase
            .from('campaign_recipients')
            .select('contact_id');
        const contactedContactIds = (recipients || []).map(r => r.contact_id);

        baseQuery = supabase.from('contacts').select('id');
        if (contactedContactIds.length > 0) {
            baseQuery = baseQuery.not('id', 'in', `(${contactedContactIds.join(',')})`);
        }
    } else if (filters.campaignHistory === 'any') {
        baseQuery = supabase.from('contacts').select('id, campaign_recipients!inner(campaign_id)');
    } else if (filters.campaignHistory && (typeof filters.campaignHistory === 'string' || Array.isArray(filters.campaignHistory))) {
        baseQuery = supabase.from('contacts').select('id, campaign_recipients!inner(campaign_id)');
        if (Array.isArray(filters.campaignHistory)) {
            baseQuery = baseQuery.in('campaign_recipients.campaign_id', filters.campaignHistory);
        } else {
            baseQuery = baseQuery.eq('campaign_recipients.campaign_id', filters.campaignHistory);
        }
    } else {
        baseQuery = supabase.from('contacts').select('id');
    }

    const builder = new ContactFilterBuilder(baseQuery);
    applyFilters(builder, filters);

    const { data, error } = await builder.build().query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

    if (error) {
        console.error('Error fetching all contact IDs:', error);
        throw error;
    }

    return data.map((c: any) => c.id);
}
