import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    // Supabase/PostgREST default max is 1000 rows per request
    const pageSize = 1000;
    let offset = 0;
    const allTags: string[] = [];

    while (true) {
        const { data, error } = await supabase
            .from('people')
            .select('tags')
            .range(offset, offset + pageSize - 1);

        if (error) {
            console.error('Error fetching people tags:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data?.length) break;

        for (const row of data) {
            const tags = row?.tags;
            if (Array.isArray(tags)) {
                for (const t of tags) {
                    if (typeof t === 'string' && t.trim()) allTags.push(t.trim());
                }
            }
        }

        if (data.length < pageSize) break;
        offset += pageSize;
    }

    const tags = Array.from(new Set(allTags)).sort();
    return NextResponse.json({ tags });
}
