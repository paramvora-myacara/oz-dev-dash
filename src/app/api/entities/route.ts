import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        const supabase = await createClient();

        // 1. Get unique entity names from prospect_phones
        let query = supabase
            .from('prospect_phones')
            .select('entity_names, prospect_id')
            .not('entity_names', 'is', null);

        if (search) {
            query = query.ilike('entity_names', `%${search}%`);
        }

        const { data: phoneData, error: phoneError } = await query;
        if (phoneError) throw phoneError;

        // 2. Get unique property names from shadow properties
        let shadowQuery = supabase
            .from('prospects')
            .select('id, property_name')
            .eq('address', 'ENTITY_SHADOW');

        if (search) {
            shadowQuery = shadowQuery.ilike('property_name', `%${search}%`);
        }

        const { data: shadowData, error: shadowError } = await shadowQuery;
        if (shadowError) throw shadowError;

        // 3. Aggregate results
        const entityMap = new Map<string, Set<string>>();

        // Add phonemappings
        (phoneData || []).forEach(item => {
            if (!item.entity_names) return;
            if (!entityMap.has(item.entity_names)) {
                entityMap.set(item.entity_names, new Set());
            }
            entityMap.get(item.entity_names)!.add(item.prospect_id);
        });

        // Add shadow properties
        (shadowData || []).forEach(item => {
            if (!entityMap.has(item.property_name)) {
                entityMap.set(item.property_name, new Set());
            }
            entityMap.get(item.property_name)!.add(item.id);
        });

        const results = Array.from(entityMap.entries()).map(([name, ids]) => ({
            name,
            propertyCount: ids.size,
            propertyIds: Array.from(ids)
        }));

        // Sort by property count
        results.sort((a, b) => b.propertyCount - a.propertyCount);

        return NextResponse.json({ data: results });

    } catch (error: any) {
        console.error('Error in GET /api/entities:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
