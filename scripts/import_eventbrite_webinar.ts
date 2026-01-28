import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

// Load .env manually from the root of oz-dev-dash
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
            }
        });
    }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface EventbriteAttendee {
    'Order ID': string;
    'Order date': string;
    'Attendee first name': string;
    'Attendee last name': string;
    'Attendee email': string;
    'Phone number': string;
    'Purchaser city': string;
    'Purchaser state': string;
    'Purchaser country': string;
    'Event name': string;
    'Ticket type': string;
}

async function importEventbriteWebinar(filePath: string) {
    console.log(`Reading Eventbrite attendees: ${filePath}`);

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse CSV
        const { data, errors } = Papa.parse<EventbriteAttendee>(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim()
        });

        if (errors.length > 0) {
            console.warn('CSV Parsing Errors:', errors);
        }

        console.log(`Parsed ${data.length} attendee rows.`);

        let successCount = 0;
        let updateCount = 0;
        let insertCount = 0;
        let errorCount = 0;

        for (const row of data) {
            const email = row['Attendee email']?.trim().toLowerCase();
            if (!email) continue;

            const firstName = row['Attendee first name']?.trim() || '';
            const lastName = row['Attendee last name']?.trim() || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const eventName = row['Event name']?.trim() || 'Unknown Webinar';
            
            // Construct location string
            const city = row['Purchaser city']?.trim();
            const state = row['Purchaser state']?.trim();
            const country = row['Purchaser country']?.trim();
            const location = [city, state, country].filter(Boolean).join(', ');

            // Prepare webinar-specific details
            const webinarDetails = {
                order_id: row['Order ID'],
                order_date: row['Order date'],
                ticket_type: row['Ticket type'],
                event_name: eventName,
                engagement_type: 'webinar_attendee',
                lead_status: 'warm', // Convention
                email_status: 'Valid' // Convention
            };

            // 1. Check if contact exists
            const { data: existingContact } = await supabase
                .from('contacts')
                .select('id, name, location, phone_number, details, contact_types')
                .eq('email', email)
                .single();

            if (existingContact) {
                console.log(`[DUPLICATE] Found existing contact for ${email}. Merging data...`);
                // UPDATE existing contact
                const existingDetails = existingContact.details || {};
                const updatedDetails = {
                    ...existingDetails,
                    ...webinarDetails,
                    last_webinar_attended: eventName
                };

                const { error: updateError } = await supabase
                    .from('contacts')
                    .update({
                        name: existingContact.name || fullName || null,
                        location: existingContact.location || location || null,
                        phone_number: existingContact.phone_number || row['Phone number']?.trim() || null,
                        details: updatedDetails,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingContact.id);

                if (updateError) {
                    console.error(`Error updating contact ${email}:`, updateError);
                    errorCount++;
                } else {
                    console.log(`✓ Merged webinar data into existing contact: ${email}`);
                    updateCount++;
                    successCount++;
                }
            } else {
                // INSERT new contact
                const newContact = {
                    email: email,
                    name: fullName || null,
                    location: location || null,
                    phone_number: row['Phone number']?.trim() || null,
                    source: `eventbrite_${eventName.replace(/\s+/g, '_').toLowerCase()}`,
                    contact_types: ['investor'], // Defaulting to investor for webinar attendees
                    details: webinarDetails,
                    updated_at: new Date().toISOString()
                };

                const { error: insertError } = await supabase
                    .from('contacts')
                    .insert(newContact);

                if (insertError) {
                    console.error(`Error inserting contact ${email}:`, insertError);
                    errorCount++;
                } else {
                    console.log(`+ Inserted NEW contact: ${email}`);
                    insertCount++;
                    successCount++;
                }
            }
        }

        console.log('\n' + '='.repeat(40));
        console.log('IMPORT COMPLETE');
        console.log(`Total rows processed: ${data.length}`);
        console.log(`Successfully processed: ${successCount}`);
        console.log(`  - New contacts inserted: ${insertCount}`);
        console.log(`  - Existing contacts updated (duplicates): ${updateCount}`);
        console.log(`Errors encountered: ${errorCount}`);
        console.log('='.repeat(40));

    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
}

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: npx tsx scripts/import_eventbrite_webinar.ts <path-to-csv>');
    process.exit(1);
}

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

importEventbriteWebinar(filePath);
