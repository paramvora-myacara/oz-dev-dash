import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// POST /api/campaigns/:id/recipients
// State Mapping for Smart Search (Duplicated from contacts.ts to avoid client-side import issues)
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
    if (STATE_NAME_TO_CODE[lower]) terms.push(STATE_NAME_TO_CODE[lower]);
    if (CODE_TO_STATE_NAME[input.toUpperCase()]) terms.push(CODE_TO_STATE_NAME[input.toUpperCase()]);
    return terms;
};

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: campaignId } = await params;
        const body = await request.json().catch(() => ({}));

        // Handle two payloads:
        // 1. Classic: { selections: [{contact_id, selected_email}] }
        // 2. Global: { selectAllMatching: true, filters: {...}, exclusions: [], explicitSelections: {} }

        const { selections, selectAllMatching, filters, exclusions, explicitSelections } = body;

        const supabase = createAdminClient();

        // 1. Verify campaign exists
        const { data: campaign } = await supabase
            .from('campaigns')
            .select('id')
            .eq('id', campaignId)
            .single();

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // 2. Clear existing 'selected' recipients
        // Safe to clear all if nothing sent yet, but verify logic as before
        const { count: activeCount } = await supabase
            .from('campaign_recipients')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaignId)
            .neq('status', 'selected');

        if (activeCount && activeCount > 0) {
            await supabase
                .from('campaign_recipients')
                .delete()
                .eq('campaign_id', campaignId)
                .eq('status', 'selected');
        } else {
            await supabase
                .from('campaign_recipients')
                .delete()
                .eq('campaign_id', campaignId);
        }

        let recipientsToInsert: any[] = [];

        if (selectAllMatching && filters) {
            // GLOBAL SELECTION LOGIC
            const exclusionSet = new Set(exclusions || []);
            const explicitMap = explicitSelections || {};

            let page = 0;
            const pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                // Determine 'from' and 'to' based on Supabase range
                // Note: Range is inclusive
                // However, since we are fetching-then-building, we can just stream?
                // Actually searchContacts query construction logic is needed here.

                let query = supabase
                    .from('contacts')
                    .select('id, email, campaign_recipients!left(campaign_id)');

                // Apply Filters (Replicated Logic)
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

                // Pagination
                const { data, error } = await query
                    .range(page * pageSize, (page + 1) * pageSize - 1)
                    .order('created_at', { ascending: false }); // Same order as UI

                if (error) throw error;

                if (!data || data.length === 0) {
                    hasMore = false;
                    break;
                }

                if (data.length < pageSize) hasMore = false;

                // Process batch
                for (const contact of data) {
                    if (exclusionSet.has(contact.id)) continue;

                    recipientsToInsert.push({
                        campaign_id: campaignId,
                        contact_id: contact.id,
                        selected_email: explicitMap[contact.id] || null, // Use explicit email or default (null means use primary at send time)
                        status: 'selected'
                    });
                }

                // Bulk Insert Batch if too large (e.g. > 5000) to avoid memory issues, 
                // but 1000 at a time is fine to accumulate or insert.
                // Supabase batch insert limit is often generous, but let's insert every 5000?
                if (recipientsToInsert.length >= 5000) {
                    const { error: insertError } = await supabase
                        .from('campaign_recipients')
                        .upsert(recipientsToInsert, { onConflict: 'campaign_id, contact_id', ignoreDuplicates: true });

                    if (insertError) throw insertError;
                    recipientsToInsert = [];
                }

                page++;
            }
        } else if (selections && Array.isArray(selections)) {
            // CLASSIC SELECTION LOGIC
            recipientsToInsert = selections.map((s: any) => ({
                campaign_id: campaignId,
                contact_id: s.contact_id,
                selected_email: s.selected_email || null,
                status: 'selected'
            }));
        } else {
            // Valid case: Clearing all recipients
        }

        // Final Insert (remaining items)
        if (recipientsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('campaign_recipients')
                .upsert(recipientsToInsert, { onConflict: 'campaign_id, contact_id', ignoreDuplicates: true });

            if (insertError) {
                console.error('Insert error:', insertError);
                return NextResponse.json({ error: insertError.message }, { status: 500 });
            }
        }

        // 3. Update total_recipients count
        const { count: finalCount } = await supabase
            .from('campaign_recipients')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaignId);

        await supabase
            .from('campaigns')
            .update({ total_recipients: finalCount || 0 })
            .eq('id', campaignId);

        return NextResponse.json({ success: true, count: finalCount });

    } catch (error) {
        console.error('POST /api/recipients error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/campaigns/:id/recipients?limit=5
// Returns sample data for preview
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: campaignId } = await params;
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '5')

        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();

        // Join campaign_recipients with contacts to get sample data
        const { data: recipients, error } = await supabase
            .from('campaign_recipients')
            .select(`
                selected_email,
                contacts (
                    name,
                    email,
                    company,
                    role,
                    location,
                    phone_number,
                    details
                )
            `)
            .eq('campaign_id', campaignId)
            // .eq('status', 'selected') // Show any recipient, even if processed
            .limit(limit);

        if (error) throw error;

        if (!recipients || recipients.length === 0) {
            return NextResponse.json({ sampleData: { columns: [], rows: [] } });
        }

        // Transform into SampleData format (flat rows)
        const rows = recipients.map((r: any) => {
            const contact = r.contacts;
            // Flatten contact details if present
            const details = (contact.details as Record<string, string>) || {};

            const row: Record<string, any> = {
                ...details,
                Name: contact.name,
                Email: r.selected_email || contact.email, // Use selected email if available
                Company: contact.company,
                Role: contact.role,
                Location: contact.location,
                Phone: contact.phone_number,
            };

            // Remove duplicates
            delete row['name'];
            delete row['email'];
            delete row['company'];
            delete row['role'];
            delete row['location'];
            delete row['phone']; // Just in case

            return row;
        });

        // Derive columns from keys of the first row (or merge all keys)
        // For simplicity, take keys from the first row + standard keys
        const allKeys = new Set<string>(['Name', 'Email', 'Company', 'Role', 'Location']);
        rows.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));

        const columns = Array.from(allKeys);

        return NextResponse.json({
            sampleData: {
                columns,
                rows
            }
        });

    } catch (error) {
        console.error('GET /api/recipients error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
