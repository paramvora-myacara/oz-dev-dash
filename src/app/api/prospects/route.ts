import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspect } from '@/utils/prospect-mapping';
import { mapProspectPhone } from '@/utils/prospect-phone-mapping';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const state = searchParams.get('state');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    let query = supabase
        .from('prospects')
        .select('*, prospect_calls(*)', { count: 'exact' });

    // Text Search
    if (search) {
        query = query.textSearch('property_name', search);
    }

    // State Filter
    if (state && state !== 'ALL') {
        query = query.eq('state', state);
    }

    // Status Filter (Custom Logic)
    if (status) {
        const statusFilters = status.split(',').map(s => s.trim());

        // Separate filters by type
        const callStatusFilters: string[] = [];
        const hasNeverContacted = statusFilters.includes('NEVER_CONTACTED');
        const hasLocked = statusFilters.includes('LOCKED');

        if (statusFilters.includes('FOLLOW_UP')) {
            callStatusFilters.push('follow_up');
        }
        if (statusFilters.includes('PENDING_SIGNUP')) {
            callStatusFilters.push('pending_signup');
        }
        if (statusFilters.includes('INVALID_NUMBER')) {
            callStatusFilters.push('invalid_number');
        }
        if (hasNeverContacted) {
            // Filter for prospects that have never been contacted (call_status = 'new')
            callStatusFilters.push('new');
        }

        // Apply call_status filters using .in() for multiple values
        if (callStatusFilters.length > 0) {
            if (callStatusFilters.length === 1) {
                query = query.eq('call_status', callStatusFilters[0]);
            } else {
                query = query.in('call_status', callStatusFilters);
            }
        }

        // Apply lockout_until filters (only if no call_status filters are selected)
        if (callStatusFilters.length === 0) {
            if (hasLocked) {
                query = query.gt('lockout_until', new Date().toISOString());
            }
        }
    }

    // Pagination
    // Sort by created_at descending (most recently added first), then alphabetically by property_name for tiebreaking
    query = query
        .order('created_at', { ascending: false, nullsFirst: false })
        .order('property_name', { ascending: true })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching prospects:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data: (data || []).map(mapProspect),
        count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            mode, // 'entity' or undefined/null for property mode
            entityName, // required if mode === 'entity'

            // Property details
            prospectId,
            propertyName,
            address,
            city,
            state,
            zip,
            market,
            submarket,

            // Contact details
            phoneNumber,
            labels = [],
            contactName,
            contactEmail,
            entityNames,
            entityAddresses
        } = body;

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const normalized = phoneNumber.replace(/\D/g, '');

        if (mode === 'entity') {
            if (!entityName) return NextResponse.json({ error: 'Entity name is required for entity mode' }, { status: 400 });

            // 1. Find all properties for this entity
            // Search in prospect_phones for existing mentions, or in prospects for shadow properties
            const { data: linkedPhones } = await supabase
                .from('prospect_phones')
                .select('prospect_id')
                .eq('entity_names', entityName);

            const { data: shadowProspects } = await supabase
                .from('prospects')
                .select('id')
                .eq('property_name', entityName)
                .eq('address', 'ENTITY_SHADOW');

            const prospectIds = new Set([
                ...(linkedPhones || []).map(p => p.prospect_id),
                ...(shadowProspects || []).map(p => p.id)
            ]);

            // 2. If no properties found, create a shadow one
            if (prospectIds.size === 0) {
                const { data: newShadow, error: shadowErr } = await supabase
                    .from('prospects')
                    .insert({
                        property_name: entityName,
                        address: 'ENTITY_SHADOW',
                        city: '',
                        state: '',
                        zip: ''
                    })
                    .select('id')
                    .single();

                if (shadowErr) throw shadowErr;
                prospectIds.add(newShadow.id);
            }

            // 3. Batch insert for all properties
            // We need to avoid duplicates for (prospect_id, phone_number)
            const insertData = Array.from(prospectIds).map(pid => ({
                prospect_id: pid,
                phone_number: phoneNumber,
                labels: labels,
                contact_name: contactName || null,
                contact_email: contactEmail || null,
                entity_names: entityName, // Ensure the target entity name is set
                entity_addresses: entityAddresses || null,
                call_status: 'new'
            }));

            // Using upsert with onConflict to skip or update instead of failing on duplicates
            const { data: newPhones, error: batchError } = await supabase
                .from('prospect_phones')
                .upsert(insertData, {
                    onConflict: 'prospect_id, phone_number',
                    ignoreDuplicates: true
                })
                .select(`
                    *,
                    prospects (*)
                `);

            if (batchError) throw batchError;

            // Return the first one for consistency with current UI expectations
            return NextResponse.json({ data: mapProspectPhone(newPhones?.[0]) });

        } else {
            // ORIGINAL PROPERTY MODE
            let targetProspectId = prospectId;

            // 1. If no prospectId provided, try to find or create prospect
            if (!targetProspectId) {
                if (!propertyName) {
                    return NextResponse.json({ error: 'Property name is required for new prospects' }, { status: 400 });
                }

                // Simple search by name and address to avoid duplicates
                const { data: existingProspect } = await supabase
                    .from('prospects')
                    .select('id')
                    .eq('property_name', propertyName)
                    .eq('address', address || '')
                    .maybeSingle();

                if (existingProspect) {
                    targetProspectId = existingProspect.id;
                } else {
                    const { data: newProspect, error: prospectError } = await supabase
                        .from('prospects')
                        .insert({
                            property_name: propertyName,
                            address: address || '',
                            city: city || '',
                            state: state || '',
                            zip: zip || '',
                            market: market || '',
                            submarket: submarket || ''
                        })
                        .select()
                        .single();

                    if (prospectError) throw prospectError;
                    targetProspectId = newProspect.id;
                }
            }

            // 2. Check if this phone number already exists for this prospect
            const { data: existingPhone, error: checkError } = await supabase
                .from('prospect_phones')
                .select('*')
                .eq('prospect_id', targetProspectId)
                .filter('phone_number', 'ilike', `%${normalized}%`)
                .maybeSingle();

            if (checkError) throw checkError;

            if (existingPhone) {
                const foundNormalized = existingPhone.phone_number.replace(/\D/g, '');
                if (foundNormalized === normalized) {
                    return NextResponse.json({
                        error: 'This phone number already exists for this property',
                        existingRecord: existingPhone
                    }, { status: 409 });
                }
            }

            // 3. Create the prospect_phone record
            const { data: newPhone, error: phoneError } = await supabase
                .from('prospect_phones')
                .insert({
                    prospect_id: targetProspectId,
                    phone_number: phoneNumber,
                    labels: labels,
                    contact_name: contactName || null,
                    contact_email: contactEmail || null,
                    entity_names: entityNames || null,
                    entity_addresses: entityAddresses || null,
                    call_status: 'new'
                })
                .select(`
                    *,
                    prospects (*)
                `)
                .single();

            if (phoneError) throw phoneError;

            return NextResponse.json({ data: mapProspectPhone(newPhone) });
        }

    } catch (error: any) {
        console.error('Error in POST /api/prospects:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
