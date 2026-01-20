import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file (same pattern as other scripts)
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars: { [key: string]: string } = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        // Remove quotes if present
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value;
      }
    }
  });

  return envVars;
}

const envVars = loadEnvFile();
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

interface ContactRow {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string | null;
  location: string | null;
  source: string | null;
  details: any;
}

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

async function exportFamilyOfficeContacts() {
  console.log('Starting export of family-office contacts...');

  const pageSize = 1000;
  let offset = 0;
  let allRows: ContactRow[] = [];
  let totalCount: number | null = null;

  while (true) {
    console.log(`Fetching contacts ${offset + 1} to ${offset + pageSize}...`);

    const { data, error, count } = await supabase
      .from('contacts')
      .select('id,email,name,company,role,location,source,details', { count: 'exact' })
      .or('details->>Tags.eq.family-office,details->>Tags.eq.multi-family-office')
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching contacts:', error);
      process.exit(1);
    }

    if (totalCount === null && typeof count === 'number') {
      totalCount = count;
      console.log(`Total matching contacts reported by database: ${totalCount}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows = allRows.concat(data as ContactRow[]);
    offset += data.length;

    if (data.length < pageSize) {
      break;
    }
  }

  console.log(`Fetched ${allRows.length} contacts in total.`);

  const headers = [
    'id',
    'email',
    'name',
    'company',
    'role',
    'location',
    'source',
    'details_json'
  ];

  const lines: string[] = [];
  lines.push(headers.map(h => escapeCsv(h)).join(','));

  for (const row of allRows) {
    const detailsJson = row.details ? JSON.stringify(row.details) : '';
    const line = [
      escapeCsv(row.id),
      escapeCsv(row.email),
      escapeCsv(row.name ?? ''),
      escapeCsv(row.company ?? ''),
      escapeCsv(row.role ?? ''),
      escapeCsv(row.location ?? ''),
      escapeCsv(row.source ?? ''),
      escapeCsv(detailsJson)
    ].join(',');
    lines.push(line);
  }

  const outputPath = path.join(process.cwd(), 'family_office_contacts.csv');
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

  console.log(`Export complete. Wrote ${allRows.length} rows to ${outputPath}`);
}

exportFamilyOfficeContacts().catch(err => {
  console.error('Unexpected error during export:', err);
  process.exit(1);
});

