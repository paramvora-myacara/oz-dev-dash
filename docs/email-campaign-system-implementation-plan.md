# Email Campaign System - Implementation Plan

> **Purpose**: Step-by-step guide for implementing the email campaign backend and connecting it to the existing email editor frontend.
> 
> **Approach**: Frontend → Backend flow. Each step includes verification tests and a git commit checkpoint.

---

## Prerequisites

Before starting, ensure:
- [ ] oz-dev-dash dev server runs successfully (`npm run dev`)
- [ ] Supabase project is accessible
- [ ] Email editor frontend exists at `/src/components/email-editor/`
- [ ] Campaign runner exists in `ozl-backend/services/campaign-runner/`

---

## Phase 1: Database Schema Setup

### Step 1.1: Create Campaigns Table Migration

**Goal**: Create the `campaigns` table in Supabase.

**Implementation**:
1. Create a new migration file: `supabase/migrations/[timestamp]_create_campaigns_table.sql`
2. Add the following schema:

```sql
-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_slug TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  subject_line JSONB NOT NULL DEFAULT '{"mode": "static", "content": ""}',
  email_format TEXT DEFAULT 'html' CHECK (email_format IN ('html', 'text')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'staged', 'scheduled', 'sending', 'completed', 'paused', 'cancelled')),
  total_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies (adjust based on your auth setup)
CREATE POLICY "Admins can manage campaigns" ON campaigns
  FOR ALL USING (true);  -- Adjust for proper admin check
```

**Verification Tests**:
```bash
# 1. Push migration to Supabase
npx supabase db push

# 2. Verify table exists via Supabase dashboard or:
curl -X GET "${SUPABASE_URL}/rest/v1/campaigns?select=*&limit=1" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"

# Expected: Empty array [] or 200 response
```

**Manual Verification**:
- [ ] Open Supabase dashboard → Table Editor → Verify `campaigns` table exists
- [ ] Verify all columns are present with correct types

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(db): add campaigns table migration"
```

---

### Step 1.2: Update email_queue Table

**Goal**: Add `campaign_id`, `is_edited` columns and allow NULLs for staged emails.

**Implementation**:
1. Create migration file: `supabase/migrations/[timestamp]_update_email_queue_for_staging.sql`

```sql
-- Add campaign_id reference
ALTER TABLE email_queue 
  ADD COLUMN IF NOT EXISTS campaign_id UUID;

-- Add is_edited flag for tracking manual edits
ALTER TABLE email_queue 
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Allow NULL values for fields that are set at launch time (not staging)
-- Note: Only run these if the columns have NOT NULL constraints
-- ALTER TABLE email_queue ALTER COLUMN scheduled_for DROP NOT NULL;
-- ALTER TABLE email_queue ALTER COLUMN from_email DROP NOT NULL;
-- ALTER TABLE email_queue ALTER COLUMN domain_index DROP NOT NULL;

-- Add 'staged' and 'rejected' to allowed status values if using CHECK constraint
-- If status is TEXT without constraint, skip this

-- Create index for efficient staging queries
CREATE INDEX IF NOT EXISTS idx_email_queue_campaign_status 
  ON email_queue(campaign_id, status);

-- Create index for staged emails
CREATE INDEX IF NOT EXISTS idx_email_queue_staged 
  ON email_queue(campaign_id) 
  WHERE status = 'staged';
```

**Verification Tests**:
```bash
# 1. Push migration
npx supabase db push

# 2. Verify columns exist
curl -X GET "${SUPABASE_URL}/rest/v1/email_queue?select=id,campaign_id,is_edited&limit=1" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"

# Expected: 200 response (empty array is fine)

# 3. Test inserting a staged email (should work with NULL scheduled_for)
curl -X POST "${SUPABASE_URL}/rest/v1/email_queue" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "subject": "Test",
    "body": "Test body",
    "status": "staged"
  }'

# Expected: 201 Created

# 4. Clean up test data
curl -X DELETE "${SUPABASE_URL}/rest/v1/email_queue?to_email=eq.test@example.com" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
```

**Manual Verification**:
- [ ] Verify `campaign_id` column exists in email_queue
- [ ] Verify `is_edited` column exists in email_queue
- [ ] Verify indexes are created

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(db): update email_queue table for campaign staging support"
```

---

## Phase 2: TypeScript Types & Utilities

### Step 2.1: Update Email Editor Types

**Goal**: Add campaign-related types to the frontend.

**Implementation**:
1. Update `src/types/email-editor.ts`:

```typescript
// Add to existing types

export type CampaignStatus = 'draft' | 'staged' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'cancelled';
export type EmailFormat = 'html' | 'text';
export type QueuedEmailStatus = 'staged' | 'queued' | 'processing' | 'sent' | 'failed' | 'rejected';

export interface Campaign {
  id: string;
  name: string;
  templateSlug: string | null;
  sections: Section[];
  subjectLine: {
    mode: SectionMode;
    content: string;
    selectedFields?: string[];
  };
  emailFormat: EmailFormat;
  status: CampaignStatus;
  totalRecipients: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface QueuedEmail {
  id: string;
  campaignId: string;
  toEmail: string;
  fromEmail: string | null;
  subject: string;
  body: string;
  status: QueuedEmailStatus;
  scheduledFor: string | null;
  domainIndex: number | null;
  isEdited: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface GenerateResponse {
  success: boolean;
  staged: number;
  errors?: string[];
}

export interface LaunchResponse {
  success: boolean;
  queued: number;
  scheduling: {
    timezone: string;
    intervalMinutes: number;
    startTimeUTC: string;
    estimatedEndTimeUTC: string;
    emailsByDay: Record<string, number>;
    totalDays: number;
  };
}
```

**Verification Tests**:
```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# Expected: No errors related to email-editor.ts
```

**Manual Verification**:
- [ ] No TypeScript errors in IDE
- [ ] Types are properly exported

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(types): add campaign and queued email types"
```

---

### Step 2.2: Create API Client Utilities

**Goal**: Create typed API client functions for campaign operations.

**Implementation**:
1. Create `src/lib/api/campaigns.ts`:

```typescript
import type { Campaign, QueuedEmail, GenerateResponse, LaunchResponse } from '@/types/email-editor';

const API_BASE = '/api/campaigns';

// Campaign CRUD
export async function createCampaign(data: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCampaigns(): Promise<Campaign[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCampaign(id: string): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

// Email Generation & Staging
export async function generateEmails(campaignId: string, csvFile: File): Promise<GenerateResponse> {
  const formData = new FormData();
  formData.append('file', csvFile);
  
  const res = await fetch(`${API_BASE}/${campaignId}/generate`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getStagedEmails(
  campaignId: string, 
  options?: { status?: string; limit?: number; offset?: number }
): Promise<{ emails: QueuedEmail[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());
  
  const res = await fetch(`${API_BASE}/${campaignId}/emails?${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateStagedEmail(
  campaignId: string, 
  emailId: string, 
  data: { subject?: string; body?: string }
): Promise<QueuedEmail> {
  const res = await fetch(`${API_BASE}/${campaignId}/emails/${emailId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Launch
export async function launchCampaign(
  campaignId: string, 
  options?: { emailIds?: string[]; all?: boolean }
): Promise<LaunchResponse> {
  const res = await fetch(`${API_BASE}/${campaignId}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options || { all: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Test Send
export async function sendTestEmail(campaignId: string, testEmail: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/${campaignId}/test-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testEmail }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

**Verification Tests**:
```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# Expected: No errors
```

**Manual Verification**:
- [ ] File created at correct path
- [ ] No TypeScript errors
- [ ] All functions properly typed

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(lib): add campaign API client utilities"
```

---

## Phase 3: Backend API Routes

### Step 3.1: Campaign CRUD API

**Goal**: Create basic CRUD endpoints for campaigns.

**Implementation**:
1. Create `src/app/api/campaigns/route.ts` (GET list, POST create):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase
    const campaigns = data.map(row => ({
      id: row.id,
      name: row.name,
      templateSlug: row.template_slug,
      sections: row.sections,
      subjectLine: row.subject_line,
      emailFormat: row.email_format,
      status: row.status,
      totalRecipients: row.total_recipients,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
    }));

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateSlug, sections, subjectLine, emailFormat } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name,
        template_slug: templateSlug || null,
        sections: sections || [],
        subject_line: subjectLine || { mode: 'static', content: '' },
        email_format: emailFormat || 'html',
        status: 'draft',
        created_by: adminUser.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      templateSlug: data.template_slug,
      sections: data.sections,
      subjectLine: data.subject_line,
      emailFormat: data.email_format,
      status: data.status,
      totalRecipients: data.total_recipients,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

2. Create `src/app/api/campaigns/[id]/route.ts` (GET, PUT, DELETE single campaign):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/campaigns/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      templateSlug: data.template_slug,
      sections: data.sections,
      subjectLine: data.subject_line,
      emailFormat: data.email_format,
      status: data.status,
      totalRecipients: data.total_recipients,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
    });
  } catch (error) {
    console.error('GET /api/campaigns/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/campaigns/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const supabase = createAdminClient();

    // Build update object (only include provided fields)
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.templateSlug !== undefined) updates.template_slug = body.templateSlug;
    if (body.sections !== undefined) updates.sections = body.sections;
    if (body.subjectLine !== undefined) updates.subject_line = body.subjectLine;
    if (body.emailFormat !== undefined) updates.email_format = body.emailFormat;
    if (body.status !== undefined) updates.status = body.status;

    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Campaign not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      templateSlug: data.template_slug,
      sections: data.sections,
      subjectLine: data.subject_line,
      emailFormat: data.email_format,
      status: data.status,
      totalRecipients: data.total_recipients,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
    });
  } catch (error) {
    console.error('PUT /api/campaigns/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/campaigns/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Delete associated queued emails first
    await supabase
      .from('email_queue')
      .delete()
      .eq('campaign_id', id);

    // Delete campaign
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/campaigns/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Verification Tests**:
```bash
# Start dev server in another terminal: npm run dev

# 1. Create a campaign
curl -X POST "http://localhost:3000/api/campaigns" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{
    "name": "Test Campaign",
    "templateSlug": "outreach-marketing",
    "sections": [],
    "subjectLine": {"mode": "static", "content": "Hello {{Name}}"}
  }'

# Expected: 201 with campaign object including id

# 2. List campaigns
curl "http://localhost:3000/api/campaigns" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: Array with the created campaign

# 3. Get single campaign (use id from step 1)
curl "http://localhost:3000/api/campaigns/<campaign-id>" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: Campaign object

# 4. Update campaign
curl -X PUT "http://localhost:3000/api/campaigns/<campaign-id>" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"name": "Updated Campaign Name"}'

# Expected: Updated campaign object

# 5. Delete campaign
curl -X DELETE "http://localhost:3000/api/campaigns/<campaign-id>" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: {"success": true}
```

**Manual Verification**:
- [ ] All CRUD operations return expected responses
- [ ] Data appears/disappears in Supabase dashboard
- [ ] Unauthorized requests (no cookie) return 401

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(api): add campaign CRUD endpoints"
```

---

### Step 3.2: Generate Emails API (Staging)

**Goal**: Create endpoint to generate staged emails from CSV + campaign configuration.

**Implementation**:
1. Create `src/app/api/campaigns/[id]/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import Papa from 'papaparse';
import { generateEmailHtml } from '@/components/email-editor/EmailPreviewRenderer';

// POST /api/campaigns/:id/generate
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const supabase = createAdminClient();

    // 1. Get campaign configuration
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only generate emails for draft campaigns' },
        { status: 400 }
      );
    }

    // 2. Parse CSV from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

    const csvText = await file.text();
    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parsing failed',
        details: parseResult.errors.map(e => e.message),
      }, { status: 400 });
    }

    const rows = parseResult.data;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // 3. Validate required Email column
    const firstRow = rows[0];
    if (!('Email' in firstRow) && !('email' in firstRow)) {
      return NextResponse.json({
        error: 'CSV must have an "Email" column',
        availableColumns: Object.keys(firstRow),
      }, { status: 400 });
    }

    // 4. Helper to replace template variables
    const replaceVariables = (text: string, row: Record<string, string>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = row[varName] || row[varName.toLowerCase()] || row[varName.toUpperCase()];
        return value !== undefined ? value : match;
      });
    };

    // 5. Validate emails and detect duplicates
    const seenEmails = new Set<string>();
    const errors: string[] = [];
    const validRows: Array<{ row: Record<string, string>; email: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = (row.Email || row.email || '').toLowerCase().trim();
      
      if (!email) {
        errors.push(`Row ${i + 2}: Missing email`);
        continue;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${i + 2}: Invalid email format "${email}"`);
        continue;
      }

      if (seenEmails.has(email)) {
        errors.push(`Row ${i + 2}: Duplicate email "${email}"`);
        continue;
      }

      seenEmails.add(email);
      validRows.push({ row, email });
    }

    if (validRows.length === 0) {
      return NextResponse.json({
        error: 'No valid recipients found',
        details: errors,
      }, { status: 400 });
    }

    // 6. Delete any existing staged emails for this campaign
    await supabase
      .from('email_queue')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('status', 'staged');

    // 7. Generate emails for each recipient
    const subjectLineContent = campaign.subject_line?.content || '';
    const sections = campaign.sections || [];
    
    const queueRows = validRows.map(({ row, email }) => {
      // Replace variables in subject
      const subject = replaceVariables(subjectLineContent, row);
      
      // Generate body based on format
      let body: string;
      if (campaign.email_format === 'text') {
        // Plain text: concatenate sections
        body = sections
          .filter((s: any) => s.type === 'text')
          .map((s: any) => replaceVariables(s.content || '', row))
          .join('\n\n');
      } else {
        // HTML: use the renderer
        body = generateEmailHtml(sections, subject, row);
      }

      return {
        campaign_id: campaignId,
        to_email: email,
        subject,
        body,
        status: 'staged',
        metadata: row, // Store all CSV data for reference
        is_edited: false,
        // These are set at launch time:
        from_email: null,
        domain_index: null,
        scheduled_for: null,
        delay_seconds: 0,
      };
    });

    // 8. Bulk insert
    const { error: insertError } = await supabase
      .from('email_queue')
      .insert(queueRows);

    if (insertError) {
      return NextResponse.json({
        error: 'Failed to insert emails',
        details: insertError.message,
      }, { status: 500 });
    }

    // 9. Update campaign status and recipient count
    await supabase
      .from('campaigns')
      .update({
        status: 'staged',
        total_recipients: validRows.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    return NextResponse.json({
      success: true,
      staged: validRows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('POST /api/campaigns/:id/generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Verification Tests**:
```bash
# 1. Create a test CSV file
cat > /tmp/test-recipients.csv << 'EOF'
Email,Name,Company
john@example.com,John Doe,Acme Corp
jane@example.com,Jane Smith,BuildCo
invalid-email,Bad User,NoEmail
john@example.com,John Duplicate,Duplicate
EOF

# 2. First create a campaign with sections
CAMPAIGN_ID=$(curl -s -X POST "http://localhost:3000/api/campaigns" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{
    "name": "Generate Test",
    "sections": [
      {"id": "1", "name": "Greeting", "type": "text", "mode": "static", "content": "Hello {{Name}} from {{Company}}!"}
    ],
    "subjectLine": {"mode": "static", "content": "Welcome {{Name}}!"}
  }' | jq -r '.id')

echo "Created campaign: $CAMPAIGN_ID"

# 3. Generate emails from CSV
curl -X POST "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/generate" \
  -H "Cookie: <your-admin-session-cookie>" \
  -F "file=@/tmp/test-recipients.csv"

# Expected: {"success": true, "staged": 2, "errors": ["Row 4: Invalid email...", "Row 5: Duplicate..."]}

# 4. Verify in Supabase - should see 2 staged emails
curl "${SUPABASE_URL}/rest/v1/email_queue?campaign_id=eq.${CAMPAIGN_ID}&select=to_email,subject,status" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"

# Expected: 2 emails with status "staged"
```

**Manual Verification**:
- [ ] Emails appear in email_queue with status='staged'
- [ ] Variables are replaced correctly in subject and body
- [ ] Invalid emails are rejected with clear error messages
- [ ] Duplicate emails are detected
- [ ] Campaign status updated to 'staged'

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(api): add email generation/staging endpoint"
```

---

### Step 3.3: List & Edit Staged Emails API

**Goal**: Create endpoints to list staged emails and edit individual emails.

**Implementation**:
1. Create `src/app/api/campaigns/[id]/emails/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/campaigns/:id/emails
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') || 'staged';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createAdminClient();

    // Get total count
    const { count } = await supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', status);

    // Get paginated emails
    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', status)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emails = (data || []).map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      toEmail: row.to_email,
      fromEmail: row.from_email,
      subject: row.subject,
      body: row.body,
      status: row.status,
      scheduledFor: row.scheduled_for,
      domainIndex: row.domain_index,
      isEdited: row.is_edited,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      emails,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('GET /api/campaigns/:id/emails error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

2. Create `src/app/api/campaigns/[id]/emails/[emailId]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/campaigns/:id/emails/:emailId
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; emailId: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId, emailId } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('id', emailId)
      .eq('campaign_id', campaignId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      campaignId: data.campaign_id,
      toEmail: data.to_email,
      fromEmail: data.from_email,
      subject: data.subject,
      body: data.body,
      status: data.status,
      scheduledFor: data.scheduled_for,
      domainIndex: data.domain_index,
      isEdited: data.is_edited,
      metadata: data.metadata,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('GET /api/campaigns/:id/emails/:emailId error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/campaigns/:id/emails/:emailId
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; emailId: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId, emailId } = await params;
    const body = await request.json();
    
    const supabase = createAdminClient();

    // Only allow editing staged emails
    const { data: existing } = await supabase
      .from('email_queue')
      .select('status')
      .eq('id', emailId)
      .eq('campaign_id', campaignId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (existing.status !== 'staged') {
      return NextResponse.json(
        { error: 'Can only edit staged emails' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, any> = { is_edited: true };
    if (body.subject !== undefined) updates.subject = body.subject;
    if (body.body !== undefined) updates.body = body.body;

    const { data, error } = await supabase
      .from('email_queue')
      .update(updates)
      .eq('id', emailId)
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      campaignId: data.campaign_id,
      toEmail: data.to_email,
      fromEmail: data.from_email,
      subject: data.subject,
      body: data.body,
      status: data.status,
      scheduledFor: data.scheduled_for,
      domainIndex: data.domain_index,
      isEdited: data.is_edited,
      metadata: data.metadata,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('PUT /api/campaigns/:id/emails/:emailId error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/campaigns/:id/emails/:emailId (reject email)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; emailId: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId, emailId } = await params;
    const supabase = createAdminClient();

    // Mark as rejected instead of deleting
    const { error } = await supabase
      .from('email_queue')
      .update({ status: 'rejected' })
      .eq('id', emailId)
      .eq('campaign_id', campaignId)
      .eq('status', 'staged');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/campaigns/:id/emails/:emailId error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Verification Tests**:
```bash
# Using the campaign from Step 3.2

# 1. List staged emails
curl "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/emails" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: {"emails": [...], "total": 2, "limit": 50, "offset": 0}

# 2. Get single email (use id from step 1)
EMAIL_ID=$(curl -s "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/emails" \
  -H "Cookie: <your-admin-session-cookie>" | jq -r '.emails[0].id')

curl "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/emails/${EMAIL_ID}" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: Full email object

# 3. Edit email
curl -X PUT "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/emails/${EMAIL_ID}" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"subject": "Manually Edited Subject"}'

# Expected: Updated email with isEdited: true

# 4. Reject email
curl -X DELETE "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/emails/${EMAIL_ID}" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: {"success": true}

# 5. Verify rejection
curl "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/emails?status=rejected" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: The rejected email
```

**Manual Verification**:
- [ ] List returns paginated emails
- [ ] Edit updates subject/body and sets isEdited flag
- [ ] Delete marks email as 'rejected' (not actually deleted)
- [ ] Cannot edit non-staged emails

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(api): add staged email list and edit endpoints"
```

---

### Step 3.4: Launch Campaign API

**Goal**: Create endpoint to approve staged emails and schedule for sending.

**Implementation**:
1. Create `src/app/api/campaigns/[id]/launch/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

// Domain configuration (same as upload route)
const DOMAIN_CONFIG = [
  { domain: 'connect-ozlistings.com', sender_name: 'jeff' },
  { domain: 'engage-ozlistings.com', sender_name: 'jeffrey' },
  { domain: 'get-ozlistings.com', sender_name: 'jeff.richmond' },
  { domain: 'join-ozlistings.com', sender_name: 'jeff.r' },
  { domain: 'outreach-ozlistings.com', sender_name: 'jeffrey.r' },
  { domain: 'ozlistings-reach.com', sender_name: 'jeff' },
  { domain: 'reach-ozlistings.com', sender_name: 'jeffrey' },
];

const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';
const WORKING_HOUR_START = 9;
const WORKING_HOUR_END = 17;
const INTERVAL_MINUTES = 3.5;
const JITTER_SECONDS_MAX = 30;

function getCurrentTimeInTimezone() {
  const now = new Date();
  const zonedTime = toZonedTime(now, TIMEZONE);
  return {
    year: zonedTime.getFullYear(),
    month: zonedTime.getMonth(),
    day: zonedTime.getDate(),
    hour: zonedTime.getHours(),
    minute: zonedTime.getMinutes(),
    second: zonedTime.getSeconds(),
  };
}

function createDateInTimezone(year: number, month: number, day: number, hour: number, minute: number, second: number): Date {
  const localDate = new Date(year, month, day, hour, minute, second);
  return fromZonedTime(localDate, TIMEZONE);
}

function getStartTimeInTimezone() {
  const now = getCurrentTimeInTimezone();
  const { year, month, day, hour } = now;
  
  if (hour < WORKING_HOUR_START) {
    return createDateInTimezone(year, month, day, WORKING_HOUR_START, 0, 0);
  } else if (hour >= WORKING_HOUR_END) {
    const tomorrow = new Date(year, month, day);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return createDateInTimezone(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), WORKING_HOUR_START, 0, 0);
  } else {
    return createDateInTimezone(year, month, day, hour, now.minute, now.second);
  }
}

function get5pmBoundary(utcDate: Date): Date {
  const zonedTime = toZonedTime(utcDate, TIMEZONE);
  return createDateInTimezone(zonedTime.getFullYear(), zonedTime.getMonth(), zonedTime.getDate(), WORKING_HOUR_END, 0, 0);
}

function getNext9am(utcDate: Date): Date {
  const zonedTime = toZonedTime(utcDate, TIMEZONE);
  const nextDay = new Date(zonedTime.getFullYear(), zonedTime.getMonth(), zonedTime.getDate());
  nextDay.setDate(nextDay.getDate() + 1);
  return createDateInTimezone(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), WORKING_HOUR_START, 0, 0);
}

function adjustToWorkingHours(candidateTime: Date): Date {
  const boundary5pm = get5pmBoundary(candidateTime);
  if (candidateTime >= boundary5pm) {
    return getNext9am(candidateTime);
  }
  return candidateTime;
}

// POST /api/campaigns/:id/launch
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await request.json().catch(() => ({}));
    const { emailIds, all = true } = body;

    const supabase = createAdminClient();

    // 1. Verify campaign exists and is in correct state
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!['staged', 'draft'].includes(campaign.status)) {
      return NextResponse.json(
        { error: 'Campaign must be in staged or draft status to launch' },
        { status: 400 }
      );
    }

    // 2. Get staged emails to approve
    let query = supabase
      .from('email_queue')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'staged')
      .order('created_at', { ascending: true });

    if (!all && emailIds && emailIds.length > 0) {
      query = query.in('id', emailIds);
    }

    const { data: stagedEmails, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!stagedEmails || stagedEmails.length === 0) {
      return NextResponse.json({ error: 'No staged emails to launch' }, { status: 400 });
    }

    // 3. Query ALL existing scheduled emails across ALL campaigns for domain coordination
    const { data: existingSchedules } = await supabase
      .from('email_queue')
      .select('domain_index, scheduled_for')
      .in('status', ['queued', 'processing'])
      .not('scheduled_for', 'is', null)
      .order('scheduled_for', { ascending: false });

    // Build map of last scheduled time per domain
    const domainLastScheduled: Record<number, Date> = {};
    if (existingSchedules) {
      for (const row of existingSchedules) {
        const domainIndex = row.domain_index as number;
        if (!(domainIndex in domainLastScheduled)) {
          domainLastScheduled[domainIndex] = new Date(row.scheduled_for);
        }
      }
    }

    // 4. Calculate scheduling
    const startTimeUTC = getStartTimeInTimezone();
    const intervalMs = INTERVAL_MINUTES * 60 * 1000;
    const domainCurrentTime: Record<number, Date> = {};
    const emailsByDay: Record<string, number> = {};

    const updates = stagedEmails.map((email, index) => {
      const domainIndex = index % DOMAIN_CONFIG.length;
      const domainConfig = DOMAIN_CONFIG[domainIndex];
      const jitterMs = Math.random() * JITTER_SECONDS_MAX * 1000;

      let scheduledFor: Date;

      if (domainIndex in domainLastScheduled && !(domainIndex in domainCurrentTime)) {
        // Has existing scheduled emails from other campaigns
        const lastScheduled = domainLastScheduled[domainIndex];
        scheduledFor = adjustToWorkingHours(new Date(lastScheduled.getTime() + intervalMs + jitterMs));
      } else if (domainIndex in domainCurrentTime) {
        // Has emails in current batch
        scheduledFor = adjustToWorkingHours(new Date(domainCurrentTime[domainIndex].getTime() + intervalMs + jitterMs));
      } else {
        // First email for this domain
        scheduledFor = new Date(startTimeUTC.getTime());
      }

      domainCurrentTime[domainIndex] = scheduledFor;
      domainLastScheduled[domainIndex] = scheduledFor;

      // Track emails by day
      const zonedTime = toZonedTime(scheduledFor, TIMEZONE);
      const dayKey = `${zonedTime.getFullYear()}-${String(zonedTime.getMonth() + 1).padStart(2, '0')}-${String(zonedTime.getDate()).padStart(2, '0')}`;
      emailsByDay[dayKey] = (emailsByDay[dayKey] || 0) + 1;

      return {
        id: email.id,
        status: 'queued',
        domain_index: domainIndex,
        from_email: `${domainConfig.sender_name}@${domainConfig.domain}`,
        scheduled_for: scheduledFor.toISOString(),
      };
    });

    // 5. Bulk update emails
    for (const update of updates) {
      await supabase
        .from('email_queue')
        .update({
          status: update.status,
          domain_index: update.domain_index,
          from_email: update.from_email,
          scheduled_for: update.scheduled_for,
        })
        .eq('id', update.id);
    }

    // 6. Update campaign status
    await supabase
      .from('campaigns')
      .update({
        status: 'scheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    // 7. Calculate response stats
    const lastScheduledTime = Object.values(domainLastScheduled)
      .reduce((latest, time) => time > latest ? time : latest, startTimeUTC);

    return NextResponse.json({
      success: true,
      queued: updates.length,
      scheduling: {
        timezone: TIMEZONE,
        intervalMinutes: INTERVAL_MINUTES,
        startTimeUTC: startTimeUTC.toISOString(),
        estimatedEndTimeUTC: lastScheduledTime.toISOString(),
        emailsByDay,
        totalDays: Object.keys(emailsByDay).length,
      },
    });
  } catch (error) {
    console.error('POST /api/campaigns/:id/launch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Verification Tests**:
```bash
# 1. Create a fresh campaign and generate emails
CAMPAIGN_ID=$(curl -s -X POST "http://localhost:3000/api/campaigns" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{
    "name": "Launch Test Campaign",
    "sections": [{"id": "1", "name": "Body", "type": "text", "mode": "static", "content": "Hello {{Name}}!"}],
    "subjectLine": {"mode": "static", "content": "Test Email"}
  }' | jq -r '.id')

# 2. Generate emails
curl -X POST "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/generate" \
  -H "Cookie: <your-admin-session-cookie>" \
  -F "file=@/tmp/test-recipients.csv"

# 3. Launch campaign
curl -X POST "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/launch" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"all": true}'

# Expected: 
# {
#   "success": true,
#   "queued": 2,
#   "scheduling": {
#     "timezone": "America/Los_Angeles",
#     "intervalMinutes": 3.5,
#     "startTimeUTC": "...",
#     "estimatedEndTimeUTC": "...",
#     "emailsByDay": {"2024-01-15": 2},
#     "totalDays": 1
#   }
# }

# 4. Verify emails are now queued with scheduling info
curl "${SUPABASE_URL}/rest/v1/email_queue?campaign_id=eq.${CAMPAIGN_ID}&select=to_email,status,scheduled_for,from_email,domain_index" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"

# Expected: Emails with status="queued", scheduled_for set, from_email set

# 5. Verify campaign status updated
curl "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: status: "scheduled"
```

**Manual Verification**:
- [ ] Emails transition from 'staged' to 'queued'
- [ ] scheduled_for times are in the future during working hours
- [ ] from_email uses rotating domains
- [ ] domain_index is assigned correctly
- [ ] Campaign status is 'scheduled'
- [ ] Multiple campaigns don't have overlapping schedules per domain

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(api): add campaign launch endpoint with scheduling"
```

---

### Step 3.5: Test Send API

**Goal**: Create endpoint to send a single test email without affecting the campaign.

**Implementation**:
1. Create `src/app/api/campaigns/[id]/test-send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { generateEmailHtml } from '@/components/email-editor/EmailPreviewRenderer';

// POST /api/campaigns/:id/test-send
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({ error: 'testEmail is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get sample data from first staged email, or use placeholder
    const { data: sampleEmail } = await supabase
      .from('email_queue')
      .select('metadata')
      .eq('campaign_id', campaignId)
      .eq('status', 'staged')
      .limit(1)
      .single();

    const sampleData = sampleEmail?.metadata || {
      Name: 'Test User',
      Email: testEmail,
      Company: 'Test Company',
    };

    // Replace variables helper
    const replaceVariables = (text: string, row: Record<string, string>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = row[varName] || row[varName.toLowerCase()] || row[varName.toUpperCase()];
        return value !== undefined ? value : match;
      });
    };

    // Generate email content
    const subjectLineContent = campaign.subject_line?.content || 'Test Email';
    const subject = `[TEST] ${replaceVariables(subjectLineContent, sampleData)}`;
    
    let emailBody: string;
    if (campaign.email_format === 'text') {
      emailBody = (campaign.sections || [])
        .filter((s: any) => s.type === 'text')
        .map((s: any) => replaceVariables(s.content || '', sampleData))
        .join('\n\n');
    } else {
      emailBody = generateEmailHtml(campaign.sections || [], subject, sampleData);
    }

    // Send via SparkPost (or your email service)
    // For now, we'll insert into email_queue and mark as sent immediately for testing
    // In production, call SparkPost API directly
    
    const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;
    
    if (!SPARKPOST_API_KEY) {
      // Fallback: just return the generated content for review
      return NextResponse.json({
        success: true,
        message: 'Test email content generated (SPARKPOST_API_KEY not set)',
        preview: {
          to: testEmail,
          subject,
          body: emailBody.substring(0, 500) + '...',
        },
      });
    }

    // Send via SparkPost
    const sparkpostResponse = await fetch('https://api.sparkpost.com/api/v1/transmissions', {
      method: 'POST',
      headers: {
        'Authorization': SPARKPOST_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: [{ address: { email: testEmail } }],
        content: {
          from: 'test@connect-ozlistings.com', // Use a test sender
          subject,
          html: campaign.email_format === 'html' ? emailBody : undefined,
          text: campaign.email_format === 'text' ? emailBody : undefined,
        },
        metadata: {
          campaign_id: campaignId,
          is_test: true,
        },
      }),
    });

    if (!sparkpostResponse.ok) {
      const errorText = await sparkpostResponse.text();
      console.error('SparkPost error:', errorText);
      return NextResponse.json({
        error: 'Failed to send test email',
        details: errorText,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
    });
  } catch (error) {
    console.error('POST /api/campaigns/:id/test-send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Verification Tests**:
```bash
# 1. Send test email (will show preview if SPARKPOST_API_KEY not set)
curl -X POST "http://localhost:3000/api/campaigns/${CAMPAIGN_ID}/test-send" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"testEmail": "your-email@example.com"}'

# Expected: {"success": true, "message": "Test email sent to ..."}
# Or preview object if no API key
```

**Manual Verification**:
- [ ] Test email is received at the specified address
- [ ] Subject has [TEST] prefix
- [ ] Variables are replaced with sample data
- [ ] HTML formatting is correct

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(api): add test email send endpoint"
```

---

### Step 3.6: Unsubscribe Endpoint

**Goal**: Create unsubscribe handling for CAN-SPAM compliance.

**Implementation**:
1. Create `src/app/api/unsubscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'your-secret-key-change-in-production';
const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;

// Generate HMAC token for email
export function generateUnsubscribeToken(email: string): string {
  return crypto
    .createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(email.toLowerCase())
    .digest('hex')
    .substring(0, 16);
}

// Verify HMAC token
function verifyToken(email: string, token: string): boolean {
  const expectedToken = generateUnsubscribeToken(email);
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}

// GET /api/unsubscribe?email=xxx&token=yyy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return new Response(renderErrorPage('Missing email or token'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Verify token
    if (!verifyToken(email, token)) {
      return new Response(renderErrorPage('Invalid or expired unsubscribe link'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Add to SparkPost suppression list
    if (SPARKPOST_API_KEY) {
      try {
        await fetch('https://api.sparkpost.com/api/v1/suppression-list', {
          method: 'POST',
          headers: {
            'Authorization': SPARKPOST_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: [{
              email: email.toLowerCase(),
              type: 'non_transactional',
              description: 'User unsubscribed via link',
            }],
          }),
        });
      } catch (error) {
        console.error('Failed to add to SparkPost suppression:', error);
        // Continue anyway - at least show confirmation
      }
    }

    return new Response(renderSuccessPage(email), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('GET /api/unsubscribe error:', error);
    return new Response(renderErrorPage('An error occurred'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function renderSuccessPage(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribed - OZListings</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
    h1 { color: #1e88e5; }
    p { color: #666; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Successfully Unsubscribed</h1>
  <p>You have been unsubscribed from OZListings marketing emails.</p>
  <p><strong>${email}</strong> will no longer receive promotional emails from us.</p>
  <p>If you unsubscribed by mistake, please contact us at support@ozlistings.com</p>
</body>
</html>
  `;
}

function renderErrorPage(message: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error - OZListings</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
    h1 { color: #e53935; }
    p { color: #666; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Unsubscribe Error</h1>
  <p>${message}</p>
  <p>Please contact support@ozlistings.com for assistance.</p>
</body>
</html>
  `;
}
```

2. Export the token generator for use in email generation. Add to `src/lib/email/unsubscribe.ts`:

```typescript
export { generateUnsubscribeToken } from '@/app/api/unsubscribe/route';

export function generateUnsubscribeUrl(email: string, baseUrl: string = ''): string {
  const { generateUnsubscribeToken } = require('@/app/api/unsubscribe/route');
  const token = generateUnsubscribeToken(email);
  const url = new URL('/api/unsubscribe', baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  url.searchParams.set('email', email);
  url.searchParams.set('token', token);
  return url.toString();
}
```

**Verification Tests**:
```bash
# 1. Generate a valid unsubscribe link (you'll need to get the token)
# For testing, use Node to generate:
node -e "
const crypto = require('crypto');
const email = 'test@example.com';
const secret = 'your-secret-key-change-in-production';
const token = crypto.createHmac('sha256', secret).update(email).digest('hex').substring(0, 16);
console.log('http://localhost:3000/api/unsubscribe?email=' + encodeURIComponent(email) + '&token=' + token);
"

# 2. Open the generated URL in browser
# Expected: "Successfully Unsubscribed" page

# 3. Test with invalid token
curl "http://localhost:3000/api/unsubscribe?email=test@example.com&token=invalid"
# Expected: Error page
```

**Manual Verification**:
- [ ] Valid unsubscribe link shows success page
- [ ] Invalid token shows error page
- [ ] Missing parameters show error
- [ ] Email is added to SparkPost suppression (check dashboard)

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(api): add unsubscribe endpoint for CAN-SPAM compliance"
```

---

## Phase 4: Frontend Integration

### Step 4.1: Update Email Preview Renderer for Unsubscribe Links

**Goal**: Add dynamic unsubscribe links to email footer.

**Implementation**:
1. Update `src/components/email-editor/EmailPreviewRenderer.tsx` to include unsubscribe URL:

Update the footer section of `generateEmailHtml` function to accept an unsubscribe URL parameter and include it in the footer.

**Verification Tests**:
```bash
# 1. Preview an email and check HTML source
# Open email editor, add sections, view preview
# Inspect HTML - should have unsubscribe link in footer
```

**Manual Verification**:
- [ ] Email footer contains clickable unsubscribe link
- [ ] Link includes correct email and token parameters
- [ ] Preview shows the unsubscribe text

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(ui): add unsubscribe links to email footer"
```

---

### Step 4.2: Campaign List Page

**Goal**: Create a page to list and manage campaigns.

**Implementation**:
1. Create `src/app/admin/campaigns/page.tsx`:

This page should:
- List all campaigns with status badges
- Show recipient count
- Link to edit/view each campaign
- Allow creating new campaigns
- Allow deleting draft campaigns

**Verification Tests**:
```bash
# 1. Navigate to /admin/campaigns
# Expected: Page loads without errors

# 2. Create campaigns via API, then refresh page
# Expected: Campaigns appear in list

# 3. Click on a campaign
# Expected: Navigates to campaign detail/edit page
```

**Manual Verification**:
- [ ] Page loads and displays campaigns
- [ ] Status badges show correct colors
- [ ] Create new campaign button works
- [ ] Delete button only shows for draft campaigns
- [ ] Pagination works (if implemented)

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(ui): add campaign list page"
```

---

### Step 4.3: Campaign Editor Integration

**Goal**: Connect existing email editor to campaign backend.

**Implementation**:
1. Update `src/components/email-editor/EmailEditor.tsx` to:
   - Accept campaignId prop
   - Load campaign data on mount
   - Save to backend on "Save" button click
   - Show campaign name in header

2. Create `src/app/admin/campaigns/[id]/page.tsx` that wraps EmailEditor with campaign context.

**Verification Tests**:
```bash
# 1. Create campaign via API, get ID
# 2. Navigate to /admin/campaigns/<id>
# Expected: Editor loads with campaign data

# 3. Make changes, click Save
# Expected: Changes persist (refresh page to verify)

# 4. Modify sections and subject line
# Expected: Updates saved to database
```

**Manual Verification**:
- [ ] Existing campaigns load correctly
- [ ] Changes are saved to database
- [ ] Template selection updates sections
- [ ] Subject line persists

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(ui): integrate email editor with campaign backend"
```

---

### Step 4.4: CSV Upload & Staging Flow

**Goal**: Add UI for uploading CSV and viewing staged emails.

**Implementation**:
1. Add "Upload Recipients" button/section to campaign editor
2. Create staging review panel showing:
   - List of staged emails (paginated)
   - Preview of each email
   - Edit button for each email
   - Reject/remove button
   - Bulk approve/launch button

**Verification Tests**:
```bash
# 1. Open campaign editor for a draft campaign
# 2. Click "Upload Recipients" and select CSV
# Expected: Shows upload progress, then staged email count

# 3. View staged emails list
# Expected: Paginated list with previews

# 4. Click edit on an email
# Expected: Modal opens with editable subject/body

# 5. Save edit
# Expected: Email shows "Edited" badge

# 6. Reject an email
# Expected: Email removed from list (or shows rejected status)
```

**Manual Verification**:
- [ ] CSV upload works with drag-and-drop
- [ ] Invalid emails shown as errors
- [ ] Duplicate emails detected
- [ ] Staged emails list is scrollable/paginated
- [ ] Edit modal works correctly
- [ ] Reject updates status

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(ui): add CSV upload and staging review flow"
```

---

### Step 4.5: Launch Campaign Flow

**Goal**: Add UI for launching campaigns with confirmation.

**Implementation**:
1. Add "Launch Campaign" button (disabled until emails are staged)
2. Show confirmation modal with:
   - Number of emails to send
   - Estimated send duration
   - Start/end times
3. On confirm, call launch API and show progress
4. Redirect to campaign detail/status page

**Verification Tests**:
```bash
# 1. Stage emails for a campaign
# 2. Click "Launch Campaign"
# Expected: Confirmation modal appears

# 3. Confirm launch
# Expected: API called, success message shown

# 4. Check campaign status
# Expected: Status is "scheduled"

# 5. Check email_queue in Supabase
# Expected: Emails have scheduled_for times
```

**Manual Verification**:
- [ ] Launch button disabled without staged emails
- [ ] Confirmation shows accurate counts
- [ ] Launch API called successfully
- [ ] UI updates to show scheduled status
- [ ] Error handling for failed launches

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(ui): add campaign launch flow with confirmation"
```

---

### Step 4.6: Test Send Integration

**Goal**: Add "Send Test Email" button to campaign editor.

**Implementation**:
1. Add "Send Test" button near preview panel
2. Modal to enter test email address
3. Call test-send API
4. Show success/error feedback

**Verification Tests**:
```bash
# 1. Open campaign with sections configured
# 2. Click "Send Test Email"
# Expected: Modal appears for email input

# 3. Enter email and submit
# Expected: Loading state, then success message

# 4. Check inbox
# Expected: Test email received with [TEST] prefix
```

**Manual Verification**:
- [ ] Test send modal opens correctly
- [ ] Email validation in modal
- [ ] Success/error messages display
- [ ] Actual email received at test address

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(ui): add test email send functionality"
```

---

## Phase 5: Campaign Runner Updates

### Step 5.1: Pass Metadata in Campaign Runner

**Goal**: Update campaign runner to pass email_queue_id and campaign_id to SparkPost.

**Implementation**:
1. Update `ozl-backend/services/campaign-runner/main.py`:
   - Fetch campaign_id from email_queue row
   - Pass metadata to send_sparkpost_email

2. Update `ozl-backend/services/campaign-runner/email_sender.py` (if needed):
   - Ensure metadata is included in SparkPost payload

**Verification Tests**:
```bash
# 1. Launch a campaign with scheduled emails
# 2. Wait for campaign runner to process (or trigger manually)
# 3. Check SparkPost dashboard for sent emails
# Expected: Metadata visible in transmission details

# Or check SparkPost events API:
curl "https://api.sparkpost.com/api/v1/events/message?from=$(date -u -v-1H +%Y-%m-%dT%H:%M)" \
  -H "Authorization: ${SPARKPOST_API_KEY}"

# Expected: Events include metadata.email_queue_id and metadata.campaign_id
```

**Manual Verification**:
- [ ] SparkPost transmissions include metadata
- [ ] email_queue_id is correct
- [ ] campaign_id is correct

**Git Commit Checkpoint**:
```
After verifying tests pass, commit with message:
"feat(runner): pass email_queue_id and campaign_id in SparkPost metadata"
```

---

## Phase 6: Final Integration Testing

### Step 6.1: End-to-End Test

**Goal**: Verify complete flow from campaign creation to email sending.

**Test Checklist**:
```
□ Create new campaign via UI
□ Select template, customize sections
□ Set subject line with variables
□ Save campaign (verify in Supabase)
□ Upload CSV with recipients
□ Review staged emails
□ Edit one email manually
□ Reject one email
□ Send test email to your inbox
□ Launch campaign
□ Verify scheduling info
□ Check email_queue has queued status
□ Wait for (or manually trigger) campaign runner
□ Verify emails sent via SparkPost
□ Check unsubscribe link works
□ Verify campaign status updates to 'completed'
```

**Git Commit Checkpoint**:
```
After all e2e tests pass, commit with message:
"test: verify end-to-end campaign flow"
```

---

## Appendix: Environment Variables

Ensure these are set in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# SparkPost
SPARKPOST_API_KEY=xxx

# Timezone for scheduling
TIMEZONE=America/Los_Angeles

# Unsubscribe
UNSUBSCRIBE_SECRET=your-secure-random-string

# App URL (for unsubscribe links)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Appendix: Database Quick Reference

### campaigns table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Campaign name |
| template_slug | TEXT | Template used |
| sections | JSONB | Email sections |
| subject_line | JSONB | Subject configuration |
| email_format | TEXT | 'html' or 'text' |
| status | TEXT | Campaign status |
| total_recipients | INT | Count of recipients |

### email_queue table (additions)
| Column | Type | Description |
|--------|------|-------------|
| campaign_id | UUID | FK to campaigns |
| is_edited | BOOL | Manual edit flag |

### Status Values
**Campaign**: draft → staged → scheduled → sending → completed
**Email**: staged → queued → processing → sent/failed/rejected

---

## Summary

This implementation plan covers:
1. **Database setup** - New campaigns table, email_queue updates
2. **API endpoints** - CRUD, generate, launch, test-send, unsubscribe
3. **Frontend** - Campaign list, editor integration, staging UI, launch flow
4. **Campaign runner** - Metadata for analytics tracking

Each step has verification tests and git commit checkpoints. Follow the phases in order, verifying each step before proceeding.

**Estimated total time**: 3-5 days for core implementation
