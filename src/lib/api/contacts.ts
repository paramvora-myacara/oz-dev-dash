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
 * Shared logic to apply synchronous filters using the FilterBuilder.
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
        .withWebsiteEvent(filters.websiteEvents?.eventTypes, { operator: filters.websiteEvents?.operator });
}

/**
 * Handles filters that require async pre-fetching (excludeCampaigns, campaignResponse).
 * PostgREST doesn't support SQL subqueries in filter(), so we fetch IDs first,
 * then filter with literal values.
 * Returns the modified baseQuery and whether the result should be empty.
 */
async function applyAsyncFilters(baseQuery: any, filters: ContactFilters): Promise<{ query: any; empty: boolean }> {
    const supabase = createClient();

    // Handle excludeCampaigns: contacts NOT in these campaigns
    if (filters.excludeCampaigns && filters.excludeCampaigns.length > 0) {
        const { data: excludedRecipients } = await supabase
            .from('campaign_recipients')
            .select('contact_id')
            .in('campaign_id', filters.excludeCampaigns);

        const excludedContactIds = [...new Set((excludedRecipients || []).map((r: any) => r.contact_id))];
        if (excludedContactIds.length > 0) {
            baseQuery = baseQuery.not('id', 'in', `(${excludedContactIds.join(',')})`);
        }
    }

    // Handle campaignResponse: contacts who replied/bounced/etc in a specific campaign
    if (filters.campaignResponse?.campaignId && filters.campaignResponse?.response) {
        let recipientQuery = supabase
            .from('campaign_recipients')
            .select('contact_id')
            .eq('campaign_id', filters.campaignResponse.campaignId);

        const response = filters.campaignResponse.response;
        if (response === 'replied') {
            recipientQuery = recipientQuery.not('replied_at', 'is', null);
        } else if (response === 'no_reply') {
            recipientQuery = recipientQuery.is('replied_at', null);
        } else if (response === 'bounced') {
            recipientQuery = recipientQuery.not('bounced_at', 'is', null);
        } else if (response === 'completed_sequence') {
            recipientQuery = recipientQuery.eq('status', 'completed');
        }

        const { data: matchingRecipients } = await recipientQuery;
        const matchingContactIds = [...new Set((matchingRecipients || []).map((r: any) => r.contact_id))];

        if (matchingContactIds.length > 0) {
            baseQuery = baseQuery.in('id', matchingContactIds);
        } else {
            return { query: baseQuery, empty: true };
        }
    }

    return { query: baseQuery, empty: false };
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

    // 2. Apply async filters (excludeCampaigns, campaignResponse) first
    const { query: filteredQuery, empty } = await applyAsyncFilters(baseQuery, filters);
    if (empty) return { data: [], count: 0 };

    // 3. Apply synchronous filters using the common builder
    const builder = new ContactFilterBuilder(filteredQuery).excludeSuppressed();

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

    // Apply async filters first
    const { query: filteredQuery, empty } = await applyAsyncFilters(baseQuery, filters);
    if (empty) return { data: [], count: 0 };

    const builder = new ContactFilterBuilder(filteredQuery);
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

    // Apply async filters first
    const { query: filteredQuery, empty } = await applyAsyncFilters(baseQuery, filters);
    if (empty) return [];

    const builder = new ContactFilterBuilder(filteredQuery);
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
