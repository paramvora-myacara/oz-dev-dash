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

interface CSVRow {
    Name: string;
    Email: string;
    'Phone Number': string;
    Role: string;
    Company: string;
    Location: string;
    Source: string;
    Details: string;
}

async function importContacts(filePath: string) {
    console.log(`Reading file: ${filePath}`);

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse CSV
        const { data, errors } = Papa.parse<CSVRow>(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim()
        });

        if (errors.length > 0) {
            console.warn('CSV Parsing Errors:', errors);
        }

        console.log(`Parsed ${data.length} rows.`);

        const batchSize = 100;
        let processed = 0;

        // Prepare batches
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            const records = batch.map(row => {
                // Basic normalization
                let email = row.Email ? row.Email.trim() : '';
                // Note: We intentionally keep multiple emails (comma separated) in the email field
                // so the UI validates them and asks user to choose.
                // But we DO lowercase them to ensure consistency?
                // If string contains comma, lowercasing the whole string is fine.
                email = email.toLowerCase();

                return {
                    email: email,
                    name: row.Name?.trim() || null,
                    company: row.Company?.trim() || null,
                    role: row.Role?.trim() || null,
                    location: row.Location?.trim() || null,
                    phone_number: row['Phone Number']?.trim() || null,
                    source: row.Source?.trim() || path.basename(filePath),
                    details: row.Details ? tryParseJSON(row.Details) : {},
                    updated_at: new Date().toISOString()
                };
            }).filter(r => r.email); // Skip rows without email

            if (records.length === 0) continue;

            // Deduplicate within batch
            const uniqueRecords = Array.from(new Map(records.map(item => [item.email, item])).values());

            const { error } = await supabase
                .from('contacts')
                .upsert(uniqueRecords, {
                    onConflict: 'email',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error('Error inserting batch:', error);
            } else {
                processed += records.length;
                process.stdout.write(`\rImported ${processed}/${data.length} contacts...`);
            }
        }

        console.log('\nImport complete!');
    } catch (err) {
        console.error('Failed to import contacts:', err);
    }
}

function tryParseJSON(str: string) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return { raw: str };
    }
}

// Check args
const args = process.argv.slice(2);
const targetFile = args[0] || path.join(process.cwd(), 'docs', 'developers.csv'); // Default path

if (!fs.existsSync(targetFile)) {
    // try absolute
    if (!fs.existsSync(args[0])) {
        console.error(`File not found: ${targetFile}`);
        console.log('Usage: tsx scripts/import_contacts.ts <path-to-csv>');
        process.exit(1);
    }
}

importContacts(targetFile);
