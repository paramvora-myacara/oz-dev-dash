import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type GlobalSearchTable = 'emails' | 'phones' | 'linkedin_profiles' | 'organizations';

export function useGlobalEntitySearch(table: GlobalSearchTable, queryField: string, minChars = 3) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (query.trim().length < minChars) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from(table)
        .select(`id, ${queryField}`)
        .ilike(queryField, `%${query}%`)
        .limit(5);

      setResults(data || []);
      setIsSearching(false);
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeout);
  }, [query, table, queryField, minChars]);

  return { query, setQuery, results, isSearching };
}
