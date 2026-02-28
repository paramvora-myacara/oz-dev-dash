# Consolidated CRM System Architecture & Implementation Plan

This document outlines the detailed plan for integrating our isolated microservices (`ozl-backend`) and UI components with the new `people`-centric, normalized graph schema. It includes exact code snippets and implementation strategies based on existing import scripts and UI structures.

---

## 1. Contact Creation Workflow

### 1.1 UI: Add Contact Form
The "Add Contact" modal will move away from a flat-field approach to a structured graph-builder UI representing core entities.

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

    -- (Repeat similar loop for phones and linkedin)

    -- 3. Handle Organization Link
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
2.  **From Campaigns (`/admin/campaigns`):** Clicking "New Campaign" embeds the CRM filter UI directly into the campaign creation wizard.

### 2.2 Proactive Email Validation in Campaigns
Instead of the backend silently skipping bad emails during a campaign run:
1. All selected contacts enter the "Review" step.
2. The UI queries the `emails` table. If `emails.status IN ('bounced', 'suppressed')` for a contact's primary email, it flags them in red.
3. The user can manually resolve this (select a secondary email) or click "Remove Invalid" before launching.

### 2.3 Deprecating the Standalone Prospects Route
`/admin/prospects` will be replaced by a **"Call Mode" Toggle** on the main CRM interface.
*   **Action:** When activated, CRM filters to contacts requiring immediate calls.
*   **Execution:** Opening `<EntitySheet>` provides dialer controls and outcome logging directly within context.

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

---

## 5. Required Database Migrations & Backfills

### 5.1 Website Signups Trigger

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

### 5.2 Historical Telemetry Backfill
To populate the timeline, we must backfill `activities` from existing tables.

**Implementation Strategy:**
1.  **Prospect Calls:** `INSERT INTO activities (contact_id, channel, description, timestamp) SELECT person_id, 'phone', notes, created_at FROM old_prospect_calls;`
2.  **Campaign Responses:** `INSERT INTO activities (...) SELECT person_id, 'email_reply', 'Replied to Campaign ' || campaign_id... FROM campaign_recipients WHERE replied_at IS NOT NULL;`
