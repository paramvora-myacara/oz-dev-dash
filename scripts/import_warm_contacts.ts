import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
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

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using Anon key is fine if RLS allows or if using Service Key.
// Ideally use Service Key for Admin work.
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface WarmContactRow {
    email: string;
    name: string;
    phone_number: string;
    location: string;
    source: string;
    details: string;
}

async function importWarmContacts(filePath: string) {
    console.log(`Reading warm contacts file: ${filePath}`);

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse CSV
        const { data, errors } = Papa.parse<WarmContactRow>(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim()
        });

        if (errors.length > 0) {
            console.warn('CSV Parsing Errors:', errors);
        }

        console.log(`Parsed ${data.length} warm contact rows.`);

        const batchSize = 50;
        let processed = 0;
        let successCount = 0;
        let errorCount = 0;

        // Prepare batches
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            console.log(`Processing batch of ${batch.length} contacts...`);

            for (const row of batch) {
                // Basic normalization
                let email = row.email ? row.email.trim().toLowerCase() : '';
                if (!email) continue;

                let details: Record<string, any> = {};

                // Parse the details JSON string
                if (row.details) {
                    try {
                        details = JSON.parse(row.details);
                    } catch (e) {
                        console.warn(`Failed to parse details for ${email}:`, e);
                        details = {};
                    }
                }

                // Ensure email_status is set to Valid
                details['email_status'] = 'Valid';

                // Check if contact already exists
                const { data: existingContact } = await supabase
                    .from('contacts')
                    .select('id, details')
                    .eq('email', email)
                    .single();

                if (existingContact) {
                    // Contact exists - only update the details field to mark as warm
                    const existingDetails = existingContact.details || {};
                    const updatedDetails = {
                        ...existingDetails,
                        ...details, // Merge new details (including lead_status: "warm")
                        lead_status: 'warm', // Ensure lead_status is set to warm
                        email_status: 'Valid' // Ensure email_status is set to Valid
                    };

                    const { error: updateError } = await supabase
                        .from('contacts')
                        .update({
                            details: updatedDetails,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingContact.id);

                    if (updateError) {
                        console.error(`Error updating existing contact ${email}:`, updateError);
                        errorCount++;
                    } else {
                        console.log(`✓ Updated existing contact: ${email}`);
                        successCount++;
                    }
                } else {
                    // Contact doesn't exist - insert new record
                    const newContact = {
                        email: email,
                        name: row.name?.trim() || null,
                        company: null, // Not provided in warm list
                        role: null, // Not provided in warm list
                        location: row.location?.trim() || null,
                        phone_number: row.phone_number?.trim() || null,
                        source: row.source?.trim() || 'warm_list_import',
                        details: details,
                        updated_at: new Date().toISOString()
                    };

                    const { error: insertError } = await supabase
                        .from('contacts')
                        .insert(newContact);

                    if (insertError) {
                        console.error(`Error inserting new contact ${email}:`, insertError);
                        errorCount++;
                    } else {
                        console.log(`✓ Inserted new contact: ${email}`);
                        successCount++;
                    }
                }
            }

            processed += batch.length;
            console.log(`Progress: ${processed}/${data.length} contacts processed`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('WARM CONTACTS IMPORT COMPLETE');
        console.log('='.repeat(60));
        console.log(`Total contacts processed: ${data.length}`);
        console.log(`Successfully processed: ${successCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log('\nNote: Existing contacts were updated to set lead_status="warm"');
        console.log('New contacts were inserted with full warm list data');

    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
}

// Check if file path is provided
const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: npx tsx scripts/import_warm_contacts.ts <path-to-csv>');
    console.error('Example: npx tsx scripts/import_warm_contacts.ts ../../../UsefulDocs/Outreach-Lists/WarmList/unified_warm_list.csv');
    process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

importWarmContacts(filePath);
