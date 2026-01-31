import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import Papa from 'papaparse';
import { Prospect, PhoneNumber } from '@/types/prospect';

const CSV_PATH = '/Users/aryanjain/Documents/OZL/UsefulDocs/QOZB-Contacts/All QOZB Development Projects USA - 20260126.xlsx - Results.csv';

export async function GET() {
    try {
        const fileContent = await fs.readFile(CSV_PATH, 'utf-8');

        const parseResult = Papa.parse<Record<string, string>>(fileContent, {
            header: true,
            skipEmptyLines: true,
        });

        if (parseResult.errors.length > 0) {
            console.warn('CSV Parse errors:', parseResult.errors);
        }

        const prospects: Prospect[] = parseResult.data.map((row, index) => {
            // Aggregate phone numbers
            // Aggregate phone numbers with associated contact info
            const phones: PhoneNumber[] = [];



            if (row['Owner Contact Phone Number']) {
                const name = [row['Owner Contact First Name'], row['Owner Contact Last Name']].filter(Boolean).join(' ');
                phones.push({
                    label: 'Owner',
                    number: row['Owner Contact Phone Number'],
                    callCount: 0,
                    contactName: name,
                    contactEmail: row['Owner Contact Email'],
                    details: {
                        'Entity Name': row['Owner'],
                        'Address': row['Owner Address'],
                        'City': row['Owner City'],
                        'State': row['Owner State'],
                        'ZIP': row['Owner ZIP']
                    }
                });
            }

            if (row['Manager Contact Phone Number']) {
                const name = [row['Manager Contact First Name'], row['Manager Contact Last Name']].filter(Boolean).join(' ');
                phones.push({
                    label: 'Manager',
                    number: row['Manager Contact Phone Number'],
                    callCount: 0,
                    contactName: name,
                    contactEmail: row['Manager Contact Email'],
                    details: {
                        'Entity Name': row['Manager'],
                        'Address': row['Manager Address'],
                        'City': row['Manager City'],
                        'State': row['Manager State'],
                        'ZIP': row['Manager ZIP']
                    }
                });
            }

            if (row['Phone Number']) {
                phones.push({ label: 'Property', number: row['Phone Number'], callCount: 0 });
            }

            if (row['Trustee Contact Phone Number']) {
                const name = [row['Trustee Contact First Name'], row['Trustee Contact Last Name']].filter(Boolean).join(' ');
                phones.push({
                    label: 'Trustee',
                    number: row['Trustee Contact Phone Number'],
                    callCount: 0,
                    contactName: name,
                    contactEmail: row['Trustee Contact Email'],
                    details: {
                        'Entity Name': row['Trustee'],
                        'Address': row['Trustee Address'],
                        'City': row['Trustee City'],
                        'State': row['Trustee State'],
                        'ZIP': row['Trustee ZIP']
                    }
                });
            }

            // Combine Owner Name
            const firstName = row['Owner Contact First Name'] || '';
            const lastName = row['Owner Contact Last Name'] || '';
            const ownerName = `${firstName} ${lastName}`.trim();

            return {
                id: `prospect-${index}`, // Simple mock ID
                market: row['Market'] || '',
                submarket: row['Submarket'] || '',
                propertyName: row['Property Name'] || '',
                address: row['Address'] || '',
                city: row['City'] || '',
                state: row['State'] || '',
                zip: row['ZIP'] || '',

                ownerName: ownerName || row['Owner'] || 'Unknown Owner',
                ownerEmail: row['Owner Contact Email'] || '',

                phoneNumbers: phones,

                // Default / Mocked status
                callStatus: 'new',

                // Keep raw for debug
                raw: row
            };
        });

        // Let's limit to 2000 for the UI mock to balance performance (20k might lag without virtualization)
        return NextResponse.json(prospects.slice(0, 2000));

    } catch (error) {
        console.error('Failed to read prospects CSV:', error);
        return NextResponse.json({ error: 'Failed to load prospects' }, { status: 500 });
    }
}
