import { createClient } from '@/utils/supabase/client';
// import { Database } from '@/types/supabase'; // Types missing, using implicit types


// Define the filter interface
export interface ContactFilters {
    search?: string;
    role?: string;
    location?: string;
    source?: string;
    campaignHistory?: 'any' | 'none' | string; // 'none' = never contacted, 'any' = contacted at least once, or UUID
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
    history?: {
        campaign_id: string;
        status: string;
        sent_at: string | null;
        campaigns?: { name: string };
    }[];
}

export async function searchContacts(filters: ContactFilters, page = 0, pageSize = 50) {
    const supabase = createClient();

    let query = supabase
        .from('contacts')
        .select(`
      *,
      campaign_recipients!left (
        campaign_id,
        status,
        sent_at,
        campaigns (name)
      )
    `, { count: 'exact' });

    // 1. Text Search (Matches Name, Email, Company, Location)
    if (filters.search) {
        // 'english' config handles stemming
        query = query.textSearch('search_vector', filters.search, {
            type: 'plain',
            config: 'english'
        });
    }

    // 2. Precise Column Filters
    if (filters.role) {
        query = query.ilike('role', `%${filters.role}%`);
    }
    if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.source) {
        query = query.eq('source', filters.source);
    }

    // 3. History Filter
    if (filters.campaignHistory) {
        if (filters.campaignHistory === 'none') {
            // "Show me people I have NEVER contacted"
            query = query.is('campaign_recipients.id', null);
        } else if (filters.campaignHistory === 'any') {
            // "Show me people I HAVE contacted"
            query = query.not('campaign_recipients.id', 'is', null);
        } else {
            // "Show me people from Campaign X"
            query = query.eq('campaign_recipients.campaign_id', filters.campaignHistory);
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

    // Reuse filter logic (duplicated for now to avoid refactoring huge chunks, 
    // ideally should extract "buildQuery" helper)

    // 1. Text Search
    if (filters.search) {
        query = query.textSearch('search_vector', filters.search, {
            type: 'plain',
            config: 'english'
        });
    }

    // 2. Precise Column Filters
    if (filters.role) query = query.ilike('role', `%${filters.role}%`);
    if (filters.location) query = query.ilike('location', `%${filters.location}%`);
    if (filters.source) query = query.eq('source', filters.source);

    // 3. History Filter
    if (filters.campaignHistory) {
        if (filters.campaignHistory === 'none') {
            query = query.is('campaign_recipients.id', null);
        } else if (filters.campaignHistory === 'any') {
            query = query.not('campaign_recipients.id', 'is', null);
        } else {
            query = query.eq('campaign_recipients.campaign_id', filters.campaignHistory);
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching all contact IDs:', error);
        throw error;
    }

    return data.map(c => c.id);
}
