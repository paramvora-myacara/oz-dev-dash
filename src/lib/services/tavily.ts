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


