import { NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import Papa from 'papaparse';

export interface CsvValidationResult {
    csvRowCount: number;
    fields: string[];
    emails: {
        total: number;      // After splitting comma-separated
        valid: number;      // After validation + dedup
        duplicates: number;
        invalid: number;
        missing: number;
    };
    errors: string[];     // Detailed error messages with row numbers
}

// POST /api/campaigns/:id/validate-csv
// Dry-run validation: checks CSV without generating emails
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse CSV from form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(JSON.stringify({ error: 'CSV file is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const csvText = await file.text();
        const parseResult = Papa.parse<Record<string, string>>(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header: string) => header.trim(),
            transform: (value: string) => value.trim(),
        });

        if (parseResult.errors.length > 0) {
            return new Response(JSON.stringify({
                error: 'CSV parsing failed',
                details: parseResult.errors.map(e => e.message),
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const rows = parseResult.data;
        if (rows.length === 0) {
            return new Response(JSON.stringify({ error: 'CSV file is empty' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get fields from CSV
        const fields = Object.keys(rows[0]);

        // Validate required Email column
        if (!fields.some(f => f.toLowerCase() === 'email')) {
            return new Response(JSON.stringify({
                error: 'CSV must have an "Email" column',
                availableColumns: fields,
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate emails and count duplicates/invalid
        const seenEmails = new Set<string>();
        const errors: string[] = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let totalEmails = 0;
        let validEmails = 0;
        let duplicates = 0;
        let invalid = 0;
        let missing = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const emailField = (row.Email || row.email || '').trim();

            if (!emailField) {
                errors.push(`Row ${i + 2}: Missing email`);
                missing++;
                continue;
            }

            // Handle comma-separated emails in a single cell
            const emailAddresses = emailField.split(',').map(e => e.trim()).filter(e => e.length > 0);
            totalEmails += emailAddresses.length;

            if (emailAddresses.length === 0) {
                errors.push(`Row ${i + 2}: Missing email`);
                missing++;
                continue;
            }

            for (const email of emailAddresses) {
                const normalizedEmail = email.toLowerCase().trim();

                if (!normalizedEmail) continue;

                if (!emailRegex.test(normalizedEmail)) {
                    errors.push(`Row ${i + 2}: Invalid email format "${email}"`);
                    invalid++;
                    continue;
                }

                if (seenEmails.has(normalizedEmail)) {
                    errors.push(`Row ${i + 2}: Duplicate email "${email}"`);
                    duplicates++;
                    continue;
                }

                seenEmails.add(normalizedEmail);
                validEmails++;
            }
        }

        const result: CsvValidationResult = {
            csvRowCount: rows.length,
            fields,
            emails: {
                total: totalEmails,
                valid: validEmails,
                duplicates,
                invalid,
                missing,
            },
            errors: errors.slice(0, 20), // Limit errors to first 20
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('POST /api/campaigns/:id/validate-csv error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
