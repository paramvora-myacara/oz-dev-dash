import { createClient } from '@/utils/supabase/client';

// Define the filter interface
export interface ContactFilters {
    search?: string;
    role?: string;
    location?: string;
    source?: string;
    campaignHistory?: 'any' | 'none' | string | string[]; // 'none' = never contacted, 'any' = contacted at least once, string = single campaign UUID, string[] = multiple campaign UUIDs
    emailStatus?: string | string[];
}

export interface Contact {
    id: string;
    email: string;
    name: string | null;
    company: string | null;
    role: string | null;
    location: string | null;
    source: string | null;
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

// State Mapping for Smart Search
const STATE_NAME_TO_CODE: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
    'district of columbia': 'DC'
};

const CODE_TO_STATE_NAME = Object.entries(STATE_NAME_TO_CODE).reduce((acc, [name, code]) => {
    acc[code] = name;
    return acc;
}, {} as Record<string, string>);

const getExpandedSearchTerms = (input: string): string[] => {
    const terms = [input];
    const lower = input.toLowerCase().trim();

    // If input is full state name, add code
    if (STATE_NAME_TO_CODE[lower]) {
        terms.push(STATE_NAME_TO_CODE[lower]);
    }

    // If input is code, add full state name
    if (CODE_TO_STATE_NAME[input.toUpperCase()]) {
        terms.push(CODE_TO_STATE_NAME[input.toUpperCase()]);
    }

    return terms;
};

// Helper function for "never contacted" filter
async function getNeverContactedContacts(filters: ContactFilters, page: number, pageSize: number) {
    const supabase = createClient();

    // Use left join and filter where joined table id is null
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
        .filter('history', 'is', null)
        // Exclude globally suppressed contacts
        .eq('globally_unsubscribed', false)
        .eq('globally_bounced', false);

    // Apply other filters
    if (filters.search) {
        const searchTerms = getExpandedSearchTerms(filters.search);
        const conditions = [];
        conditions.push(`search_vector.fts.${filters.search}`);
        conditions.push(`name.ilike.%${filters.search}%`);
        conditions.push(`company.ilike.%${filters.search}%`);
        conditions.push(`email.ilike.%${filters.search}%`);
        searchTerms.forEach(term => {
            conditions.push(`location.ilike.%${term}%`);
        });
        query = query.or(conditions.join(','));
    }

    if (filters.role) {
        query = query.ilike('role', `%${filters.role}%`);
    }
    if (filters.location) {
        const locTerms = getExpandedSearchTerms(filters.location);
        const locConditions = locTerms.map(t => `location.ilike.%${t}%`);
        query = query.or(locConditions.join(','));
    }
    if (filters.source) {
        query = query.eq('source', filters.source);
    }

    if (filters.emailStatus) {
        if (Array.isArray(filters.emailStatus)) {
            query = query.in('details->>email_status', filters.emailStatus);
        } else {
            query = query.eq('details->>email_status', filters.emailStatus);
        }
    }

    const { data, error, count } = await query
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching contacts:', error);
        throw error;
    }

    return { data: data as Contact[], count };
}

export async function searchContactsForCampaign(filters: ContactFilters, page = 0, pageSize = 50) {
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
        // Exclude globally suppressed contacts for campaign selection
        .eq('globally_unsubscribed', false)
        .eq('globally_bounced', false);

    // Apply email_status filter
    const statusFilter = filters.emailStatus || ['Valid', 'Catch-all'];
    if (Array.isArray(statusFilter)) {
        query = query.in('details->>email_status', statusFilter);
    } else {
        query = query.eq('details->>email_status', statusFilter);
    }

    // 1. Text Search (Hybrid: FTS OR ILIKE)
    if (filters.search) {
        const searchTerms = getExpandedSearchTerms(filters.search);

        // Build OR condition:
        // 1. Match Search Vector (FTS) with original term
        // 2. ILIKE match location with original term OR expanded term (State code/name)
        // 3. ILIKE match Name/Company/Email with original term (for substring support)

        const conditions = [];

        // FTS (good for general keyword matching)
        conditions.push(`search_vector.fts.${filters.search}`);

        // Substring matches standard fields
        conditions.push(`name.ilike.%${filters.search}%`);
        conditions.push(`company.ilike.%${filters.search}%`);
        conditions.push(`email.ilike.%${filters.search}%`);

        // Metadata JSONB search (basic text cast)
        // conditions.push(`details::text.ilike.%${filters.search}%`); // Optional, might be slow without index

        // Expanded Location Matching (The fix for CA vs California)
        searchTerms.forEach(term => {
            conditions.push(`location.ilike.%${term}%`);
        });

        query = query.or(conditions.join(','));
    }

    // 2. Precise Column Filters
    if (filters.role) {
        query = query.ilike('role', `%${filters.role}%`);
    }
    if (filters.location) {
        // Apply expansion to location filter too
        const locTerms = getExpandedSearchTerms(filters.location);
        const locConditions = locTerms.map(t => `location.ilike.%${t}%`);
        query = query.or(locConditions.join(','));
    }
    if (filters.source) {
        query = query.eq('source', filters.source);
    }

    // 3. History Filter
    if (filters.campaignHistory) {
        if (filters.campaignHistory === 'none') {
            // "Show me people I have NEVER contacted" - use separate query for this case
            return await getNeverContactedContacts(filters, page, pageSize);
        } else if (filters.campaignHistory === 'any') {
            // "Show me people I HAVE contacted" - use inner join
            query = supabase
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
                `, { count: 'exact' })
                // Exclude globally suppressed contacts
                .eq('globally_unsubscribed', false)
                .eq('globally_bounced', false);
        } else if (Array.isArray(filters.campaignHistory)) {
            // "Show me people from selected campaigns" - use inner join with in filter
            query = supabase
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
                `, { count: 'exact' })
                .in('history.campaign_id', filters.campaignHistory)
                // Exclude globally suppressed contacts
                .eq('globally_unsubscribed', false)
                .eq('globally_bounced', false);
        } else {
            // "Show me people from Campaign X" - use inner join with filter (single campaign)
            query = supabase
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
                `, { count: 'exact' })
                .eq('history.campaign_id', filters.campaignHistory)
                // Exclude globally suppressed contacts
                .eq('globally_unsubscribed', false)
                .eq('globally_bounced', false);
        }
    }

    // 4. Pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching contacts:', error);
        throw error;
    }

    return { data: data as Contact[], count };
}

export async function searchContacts(filters: ContactFilters, page = 0, pageSize = 50) {
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
    `, { count: 'exact' });

    // 1. Text Search (Hybrid: FTS OR ILIKE)
    if (filters.search) {
        const searchTerms = getExpandedSearchTerms(filters.search);

        // Build OR condition: 
        // 1. Match Search Vector (FTS) with original term
        // 2. ILIKE match location with original term OR expanded term (State code/name)
        // 3. ILIKE match Name/Company/Email with original term (for substring support)

        const conditions = [];

        // FTS (good for general keyword matching)
        conditions.push(`search_vector.fts.${filters.search}`);

        // Substring matches standard fields
        conditions.push(`name.ilike.%${filters.search}%`);
        conditions.push(`company.ilike.%${filters.search}%`);
        conditions.push(`email.ilike.%${filters.search}%`);

        // Metadata JSONB search (basic text cast)
        // conditions.push(`details::text.ilike.%${filters.search}%`); // Optional, might be slow without index

        // Expanded Location Matching (The fix for CA vs California)
        searchTerms.forEach(term => {
            conditions.push(`location.ilike.%${term}%`);
        });

        query = query.or(conditions.join(','));
    }

    // 2. Precise Column Filters
    if (filters.role) {
        query = query.ilike('role', `%${filters.role}%`);
    }
    if (filters.location) {
        // Apply expansion to location filter too
        const locTerms = getExpandedSearchTerms(filters.location);
        const locConditions = locTerms.map(t => `location.ilike.%${t}%`);
        query = query.or(locConditions.join(','));
    }
    if (filters.source) {
        query = query.eq('source', filters.source);
    }

    if (filters.emailStatus) {
        if (Array.isArray(filters.emailStatus)) {
            query = query.in('details->>email_status', filters.emailStatus);
        } else {
            query = query.eq('details->>email_status', filters.emailStatus);
        }
    }

    // 3. History Filter
    if (filters.campaignHistory) {
        if (filters.campaignHistory === 'none') {
            // "Show me people I have NEVER contacted" - use separate query for this case
            return await getNeverContactedContacts(filters, page, pageSize);
        } else if (filters.campaignHistory === 'any') {
            // "Show me people I HAVE contacted" - use inner join
            query = supabase
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
        } else if (Array.isArray(filters.campaignHistory)) {
            // "Show me people from selected campaigns" - use inner join with in filter
            query = supabase
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
                `, { count: 'exact' })
                .in('history.campaign_id', filters.campaignHistory);
        } else {
            // "Show me people from Campaign X" - use inner join with filter (single campaign)
            query = supabase
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
                `, { count: 'exact' })
                .eq('history.campaign_id', filters.campaignHistory);
        }
    }

    // 4. Pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching contacts:', error);
        throw error;
    }

    return { data: data as Contact[], count };
}

export async function getAllContactIds(filters: ContactFilters) {
    const supabase = createClient();

    let query = supabase
        .from('contacts')
        .select('id, campaign_recipients!left(campaign_id)');

    // 1. Text Search
    if (filters.search) {
        const searchTerms = getExpandedSearchTerms(filters.search);
        const conditions = [];
        conditions.push(`search_vector.fts.${filters.search}`);
        conditions.push(`name.ilike.%${filters.search}%`);
        conditions.push(`company.ilike.%${filters.search}%`);
        conditions.push(`email.ilike.%${filters.search}%`);
        searchTerms.forEach(term => {
            conditions.push(`location.ilike.%${term}%`);
        });
        query = query.or(conditions.join(','));
    }

    // 2. Precise Column Filters
    if (filters.role) query = query.ilike('role', `%${filters.role}%`);
    if (filters.location) {
        const locTerms = getExpandedSearchTerms(filters.location);
        const locConditions = locTerms.map(t => `location.ilike.%${t}%`);
        query = query.or(locConditions.join(','));
    }
    if (filters.source) query = query.eq('source', filters.source);

    if (filters.emailStatus) {
        if (Array.isArray(filters.emailStatus)) {
            query = query.in('details->>email_status', filters.emailStatus);
        } else {
            query = query.eq('details->>email_status', filters.emailStatus);
        }
    }

    // 3. History Filter
    if (filters.campaignHistory) {
        if (filters.campaignHistory === 'none') {
            // "Show me people I have NEVER contacted" - exclude contacts with any campaign history
            const { data: recipients } = await supabase
                .from('campaign_recipients')
                .select('contact_id');
            const contactedContactIds = (recipients || []).map(r => r.contact_id);
            if (contactedContactIds.length > 0) {
                query = query.not('id', 'in', `(${contactedContactIds.join(',')})`);
            }
        } else if (filters.campaignHistory === 'any') {
            // "Show me people I HAVE contacted" - use inner join
            query = supabase
                .from('contacts')
                .select('id, campaign_recipients!inner(campaign_id)');
        } else if (Array.isArray(filters.campaignHistory)) {
            // "Show me people from selected campaigns" - use inner join with in filter
            query = supabase
                .from('contacts')
                .select('id, campaign_recipients!inner(campaign_id)')
                .in('campaign_recipients.campaign_id', filters.campaignHistory);
        } else {
            // "Show me people from Campaign X" - use inner join with filter
            query = supabase
                .from('contacts')
                .select('id, campaign_recipients!inner(campaign_id)')
                .eq('campaign_recipients.campaign_id', filters.campaignHistory);
        }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all contact IDs:', error);
        throw error;
    }

    return data.map(c => c.id);
}
