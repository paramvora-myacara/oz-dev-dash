import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function usePersonNameSearch(firstName: string, lastName: string, minChars = 2) {
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        // Only search if we have at least minChars across both or in one
        if (firstName.trim().length < minChars && lastName.trim().length < minChars) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsSearching(true);

            let query = supabase
                .from('people')
                .select(`
          id, 
          first_name, 
          last_name, 
          lead_status,
          tags,
          person_emails ( emails ( address ), is_primary ),
          person_phones ( phones ( number ), is_primary ),
          person_linkedin ( linkedin_profiles ( url ), is_primary ),
          person_organizations ( organizations ( id, name ), title, is_primary )
        `);

            if (firstName.trim() && lastName.trim()) {
                query = query
                    .ilike('first_name', `%${firstName.trim()}%`)
                    .ilike('last_name', `%${lastName.trim()}%`);
            } else if (firstName.trim()) {
                query = query.ilike('first_name', `%${firstName.trim()}%`);
            } else {
                query = query.ilike('last_name', `%${lastName.trim()}%`);
            }

            const { data } = await query.limit(5);

            setResults(data || []);
            setIsSearching(false);
        };

        const timeout = setTimeout(fetchResults, 400);
        return () => clearTimeout(timeout);
    }, [firstName, lastName, minChars]);

    return { results, isSearching };
}
