# Consolidated CRM System Architecture & Implementation Plan

This document outlines the detailed plan for integrating our isolated microservices (`ozl-backend`) and UI components with the new `people`-centric, normalized graph schema. It includes exact code snippets and implementation strategies based on existing import scripts and UI structures.

---

## 1. Contact Creation Workflow

### 1.1 UI: Add Contact Form
The "Add Contact" modal will pop up when a user clicks an 'Add Contact' button on the CRM directory page. It will move away from a flat-field approach to a structured graph-builder UI representing core entities.

**Components:**
1.  **The Human (Required):**
    *   First Name, Last Name
    *   Lead Status (Dropdown: New, Warm, Cold, etc. Defaults to 'new')
    *   Tags (Searchable Multi-select combining `tags` and `contact_types` from the old system)

2.  **Contact Methods (Dynamic Repeater):**
    *   Add Email (Address, Is Primary Toggle, Label Dropdown: Work/Personal/Other)
    *   Add Phone (Number, Is Primary Toggle, Label Dropdown: Mobile/Work/Home/Main)
    *   Add LinkedIn (URL)

3.  **Organization (Optional Autocomplete):**
    *   Search querying `organizations` table.
    *   *Creation Logic:* If "Acme Corp" doesn't exist, create it on the fly and link it via `person_organizations`.
    *   Job Title/Role string.

### 1.2 Database: The `create_contact_full` RPC
To guarantee atomicity and prevent partial records (e.g., a person without an email), we will use a Supabase Postgres RPC transaction rather than sequential API calls.

**Implementation (`supabase/migrations/XXX_create_contact_rpc.sql`):**

```sql
CREATE OR REPLACE FUNCTION create_contact_full(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_person_id uuid;
    new_org_id uuid;
    contact_method record;
BEGIN
    -- 1. Insert Person
    INSERT INTO people (
        first_name, 
        last_name, 
        lead_status, 
        tags, 
        details
    ) VALUES (
        payload->>'first_name',
        payload->>'last_name',
        COALESCE(payload->>'lead_status', 'new'),
        ARRAY(SELECT jsonb_array_elements_text(payload->'tags')),
        COALESCE(payload->'details', '{}'::jsonb)
    ) RETURNING id INTO new_person_id;

    -- 2. Insert Contact Methods (Emails)
    FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'emails') LOOP
        -- Upsert email to get ID
        WITH inserted_email AS (
            INSERT INTO emails (address, status)
            VALUES (contact_method->>'address', 'Valid')
            ON CONFLICT (address) DO UPDATE SET address = EXCLUDED.address
            RETURNING id
        )
        INSERT INTO person_emails (person_id, email_id, is_primary, label)
        SELECT new_person_id, id, (contact_method->>'is_primary')::boolean, contact_method->>'label'
        FROM inserted_email;
    END LOOP;

    -- 3. Insert Contact Methods (Phones)
    FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'phones') LOOP
        -- Upsert phone to get ID
        WITH inserted_phone AS (
            INSERT INTO phones (number)
            VALUES (contact_method->>'number')
            ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number
            RETURNING id
        )
        INSERT INTO person_phones (person_id, phone_id, is_primary, label)
        SELECT new_person_id, id, (contact_method->>'is_primary')::boolean, contact_method->>'label'
        FROM inserted_phone;
    END LOOP;

    -- 4. Insert Contact Methods (LinkedIn)
    FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'linkedin') LOOP
        -- Upsert LinkedIn to get ID
        WITH inserted_linkedin AS (
            INSERT INTO linkedin_profiles (url)
            VALUES (contact_method->>'url')
            ON CONFLICT (url) DO UPDATE SET url = EXCLUDED.url
            RETURNING id
        )
        INSERT INTO person_linkedin (person_id, linkedin_id, is_primary)
        SELECT new_person_id, id, (contact_method->>'is_primary')::boolean
        FROM inserted_linkedin;
    END LOOP;

    -- 5. Handle Organization Link
    IF payload->>'organization_id' IS NOT NULL THEN
        -- Link existing
        INSERT INTO person_organizations (person_id, organization_id, title)
        VALUES (new_person_id, (payload->>'organization_id')::uuid, payload->>'title');
    ELSIF payload->>'organization_name' IS NOT NULL THEN
        -- Create new org and link
        INSERT INTO organizations (name) 
        VALUES (payload->>'organization_name') 
        RETURNING id INTO new_org_id;

        INSERT INTO person_organizations (person_id, organization_id, title)
        VALUES (new_person_id, new_org_id, payload->>'title');
    END IF;

    RETURN jsonb_build_object('success', true, 'person_id', new_person_id);
EXCEPTION WHEN OTHERS THEN
    -- Transaction rolls back automatically
    RAISE EXCEPTION 'Failed to create contact: %', SQLERRM;
END;
$$;
```

---

## 2. Navigational UX Consolidation

The goal is to centralize data interaction around the `/admin/crm` view.

### 2.1 Campaign Creation Lens
Campaign creation will be initiated from two points, utilizing the existing `ContactSelectionStep.tsx` logic:
1.  **From CRM (`/admin/crm`):** Bulk select rows on `PeopleTable` ➔ "Add to Campaign" (existing or new). 

**Code Snippet (`src/app/admin/crm/components/PeopleTable.tsx`):**
```tsx
const bulkActions = (
    <Button 
        size="sm" 
        variant="outline" 
        className="h-7 text-xs ml-2 bg-white"
        onClick={() => {
            // Logic to open a modal that passes selectedIds to either:
            // 1. Add to existing campaign via API
            // 2. Redirect to /admin/campaigns/new with IDs in query/state
        }}
    >
        <Mail className="w-3 h-3 mr-1" /> Add to Campaign
    </Button>
);
```

2.  **From Campaigns (`/admin/campaigns`):** Clicking "New Campaign" embeds the CRM filter UI directly into the campaign creation wizard.

### 2.2 Proactive Email Validation in Campaigns
Instead of the backend silently skipping bad emails during a campaign run:
1. All selected contacts enter the "Review" step.
2. The UI queries the `emails` table. If `emails.status IN ('bounced', 'suppressed')` for a contact's primary email, it flags them in red.
3. The user can manually resolve this (select a secondary email) or click "Remove Invalid" before launching.

**Code Snippet - Validation logic during Review Step:**
```typescript
// Inside a component rendering the review list
const isValidEmail = (contact: any) => {
    const primaryEmail = contact.person_emails?.find(pe => pe.is_primary)?.emails;
    if (!primaryEmail) return false;
    
    // Flag if bounced or suppressed
    return !['bounced', 'suppressed'].includes(primaryEmail.status);
};

// ... rendered within the UI row ...
{!isValidEmail(contact) && (
    <Tooltip content={`Email status: ${primaryEmail.status}`}>
        <AlertCircle className="w-4 h-4 text-red-500" />
    </Tooltip>
)}
```

### 2.3 Deprecating the Standalone Prospects Route
`/admin/prospects` will be replaced by a **"Call Mode" Toggle** on the main CRM interface.
*   **Action:** When activated, CRM filters to contacts requiring immediate calls.
*   **Execution:** Opening `<EntitySheet>` provides dialer controls and outcome logging directly within context.

**Code Snippet - CRM Toggle & Filter Logic:**
```tsx
// Inside CRMShell.tsx
const [isCallMode, setIsCallMode] = useState(false);

// ... in the top toolbar ...
<Button
    variant={isCallMode ? "default" : "outline"}
    onClick={() => {
        setIsCallMode(!isCallMode);
        if (!isCallMode) {
            // Apply Call Mode filters 
            // e.g. setFilter('lead_status', ['warm', 'hot']);
            // setFilter('requires_followup', true); -- hypothetical filter
        } else {
            // Clear Call Mode filters
        }
    }}
>
    <Phone className="w-4 h-4 mr-2" />
    Call Mode
</Button>
```

### 2.4 The Outreach Timeline
The `<EntitySheet>` will feature a unified timeline component.

**Implementation (`src/app/admin/crm/components/EntitySheet.tsx` additions):**
```tsx
// Inside EntitySheet component for 'person' type
<div>
    <h4 className="font-semibold mb-2">Outreach Timeline</h4>
    <div className="space-y-4 border-l-2 border-slate-200 ml-3 pl-4">
        {data.timeline?.map((event: any) => (
            <div key={event.id} className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-400 border-2 border-white" />
                <div className="text-sm">
                    <span className="font-semibold">{event.channel === 'phone' ? 'Called' : 'Emailed'}</span>
                    <span className="text-muted-foreground ml-2">{new Date(event.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">{event.description}</div>
            </div>
        ))}
    </div>
</div>
```

---

## 3. Advanced Filtering Translation

We must update `/api/crm/people/route.ts` to map legacy filter concepts to the new schema correctly based on observations from our import scripts.

### 3.1 Next.js API Route Updates (`src/app/api/crm/people/route.ts`)

```typescript
// 1. Tags Mapping (Unifying contact_types and tags)
// The import scripts correctly merged legacy tags and contact_types into the new TEXT[] array.
if (tags.length > 0) {
    query = query.overlaps('tags', tags);
}

// 2. Email Verification Status
// Import scripts correctly save statuses directly to emails.status (e.g., 'bounced', 'suppressed', 'Valid').
if (emailStatuses.length > 0) {
    query = query.filter('person_emails.emails.status', 'in', `(${emailStatuses.map(s => `"${s}"`).join(',')})`);
}

// 3. Campaign Performance (Replied, Bounced, No Reply)
if (campaignResponse) {
    if (campaignResponse === 'replied') {
        query = query.not('history.replied_at', 'is', null);
    } else if (campaignResponse === 'bounced') {
        // Querying activities or updated campaign_recipients for bounce state
        query = query.eq('history.status', 'bounced'); 
    }
}

// 4. Website Activity (User Events)
// Linking via user_id
if (websiteEvents && websiteEvents.length > 0) {
    // Requires an EXISTS subquery block or an inner join to user_events if exposed via PostgREST
    query = query.not('user_events', 'is', null).in('user_events.event_type', websiteEvents);
}

// 5. Outreach History
if (campaignHistory === 'any') {
    query = query.not('history', 'is', null);
} else if (campaignHistory === 'none') {
    query = query.is('history', null);
}

// 6. Lead Status
if (leadStatuses.length > 0) {
    query = query.in('lead_status', leadStatuses);
}
```

---

## 4. Backend System Integration (`ozl-backend`)

### 4.1 LinkedIn Automation
The LinkedIn crawler requires an extensive join to get valid targets.

**Implementation (Python Script SQL Query):**
```sql
SELECT 
    p.id as person_id, 
    p.first_name, 
    o.id as org_id, 
    o.name as org_name,
    lp.id as linkedin_id, 
    lp.url as linkedin_url
FROM people p
JOIN person_organizations po ON p.id = po.person_id
JOIN organizations o ON po.organization_id = o.id
JOIN person_linkedin pl ON p.id = pl.person_id
JOIN linkedin_profiles lp ON pl.linkedin_id = lp.id
WHERE 
    lp.status = 'active'
    AND p.lead_status IN ('warm', 'hot')
    -- Additional logic to rotate organizations and respect daily limits
```

### 4.2 Calling CRM System
Instead of updating a static `call_status` column, the backend will merely insert an event.

**Implementation (PostgreSQL activity insert):**
```sql
INSERT INTO activities (
    contact_id, 
    type, 
    channel, 
    description, 
    metadata
) VALUES (
    $1, 
    'call_logged', 
    'phone', 
    'Left Voicemail', 
    '{"duration_seconds": 45, "disposition": "voicemail"}'::jsonb
);
```

### 4.3 Inbox Sync Reply Processing Update
The `inbox-sync` background service (`ozl-backend/services/inbox-sync/inbox_sync.py`) handles polling Gmail for replies. This logic must be updated to integrate with the new CRM identity schema and emit historical events to the new `activities` table.

**Required Logic Updates in `process_new_replies`:**
1. **Resolve `person_id`:** Instead of querying the legacy `contacts` table, look up the `emails` table (by `address`) and join through `person_emails` to resolve the `person_id`.
   ```python
   email_res = supabase.table('emails').select('id').eq('address', prospect_email).maybe_single().execute()
   person_id = None
   if email_res.data:
       person_res = supabase.table('person_emails').select('person_id').eq('email_id', email_res.data['id']).execute()
       if person_res.data:
           person_id = person_res.data[0]['person_id']
   ```
2. **Update Execution State:** Keep updating `campaign_recipients` to mark the person as `replied` (ensuring we cancel queued emails). Note: `campaign_recipients` is slated to have its `contact_id` FK migrated to `recipient_person_id`.
3. **Emit to Activities Ledger:** Insert a chronological event record into the new `activities` table.
   ```python
   if person_id:
       supabase.table('activities').insert({
           'person_id': person_id,
           'type': 'email_reply',
           'channel': 'email',
           'description': f'Replied to campaign "{campaign_name}"',
           'metadata': {'msg_id': msg_id, 'subject': subject},
           'timestamp': 'now()'
       }).execute()
   ```

---

## 5. Required Database Migrations & Backfills

### 5.1 Prerequisite: `campaign_recipients` Identity Migration

Before any downstream code runs (and before backfilling), we must decouple sequence execution state from the legacy `contacts` table and explicitly bind it to the new `people` hierarchy.

**Required Steps for `campaign_recipients` Mutation:**
1. **Schema Addition:** Add `recipient_person_id` (UUID, FK to `people.id` ON DELETE CASCADE).
2. **Backfill:** Execute a `UPDATE` statement mapping the old `contact_id` string to the new UUID using the `contacts_to_people_mapping.json` generated during the original migration phase.
3. **App Logic Swap:** Refactor `inbox_sync.py`, `followup_scheduler.py`, `generate.py`, and `db.py` to target `recipient_person_id`.
4. **Cleanup:** Drop the `contact_id` column.

*(Note: The `selected_email` column remains as a static text representation of the ultimate delivery location to avoid explosive query joins in tight worker loops.)*

### 5.2 Create Activities Table

Before performing backfills or capturing new events, we must establish the unified timeline ledger.

**Implementation (`supabase/migrations/XXX_create_activities_table.sql`):**
```sql
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    type TEXT NOT NULL,          -- e.g., 'email_reply', 'call_logged', 'linkedin_message'
    channel TEXT NOT NULL,       -- 'email', 'phone', 'linkedin', 'system'
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_person_id ON activities(person_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp);
```

### 5.3 Website Signups Trigger

**Implementation (`supabase/migrations/XXX_update_auth_trigger.sql`):**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_person_id uuid;
    new_email_id uuid;
BEGIN
    -- 1. Create Person
    INSERT INTO public.people (user_id, lead_status, tags)
    VALUES (NEW.id, 'warm', ARRAY['website_signup'])
    RETURNING id INTO new_person_id;

    -- 2. Create Email
    INSERT INTO public.emails (address, status)
    VALUES (NEW.email, 'Valid')
    ON CONFLICT (address) DO UPDATE SET address = EXCLUDED.address
    RETURNING id INTO new_email_id;

    -- 3. Link them
    INSERT INTO public.person_emails (person_id, email_id, is_primary, source)
    VALUES (new_person_id, new_email_id, true, 'auth_trigger');

    RETURN NEW;
END;
$$;
```

### 5.4 Historical Telemetry Backfill
To populate the timeline, we must backfill `activities` from existing legacy execution tables. This will be done after the FKs are correctly migrated (e.g., `campaign_recipients` updated to reference `recipient_person_id`).

**Implementation Strategy:**

1.  **Prospect Calls:** 
```sql
INSERT INTO activities (person_id, type, channel, description, timestamp, metadata) 
SELECT 
    -- Requires a JOIN or mapping since prospect_calls only has prospect_phone_id/prospect_id natively
    person_mappings.person_id, 
    'call_logged',
    'phone', 
    'Outcome: ' || outcome, 
    called_at,
    jsonb_build_object('phone_used', phone_used)
FROM prospect_calls
JOIN person_mappings ON ...; -- Pseudo-logic indicating the required linking 
```

3.  **Campaign Responses:** 
```sql
INSERT INTO activities (person_id, type, channel, description, timestamp)
SELECT 
    recipient_person_id, 
    'email_reply', 
    'email',
    'Replied to Campaign ' || campaign_id,
    replied_at
FROM campaign_recipients 
WHERE replied_at IS NOT NULL;
```

4.  **Other Events:** Similar inserts for email bounces, opens, and website `user_events` will follow the same pattern once the `recipient_person_id` mappings are live.
