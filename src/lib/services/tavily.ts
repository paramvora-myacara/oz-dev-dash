import { createClient } from '@/utils/supabase/server';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export interface TavilySearchResult {
    url: string;
    content: string;
    title: string;
    score: number;
    raw_content?: string;
}

export interface LinkedInProfileResult {
    url: string;
    name: string;
    title?: string;
    company?: string;
    location?: string;
    snippet: string;
}

/**
 * Search for LinkedIn profiles using Tavily API
 */
export async function searchLinkedInProfile(
    name: string,
    companyOrContext: string
): Promise<LinkedInProfileResult[]> {
    if (!TAVILY_API_KEY) {
        console.error('TAVILY_API_KEY is not set');
        return [];
    }

    try {
        const query = `${name} ${companyOrContext}`;
        console.log(`[Tavily] Searching: ${query}`);

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: "basic",
                include_domains: ["linkedin.com"],
                max_results: 10, // Increased to account for filtering
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Tavily] API Error: ${response.status} ${errorText}`);
            return [];
        }

        const data = await response.json();
        const rawResults: TavilySearchResult[] = data.results || [];
        console.log(`[Tavily] Raw results: ${rawResults.length}`);

        // Transform and filter results
        return rawResults
            .filter(result => {
                const isProfile = result.url.includes('linkedin.com/in/');
                if (!isProfile) {
                    console.log(`[Tavily] Filtered out non-profile URL: ${result.url}`);
                }
                return isProfile;
            })
            .map(result => {
                // Basic extraction from title/snippet
                const titleParts = result.title.split('|')[0].split('-');

                let extractedName = titleParts[0]?.trim() || name;
                let extractedTitle = titleParts[1]?.trim();
                let extractedCompany = titleParts[2]?.trim();

                return {
                    url: result.url,
                    name: extractedName,
                    title: extractedTitle,
                    company: extractedCompany,
                    snippet: result.content
                };
            });

    } catch (error) {
        console.error('[Tavily] Search failed:', error);
        return [];
    }
}

/**
 * Process LinkedIn search for a call log entry
 * Aggregates all contact names for the phone number and searches for each
 */
export async function processLinkedInSearchForCall(
    callId: string,
    prospectPhoneId: string,
    phoneNumber: string,
    baseContext: string // Company name or Property name
) {
    const supabase = await createClient();

    try {
        // 1. Fetch the specific prospect phone record to get the contact name
        const { data: prospectPhone, error: phoneError } = await supabase
            .from('prospect_phones')
            .select('contact_name')
            .eq('id', prospectPhoneId)
            .single();

        if (phoneError || !prospectPhone) {
            console.error('[LinkedIn Trigger] Error fetching prospect phone:', phoneError);
            throw new Error('Prospect phone not found');
        }

        const contactName = prospectPhone.contact_name?.trim();

        if (!contactName || contactName.length < 2) {
            console.log(`[LinkedIn Trigger] No valid contact name found for phone ${phoneNumber}. Skipping search.`);
            await supabase
                .from('prospect_calls')
                .update({ linkedin_status: 'search_failed', linkedin_error: 'No contact name found' })
                .eq('id', callId);
            return;
        }

        console.log(`[LinkedIn Trigger] Searching for: ${contactName} at ${baseContext}`);

        // 3. Search for the specific person
        const allResults: LinkedInProfileResult[] = [];

        try {
            const results = await searchLinkedInProfile(contactName, baseContext);
            allResults.push(...results);
        } catch (err) {
            console.error(`[LinkedIn Trigger] Search failed for ${contactName}:`, err);
        }

        // 4. Store results
        console.log(`[LinkedIn Trigger] Found ${allResults.length} profile matches for call ${callId}`);

        if (allResults.length > 0) {
            // Deduplicate by URL
            const uniqueResults = new Map<string, LinkedInProfileResult>();
            allResults.forEach(r => uniqueResults.set(r.url, r));

            const dbInserts = Array.from(uniqueResults.values()).map((r, index) => ({
                prospect_phone_id: prospectPhoneId,
                call_log_id: callId,
                profile_url: r.url,
                profile_name: r.name,
                profile_title: r.title,
                profile_company: r.company,
                search_query: `${r.name} ${baseContext}`, // Approximation
                rank: index + 1,
            }));

            const { error: insertError } = await supabase
                .from('linkedin_search_results')
                .insert(dbInserts);

            if (insertError) {
                console.error('[LinkedIn Trigger] Error storing results:', insertError);
                throw insertError;
            }

            // Update status
            await supabase
                .from('prospect_calls')
                .update({ linkedin_status: 'search_complete' })
                .eq('id', callId);

            console.log(`[LinkedIn Trigger] Stored ${dbInserts.length} results for call ${callId}`);

        } else {
            // No results found
            console.log(`[LinkedIn Trigger] No profile matches found for call ${callId}`);
            await supabase
                .from('prospect_calls')
                .update({
                    linkedin_status: 'search_failed',
                    linkedin_error: 'No profiles found via Tavily'
                })
                .eq('id', callId);
        }

    } catch (error) {
        console.error('[LinkedIn Trigger] Process failed:', error);
        await supabase
            .from('prospect_calls')
            .update({
                linkedin_status: 'search_failed',
                linkedin_error: error instanceof Error ? error.message : 'Unknown error'
            })
            .eq('id', callId);
    }
}
