import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface CSVRow {
    'Property Name': string;
    'Market': string;
    'Submarket': string;
    'Address': string;
    'City': string;
    'State': string;
    'ZIP': string;
    'Owner': string;
    'Owner Address': string;
    'Owner City': string;
    'Owner State': string;
    'Owner ZIP': string;
    'Owner Contact First Name': string;
    'Owner Contact Last Name': string;
    'Owner Contact Phone Number': string;
    'Owner Contact Email': string;
    'Manager': string;
    'Manager Address': string;
    'Manager City': string;
    'Manager State': string;
    'Manager ZIP': string;
    'Manager Contact First Name': string;
    'Manager Contact Last Name': string;
    'Manager Contact Phone Number': string;
    'Manager Contact Email': string;
    'Trustee': string;
    'Trustee Address': string;
    'Trustee City': string;
    'Trustee State': string;
    'Trustee ZIP': string;
    'Trustee Contact First Name': string;
    'Trustee Contact Last Name': string;
    'Trustee Contact Phone Number': string;
    'Trustee Contact Email': string;
    'Phone Number': string;
}

export async function importProspects(filePath: string) {
    console.log(`Reading file: ${filePath}`);

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const { data, errors } = Papa.parse<CSVRow>(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim()
        });

        if (errors.length > 0) {
            console.warn('CSV Parsing Errors:', errors);
        }

        console.log(`Parsed ${data.length} rows.`);

        // Aggregate by property_name and address to avoid batch conflict errors
        const aggregated = new Map<string, any>();

        for (const row of data) {
            const key = `${row['Property Name']?.trim()}|${row['Address']?.trim()}`;
            const phoneNumbers: any[] = [];

            // Owner
            if (row['Owner Contact Phone Number']) {
                const name = [row['Owner Contact First Name'], row['Owner Contact Last Name']].filter(Boolean).join(' ');
                phoneNumbers.push({
                    label: 'Owner',
                    number: row['Owner Contact Phone Number'].trim(),
                    contactName: name,
                    contactEmail: row['Owner Contact Email']?.trim().toLowerCase(),
                    callCount: 0,
                    details: {
                        'Entity Name': row['Owner'],
                        'Address': row['Owner Address']
                    }
                });
            }

            // Manager
            if (row['Manager Contact Phone Number']) {
                const name = [row['Manager Contact First Name'], row['Manager Contact Last Name']].filter(Boolean).join(' ');
                phoneNumbers.push({
                    label: 'Manager',
                    number: row['Manager Contact Phone Number'].trim(),
                    contactName: name,
                    contactEmail: row['Manager Contact Email']?.trim().toLowerCase(),
                    callCount: 0,
                    details: {
                        'Entity Name': row['Manager'],
                        'Address': row['Manager Address']
                    }
                });
            }

            // Property
            if (row['Phone Number']) {
                phoneNumbers.push({
                    label: 'Property',
                    number: row['Phone Number'].trim(),
                    callCount: 0
                });
            }

            if (aggregated.has(key)) {
                const existing = aggregated.get(key);
                // Append unique phone numbers
                for (const phone of phoneNumbers) {
                    if (!existing.phone_numbers.some((p: any) => p.number === phone.number)) {
                        existing.phone_numbers.push(phone);
                    }
                }
            } else {
                aggregated.set(key, {
                    property_name: row['Property Name']?.trim() || 'Unknown Project',
                    market: row['Market']?.trim() || null,
                    submarket: row['Submarket']?.trim() || null,
                    address: row['Address']?.trim() || null,
                    city: row['City']?.trim() || null,
                    state: row['State']?.trim() || null,
                    zip: row['ZIP']?.trim() || null,
                    phone_numbers: phoneNumbers,
                    call_status: 'new',
                    updated_at: new Date().toISOString()
                });
            }
        }

        const aggregatedData = Array.from(aggregated.values());
        console.log(`Aggregated into ${aggregatedData.length} unique properties.`);

        const batchSize = 1000;
        let processed = 0;

        for (let i = 0; i < aggregatedData.length; i += batchSize) {
            const batch = aggregatedData.slice(i, i + batchSize);
            const { error } = await supabase
                .from('prospects')
                .upsert(batch, {
                    onConflict: 'property_name,address',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error('Error inserting batch:', error);
            } else {
                processed += batch.length;
                process.stdout.write(`\rImported ${processed}/${aggregatedData.length} prospects...`);
            }
        }

        console.log('\nImport complete!');
    } catch (err) {
        console.error('Failed to import prospects:', err);
        throw err;
    }
}

// Check if run directly
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
    const args = process.argv.slice(2);
    const defaultFile = '/Users/aryanjain/Documents/OZL/UsefulDocs/QOZB-Contacts/All QOZB Development Projects USA - 20260126.xlsx - Results.csv';
    const targetFile = args[0] || defaultFile;

    importProspects(targetFile).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
