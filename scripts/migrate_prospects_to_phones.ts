/**
 * Migrates prospects.phone_numbers JSONB into prospect_phones table
 * and links prospect_calls to prospect_phone_id.
 *
 * Run after applying the 20260203100000_create_prospect_phones migration.
 * Usage: npx tsx scripts/migrate_prospects_to_phones.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

interface PhoneEntry {
    label: string;
    number: string;
    contactName?: string;
    contactEmail?: string;
    details?: Record<string, string>;
    callCount?: number;
    lastCalledAt?: string;
}

function normalizePhone(num: string): string {
    return (num || '').replace(/\D/g, '').trim();
}

async function fetchAll<T>(
    table: string,
    select: string,
    orderCol: string = 'id'
): Promise<T[]> {
    let allData: T[] = [];
    let from = 0;
    const PAGE_SIZE = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from(table)
            .select(select)
            .order(orderCol, { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;
        if (data && data.length > 0) {
            allData = [...allData, ...(data as T[])];
            from += PAGE_SIZE;
            if (data.length < PAGE_SIZE) hasMore = false;
        } else {
            hasMore = false;
        }
        process.stdout.write(`\rFetched ${allData.length} records from ${table}...`);
    }
    console.log(); // New line after progress
    return allData;
}

async function migrate() {
    console.log('Fetching prospects...');
    const prospects = await fetchAll<any>(
        'prospects',
        'id, phone_numbers, call_status, lockout_until, follow_up_at, last_called_at, last_called_by, extras, viewing_by, viewing_since'
    );

    if (!prospects?.length) {
        console.log('No prospects found. Nothing to migrate.');
        return;
    }

    console.log(`Found ${prospects.length} prospects. Extracting phones...`);

    const prospectPhonesToInsert: Array<{
        prospect_id: string;
        phone_number: string;
        labels: string[];
        contact_name: string | null;
        contact_email: string | null;
        entity_names: string | null;
        entity_addresses: string | null;
        call_status: string;
        lockout_until: string | null;
        follow_up_at: string | null;
        last_called_at: string | null;
        last_called_by: string | null;
        call_count: number;
        extras: any;
        viewing_by: string | null;
        viewing_since: string | null;
    }> = [];

    for (const prospect of prospects) {
        const phoneNumbers = (prospect.phone_numbers || []) as PhoneEntry[];
        if (phoneNumbers.length === 0) continue;

        // Group by normalized phone number (dedupe within property)
        const byPhone = new Map<string, PhoneEntry[]>();
        for (const p of phoneNumbers) {
            const num = normalizePhone(p.number);
            if (!num) continue;
            if (!byPhone.has(num)) byPhone.set(num, []);
            byPhone.get(num)!.push(p);
        }

        for (const [normalizedNum, entries] of byPhone) {
            const displayNumber = entries[0]?.number?.trim() || normalizedNum;
            const labels = [...new Set(entries.map(e => e.label).filter(Boolean))];
            const contactName = entries.find(e => e.contactName)?.contactName || null;
            const contactEmail = entries.find(e => e.contactEmail)?.contactEmail || null;

            const entityNamesSet = new Set<string>();
            const entity_addressesSet = new Set<string>();
            for (const e of entries) {
                const entityName = e.details?.['Entity Name'];
                if (entityName?.trim()) entityNamesSet.add(entityName.trim());
                const addr = e.details?.['Address'];
                if (addr?.trim()) entity_addressesSet.add(addr.trim());
            }
            const entity_names = entityNamesSet.size ? [...entityNamesSet].join(', ') : null;
            const entity_addresses = entity_addressesSet.size ? [...entity_addressesSet].join(', ') : null;

            const call_count = Math.max(0, ...entries.map(e => e.callCount ?? 0));
            const lastCalledAts = entries.map(e => e.lastCalledAt).filter(Boolean) as string[];
            const last_called_at = lastCalledAts.length
                ? lastCalledAts.sort().reverse()[0]
                : prospect.last_called_at;

            prospectPhonesToInsert.push({
                prospect_id: prospect.id,
                phone_number: displayNumber,
                labels,
                contact_name: contactName || null,
                contact_email: contactEmail || null,
                entity_names,
                entity_addresses,
                call_status: prospect.call_status || 'new',
                lockout_until: prospect.lockout_until,
                follow_up_at: prospect.follow_up_at,
                last_called_at: last_called_at || null,
                last_called_by: prospect.last_called_by || null,
                call_count,
                extras: prospect.extras || {},
                viewing_by: prospect.viewing_by || null,
                viewing_since: prospect.viewing_since || null
            });
        }
    }

    console.log(`Inserting ${prospectPhonesToInsert.length} prospect_phones rows...`);

    const BATCH = 500;
    for (let i = 0; i < prospectPhonesToInsert.length; i += BATCH) {
        const batch = prospectPhonesToInsert.slice(i, i + BATCH);
        const { error } = await supabase.from('prospect_phones').upsert(batch, {
            onConflict: 'prospect_id,phone_number',
            ignoreDuplicates: false
        });
        if (error) {
            console.error('\n--- INSERT ERROR ---');
            console.error('Message:', error.message);
            console.error('Details:', error.details);
            console.error('Hint:', error.hint);
            console.error('Code:', error.code);
            console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('Sample Data:', JSON.stringify(batch[0], null, 2));
            process.exit(1);
        }
        process.stdout.write(`\rInserted ${Math.min(i + BATCH, prospectPhonesToInsert.length)}/${prospectPhonesToInsert.length}...`);
    }
    console.log('\nprospect_phones populated.');

    // Link prospect_calls to prospect_phones
    console.log('Fetching prospect_calls...');
    const calls = await fetchAll<any>('prospect_calls', 'id, prospect_id, phone_used, caller_name, outcome, called_at');

    if (!calls?.length) {
        console.log('No prospect_calls found. Skipping call linkage.');
        return;
    }

    console.log(`Linking ${calls.length} prospect_calls to prospect_phones...`);

    const allPhones = await fetchAll<any>('prospect_phones', 'id, prospect_id, phone_number');

    const phoneMap = new Map<string, string>();
    for (const p of allPhones || []) {
        const key = `${p.prospect_id}|${normalizePhone(p.phone_number)}`;
        phoneMap.set(key, p.id);
    }

    const callUpdates: Array<any> = [];
    for (const call of calls) {
        const key = `${call.prospect_id}|${normalizePhone(call.phone_used || '')}`;
        const prospectPhoneId = phoneMap.get(key);
        if (prospectPhoneId) {
            call.prospect_phone_id = prospectPhoneId;
            callUpdates.push({
                id: call.id,
                prospect_id: call.prospect_id,
                caller_name: call.caller_name,
                outcome: call.outcome,
                prospect_phone_id: prospectPhoneId
            });
        }
    }

    console.log(`Updating ${callUpdates.length} prospect_calls in batches...`);
    let linked = 0;
    for (let i = 0; i < callUpdates.length; i += BATCH) {
        const batch = callUpdates.slice(i, i + BATCH);
        const { error } = await supabase.from('prospect_calls').upsert(batch);
        if (error) {
            console.error('\nCall linkage update error:', error);
        } else {
            linked += batch.length;
        }
        process.stdout.write(`\rLinked ${linked}/${callUpdates.length} calls...`);
    }

    console.log(`\nLinked ${linked}/${calls.length} prospect_calls to prospect_phones.`);

    // Final Sync: Update prospect_phones.call_status based on the latest call outcome
    console.log('Syncing prospect_phones status from latest call outcomes...');
    const latestCallOutcomes = new Map<string, string>();
    const latestCallDates = new Map<string, string>();

    for (const call of calls) {
        if (!call.prospect_phone_id || !call.called_at) continue;

        const existingDate = latestCallDates.get(call.prospect_phone_id);
        if (!existingDate || new Date(call.called_at) > new Date(existingDate)) {
            latestCallDates.set(call.prospect_phone_id, call.called_at);
            latestCallOutcomes.set(call.prospect_phone_id, call.outcome);
        }
    }

    // Create a map for quick lookup of required fields
    const phoneDetailsMap = new Map<string, { prospect_id: string, phone_number: string }>();
    for (const p of allPhones || []) {
        phoneDetailsMap.set(p.id, { prospect_id: p.prospect_id, phone_number: p.phone_number });
    }

    const phoneStatusUpdates: any[] = [];
    for (const [phoneId, outcome] of latestCallOutcomes.entries()) {
        const details = phoneDetailsMap.get(phoneId);
        if (details) {
            phoneStatusUpdates.push({
                id: phoneId,
                prospect_id: details.prospect_id,
                phone_number: details.phone_number,
                call_status: outcome
            });
        }
    }

    if (phoneStatusUpdates.length > 0) {
        console.log(`Updating statuses for ${phoneStatusUpdates.length} phones...`);
        for (let i = 0; i < phoneStatusUpdates.length; i += BATCH) {
            const batch = phoneStatusUpdates.slice(i, i + BATCH);
            const { error } = await supabase.from('prospect_phones').upsert(batch);
            if (error) {
                console.error('Phone status sync error:', error);
            }
            process.stdout.write(`\rSynced ${Math.min(i + BATCH, phoneStatusUpdates.length)}/${phoneStatusUpdates.length} statuses...`);
        }
        console.log('\nStatus synchronization complete.');
    }

    console.log('Migration complete.');
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
