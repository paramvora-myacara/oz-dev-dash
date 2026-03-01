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

2.  **Contact Methods (Global Entity Search Enforced):**
    *   *Rule:* All contact inputs must query the global tables (`emails`, `phones`, `linkedin_profiles`) as the user types. If a match exists, it must be selected to link the existing ID rather than creating a duplicate.
    *   Add Email (Address Autocomplete, Is Primary Toggle, Label Dropdown)
    *   Add Phone (Number Autocomplete, Is Primary Toggle, Label Dropdown)
    *   Add LinkedIn (URL Autocomplete)

3.  **Organization (Optional Autocomplete):**
    *   Search querying `organizations` table.
    *   *Creation Logic:* If "Acme Corp" doesn't exist, create it on the fly and link it via `person_organizations`.
    *   Job Title/Role string.

### 1.2 Shared UI Logic: Global Entity Autocomplete
To keep our codebase DRY, the autocomplete behavior required in the Add Contact form and the Call Modal's "Add Phone/Email" prompts will use a shared custom hook.

**Code Snippet - `useGlobalEntitySearch` Hook:**
```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export function useGlobalEntitySearch(table: 'emails' | 'phones' | 'linkedin_profiles', queryField: string) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsSearching(true);
            const { data } = await supabase
                .from(table)
                .select(`id, ${queryField}`)
                .ilike(queryField, `%${query}%`)
                .limit(5);

            setResults(data || []);
            setIsSearching(false);
        };

        const timeout = setTimeout(fetchResults, 300); // Debounce
        return () => clearTimeout(timeout);
    }, [query, table, queryField]);

    return { query, setQuery, results, isSearching };
}

// Usage in Component:
// const { query, setQuery, results } = useGlobalEntitySearch('phones', 'number');
// <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type phone..." />
// {results.map(r => <button onClick={() => selectExisting(r.id)}>{r.number} (Existing)</button>)}
// {results.length === 0 && query.length > 5 && <button onClick={createNew}>Create "{query}" as new</button>}
```

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
            INSERT INTO emails (address, status, metadata)
            VALUES (contact_method->>'address', 'active', jsonb_build_object('verification_status', 'Valid'))
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
Campaign generation will be streamlined to use the **exact same UI** whether you are starting from the CRM or from an existing campaign draft. The legacy `ContactSelectionStep.tsx` will be deprecated and functionally replaced by recycling the `PeopleTable` component.

1.  **From CRM (`/admin/crm`):** Bulk select rows on `PeopleTable` ➔ "New Campaign". 

**Code Snippet (`src/app/admin/crm/components/PeopleTable.tsx`):**
```tsx
const { setPendingContacts } = useCampaignDraftStore();

const bulkActions = (
    <Button 
        size="sm" 
        variant="outline" 
        className="h-7 text-xs ml-2 bg-white"
        onClick={() => {
            const ids = table.getSelectedRowModel().rows.map(r => r.original.id);
            setPendingContacts(ids);
            router.push('/admin/campaigns/new');
        }}
    >
        <Mail className="w-3 h-3 mr-1" /> New Campaign
    </Button>
);
```

**State Hand-off (Zustand over LocalStorage):**
Instead of polluting `localStorage` or hitting browser URL limits, we will leverage the app's existing `zustand` library to handle the in-memory hand-off between routes. Because Next.js App Router navigates without a full page reload, Zustand state persists perfectly across the transition.

**1. The Store (`src/stores/campaignDraftStore.ts`):**
```ts
import { create } from 'zustand';

interface CampaignDraftState {
    pendingContactIds: string[];
    setPendingContacts: (ids: string[]) => void;
    clearPendingContacts: () => void;
}

export const useCampaignDraftStore = create<CampaignDraftState>((set) => ({
    pendingContactIds: [],
    setPendingContacts: (ids) => set({ pendingContactIds: ids }),
    clearPendingContacts: () => set({ pendingContactIds: [] }),
}));
```

**2. The Trigger (`src/app/admin/crm/components/PeopleTable.tsx`):**
```tsx
const { setPendingContacts } = useCampaignDraftStore();

const bulkActions = (
    <Button 
        size="sm" variant="outline" className="h-7 text-xs ml-2 bg-white"
        onClick={() => {
            // Save to Zustand memory
            const ids = table.getSelectedRowModel().rows.map(r => r.original.id);
            setPendingContacts(ids);
            
            // Soft-navigate to the new campaign wizard
            router.push('/admin/campaigns/new');
        }}
    >
        <Mail className="w-3 h-3 mr-1" /> New Campaign
    </Button>
);
```

**3. The Ingestion (`src/app/admin/campaigns/new/page.tsx` amendments):**
Currently, `new/page.tsx` just creates the campaign and redirects. We will amend `handleCreate` to read from the Zustand store.

```tsx
// Inside NewCampaignPage component
const { pendingContactIds, clearPendingContacts } = useCampaignDraftStore();

const handleCreate = async (e: React.FormEvent) => {
    // ... validation ...
    const campaign = await createCampaign({ name, sender })

    // Check Zustand store for passed contacts
    if (pendingContactIds.length > 0) {
        try {
            await addRecipients(campaign.id, pendingContactIds);
        } catch (e) {
            console.error("Failed to add pending contacts", e);
        } finally {
            clearPendingContacts(); // Wipe from memory
        }
    }

    router.push(`/admin/campaigns/${campaign.id}`)
}
```

2.  **From Campaigns (`/admin/campaigns/[id]`):** If a campaign is in a "Draft" status with no recipients, the Campaign Editor will render the CRM `PeopleTable` so users can securely add recipients using the new graph data structure.

**Code Snippet (`src/app/admin/campaigns/[id]/page.tsx` amendments):**
```tsx
// Inside the CampaignEditPage render logic
{currentStep === 'select-recipients' && (
  <div className="h-full flex flex-col">
     {/* Render the core CRM component directly */}
     <PeopleTable 
        mode="campaign_selection" 
        campaignId={campaignId}
        onContinue={(selectedIds) => handleContinueFromRecipients(selectedIds)} 
     />
  </div>
### 2.2 Proactive Email Validation in Campaigns
Instead of the backend silently skipping bad emails during a campaign run:
1. All selected contacts enter the "Review" step.
2. The UI queries the `emails` table. If `emails.status IN ('bounced', 'suppressed')` for a contact's primary email, it flags them in red.
3. The user can manually resolve this (select a secondary email) or click "Remove Invalid" before launching.

**Code Snippet - Validation logic during Review Step:**
```tsx
// Inside a component rendering the review list
const isValidEmail = (contact: any) => {
    const primaryEmail = contact.person_emails?.find((pe: any) => pe.is_primary)?.emails;
    if (!primaryEmail) return false;
    
    // Flag if bounced or suppressed
    return !['bounced', 'suppressed'].includes(primaryEmail.status);
};

// ... rendered within the UI row ...
{!isValidEmail(contact) && (
    <Tooltip content={`Email status: ${contact.person_emails?.find((pe: any) => pe.is_primary)?.emails?.status}`}>
        <AlertCircle className="w-4 h-4 text-red-500" />
    </Tooltip>
)}
```

### 2.3 CRM Filter Data Mapping
To deprecate `ContactSelectionStep.tsx`, the main CRM `PeopleTable` and its API (`GET /api/crm/people`) must absorb all its filtering logic. Below is the mapping of how the legacy filters map into the new normalized schema:

1.  **Location:** Filtered natively via text search.
    *   *Schema Mapping:* Text match against `people.details->>'location'`.
2.  **Contact Types (Developer, Investor, Fund, Broker):** Filtered natively via arrays.
    *   *Schema Mapping:* Array containment query against `people.tags`. (Unified with Specialization Tag logic, no need to query organizations here based on V1 spec).
3.  **Website Activity:** Checks if a user has performed actions (e.g. Tax calculator, OZ Check).
    *   *Schema Mapping:* Sub-query against `user_events` joining on `people.user_id`. (Logic unchanged from V1).
4.  **Tags / Specialization (Family Office, Multi-Family Office):** Filtered natively via arrays.
    *   *Schema Mapping:* Array containment query against `people.tags`.
5.  **Campaign Response (Replied, Bounced, No Reply):** Checks interaction history against a past campaign.
    *   *Schema Mapping:* Sub-query against `campaign_recipients` joining on `people.id` = `recipient_person_id`.
6.  **Email Status (Verified, Catch-all, Suppressed, Bounced):**
    *   *Schema Mapping:* Requires a JOIN. Query filters `people` via `person_emails` into the `emails` table checking `emails.status` (for deliverability) OR `emails.metadata->>'verification_status'` (for Valid/Catch-all).
7.  **Lead Status (Warm / Cold):** Filtered natively.
    *   *Schema Mapping:* Direct equality check on top-level column `people.lead_status`.
8.  **Exclude Campaigns (Not Contacted In):** Drops recipients already in a specific campaign.
    *   *Schema Mapping:* Exclude sub-query against `campaign_recipients` joining on `people.id` = `recipient_person_id`.
9.  **Source:** Tracks where the contact was imported from.
    *   *Schema Mapping:* Text match against `people.details->>'import_source'`.

### 2.4 Deprecating the Standalone Prospects Route & Table Adjustments
`/admin/prospects` will be replaced by bringing contact capabilities directly into the main CRM interface. To facilitate active outreach without cluttering the view:

1.  **Quick Filters:** A "Has Phone" toggle will be placed next to the Email and LinkedIn filter buttons, adjacent to the search bar. This serves to quickly filter the dataset for callability.
2.  **Table Real Estate:** `status` and `title` columns will be removed from the `/admin/crm` People table to prioritize screen space.
3.  **Dynamic "Contact Info" Column:** A new `Contact Info` column will be introduced. It will only be visible if at least one of the quick filters (Email, LinkedIn, Phone) is toggled on. It aggregates the target information (e.g., stacking emails and phone numbers) to allow quick scanning.
4.  **Logging Actions & The Call Modal:** The dialer controls and outcome logging will happen directly within the `<EntitySheet>`. A prominent "Log Call" button will sit at the top right of the sheet, opening a ported `<CallModal>` tightly bound to the new `person_id`.
    *   **Global Entity Search (Pre-requisite for New Entities):** Wherever the UI allows adding a "new" phone or email (e.g., the missing phone prompt or new email capture), it must *first* query the `phones` or `emails` tables as the user types. If the record already exists in the database, the UI will display the autocomplete result, allowing you to simply link the existing global entity rather than creating a duplicate. Only if no results match will the UI allow the creation of a brand new record.
    *   **Missing Phone Prompt:** If the person has no phone numbers assigned to them, clicking "Log Call" will first display a UI state to manually add a phone number and link it to the person. Once added, it will proceed to the standard call logging view.
    *   **Phone Selection:** The modal will display all known phone numbers for the person (from `person_phones`), allowing the user to select the specific number they dialed to accurately attribute the activity log.
    *   **Email Selection:** If the person has linked emails (from `person_emails`), the modal will present a dropdown or radio list of these existing emails to choose as the target for the follow-up.
    *   **New Email Capture:** Users will still have the option to manually capture an email address during the call. Following the Global Entity Search rule, the API will link an existing email or upsert a new one into the CRM.
    *   **Skip Email Option:** For outcomes that naturally trigger a follow-up (like `answered` or `no_answer`), a clear "Skip follow-up email" checkbox will allow callers to log the outcome and update the CRM state without actually dispatching the automated message.

**Code Snippet - Dynamic Column Logic:**
```tsx
// Inside PeopleTable.tsx column definitions
{
    accessorKey: 'contactInfo',
    header: 'Contact Info',
    // visibility state is bound to: (hasEmailFilter || hasPhoneFilter || hasLinkedInFilter)
    cell: ({ row }) => {
        const p = row.original;
        return (
            <div className="flex flex-col text-xs">
                {/* Conditionally render phones, emails, linkedin based on active toggles */}
                {hasPhoneFilter && p.person_phones?.map(ph => <span key={ph.id}>{ph.phones.number}</span>)}
                {hasEmailFilter && p.person_emails?.map(e => <span key={e.id}>{e.emails.address}</span>)}
            </div>
        );
    }
}
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

### 2.5 Porting the Entity Lock & Caller Identity System
To prevent collisions during active outreach campaigns, the locking mechanisms from `/admin/prospects` will be ported over entirely. This applies across all core CRM entities (`people`, `organizations`, `properties`) to ensure data integrity regardless of how a user navigates.

1. **Database Schema Enhancements:**
   We will add lock-tracking columns directly to the tables for seamless Supabase Realtime subscription updates.
   ```sql
   ALTER TABLE people ADD COLUMN viewing_by TEXT, ADD COLUMN lockout_until TIMESTAMPTZ;
   ALTER TABLE organizations ADD COLUMN viewing_by TEXT, ADD COLUMN lockout_until TIMESTAMPTZ;
   ALTER TABLE properties ADD COLUMN viewing_by TEXT, ADD COLUMN lockout_until TIMESTAMPTZ;
   ```

2. **Caller Identity & Verification:**
   * Reusing the `UserPasswordGrid` modal from the prospects page. If a user is unauthenticated locally within the context of the CRM calling environment, they must verify their identity.
   * State is persisted via `localStorage.getItem('prospect_current_user')`.
   * The page title in `/admin/crm` will be updated to reflect the active caller (e.g., *"Calling as Param (Change)"*).

3. **Lock Lifecycle via API:**
   * **Opening the Sheet:** Intercept row clicks. Fire `POST /api/crm/[entity_type]/[id]/lock`. If `409 Conflict` is returned, alert: *"This contact is currently being viewed by [User]"* and abort. Otherwise, render `<EntitySheet>`.
   * **Closing the Sheet:** Fire `DELETE /api/crm/[entity_type]/[id]/lock` using a `keepalive: true` fetch on sheet close or component unmount.

4. **Realtime UI Updates:**
   The `CRMShell` will maintain a Supabase Realtime channel subscription listening for `UPDATE` events on these tables. If another user acquires a lock, their name and a lock icon will render instantly on the datatable row, greying it out to prevent simultaneous access.

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
// Import scripts correctly save statuses directly to emails.status (e.g., 'bounced', 'suppressed'), and 'Valid' to emails.metadata->>'verification_status'.
if (emailStatuses.length > 0) {
    // Note: implementation must filter against both status and metadata depending on the requested array values
    query = query.filter('person_emails.emails.status', 'in', `(${emailStatuses.map(s => `"${s}"`).join(',')})`);
}

// 3. Campaign Performance (Replied, Bounced, No Reply)
if (campaignResponse) {
    if (campaignResponse === 'replied') {
        query = query.not('campaign_recipients.replied_at', 'is', null);
    } else if (campaignResponse === 'bounced') {
        // Querying activities or updated campaign_recipients for bounce state
        query = query.eq('campaign_recipients.status', 'bounced'); 
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
    query = query.not('campaign_recipients', 'is', null);
} else if (campaignHistory === 'none') {
    query = query.is('campaign_recipients', null);
}

// 6. Lead Status
if (leadStatuses.length > 0) {
    query = query.in('lead_status', leadStatuses);
}
```

---

## 4. Backend System Integration (`ozl-backend`)

### 4.1 Calling CRM System

**Architecture Note:** All new programmatic API routes for the CRM (including the call logging functionality described below) will be built in the **Python backend API service (`ozl-backend`)**. The Next.js frontend will communicate with these services via Vercel API route proxies (e.g., `/api/backend-proxy/...`), instead of executing the database logic inside native Vercel/Next.js API routes. This centralizes our heavier mutations and integrations into the Python ecosystem.

Instead of a single database insert, the frontend proxy will hit a new Python backend route (e.g., `POST /api/backend-proxy/crm/people/[person_id]/calls`) which handles both the timeline logging and the current-state mutations in a single transaction. It will closely mirror the logic conceptually found in the old `src/app/api/prospects/[id]/call/route.ts`.

**Required Python API Route Logic:**
1. **Activity Ledger Insert:** Insert a chronological event record into the new `activities` table. Include caller tracking and extra info natively in the JSONB.
   ```sql
   INSERT INTO activities (person_id, type, channel, description, metadata) 
   VALUES ($1, 'call_logged', 'phone', 'Outcome: ' || $2, 
           jsonb_build_object('caller_name', $3, 'phone_used', $4, 'email_captured', $5));
   ```
2. **Current State Mutations:** Based on the call outcome, mutate the CRM graph entities:
   * **Phone Readiness (Call Status):** `UPDATE person_phones SET call_status = $3, last_called_at = NOW(), call_count = COALESCE(call_count, 0) + 1 WHERE person_id = $1 AND phone_id = (SELECT id FROM phones WHERE number = $2)`
   * **Do Not Call (DNC):** `UPDATE people SET lead_status = 'do_not_contact' WHERE id = $1`
   * **Follow Up:** Store the follow up time directly on the person_phones junction so it ties to the specific person-phone relationship called.
     `UPDATE person_phones SET follow_up_at = $1 WHERE person_id = $2 AND phone_id = (SELECT id FROM phones WHERE number = $3)`
3. **Captured Email Upsert (Critical):** If the caller enters a *new* email address into the `<CallModal>` during the call:
   * Perform an `UPSERT` into the `emails` table.
   * Attempt to `INSERT` into the `person_emails` junction table marking it as `source = 'manual_call'`.
4. **Trigger Follow-Up (Synchronous):** The `send_gmail_email` function will be executed synchronously before returning the HTTP response. While this adds 1-3 seconds to the request latency, it prioritizes reliability over raw speed. The UI will wait for confirmation that the email was actually delivered to the Gmail API. If the email fails (e.g., expired OAuth token), the backend can catch the exception and return a partial success response (e.g., "Call logged, but follow-up failed") so the sales rep is immediately aware.
   ```python
   from services.email_service import send_gmail_email
   
   # ... After DB mutations are committed ...
   
   try:
       # Blocks the response until Google confirms receipt
       send_result = send_gmail_email(
           person_id=person_id,
           recipient_email=email,
           outcome=outcome
       )
   except Exception as e:
       # Handle failures loudly so the UI can render an error toast
       return {"status": "partial_success", "error": f"Follow up failed: {str(e)}"}
   ```

### 4.2 Inbox Sync Reply Processing Update
The `inbox-sync` background service (`ozl-backend/services/inbox-sync/inbox_sync.py`) handles polling Gmail for replies. This logic must be updated to integrate with the new CRM identity schema and emit historical events to the new `activities` table.

**Required Logic Updates in `process_new_replies`:**
1. **Resolve `recipient_person_id`:** Instead of querying the legacy `contacts` table, look up the `emails` table (by `address`) and join through `person_emails` to resolve the `recipient_person_id`. This logic should utilize the new shared utility `get_person_id_by_email` from `ozl_shared.db` (which replaces `get_contact_id_by_email`).
   ```python
   person_id = get_person_id_by_email(supabase, prospect_email)
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
2. **Backfill Execution:** Instead of relying on fragile local JSON artifacts from the import script, we will utilize a pure SQL `UPDATE` statement ran directly against the production database. Because both legacy `contacts` and the new `people` schema exist in the same database, we can securely cross-walk using the email address. This is instantaneous, idempotent, and avoids local-to-prod mapping errors.
   
```sql
-- Join legacy contacts to new people via the emails bridge
UPDATE campaign_recipients cr
SET recipient_person_id = pe.person_id
FROM contacts c
JOIN emails e ON lower(c.email) = lower(e.address)
JOIN person_emails pe ON e.id = pe.email_id
WHERE cr.contact_id = c.id;
```
3. **App Logic Swap:** Refactor `inbox_sync.py`, `followup_scheduler.py`, `generate.py`, and `db.py` to target `recipient_person_id`. Rewrite the shared lookup utility (`get_contact_id_by_email` -> `get_person_id_by_email`) inside `ozl_shared/db.py` so both the webhook payload processor and the inbox sync worker can securely resolve identities from a single point of truth.

```python
# ozl_shared/db.py (or within the webhook/inbox modules as a shared util)
def get_person_id_by_email(supabase: Client, email_address: str) -> Optional[str]:
    """Resolves a human person_id from a raw email address string."""
    try:
        # First, find the email record
        email_res = supabase.table('emails').select('id').eq('address', email_address).maybe_single().execute()
        if not email_res.data:
            return None
            
        # Second, map it to the person_emails junction
        person_res = supabase.table('person_emails').select('person_id').eq('email_id', email_res.data['id']).execute()
        if not person_res.data:
            return None
            
        return person_res.data[0]['person_id']
    except Exception as e:
        logging.error(f"Failed to lookup person_id for email {email_address}: {e}")
        return None
```
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
    target_person_id uuid;
    target_email_id uuid;
BEGIN
    -- 1. Check if the email already exists in our CRM global emails table
    SELECT id INTO target_email_id FROM public.emails WHERE address = NEW.email;

    -- 2. If the email exists, find the person it belongs to
    IF target_email_id IS NOT NULL THEN
        SELECT person_id INTO target_person_id 
        FROM public.person_emails 
        WHERE email_id = target_email_id 
        LIMIT 1;
    END IF;

    -- 3. Route logic based on whether they exist in the CRM
    IF target_person_id IS NOT NULL THEN
        -- A: ENRICH EXISTING PERSON (They were imported before they signed up)
        UPDATE public.people 
        SET 
            user_id = NEW.id, -- Link their new auth account
            lead_status = 'warm', -- Upgrade their status
            -- Append the signup tag safely avoiding duplicates
            tags = ARRAY(SELECT DISTINCT unnest(array_append(tags, 'website_signup')))
        WHERE id = target_person_id;
    ELSE
        -- B: CREATE BRAND NEW PERSON (Total stranger)
        INSERT INTO public.people (user_id, lead_status, tags, first_name, last_name)
        VALUES (
            NEW.id, 
            'warm', 
            ARRAY['website_signup'],
            NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'last_name', '')
        )
        RETURNING id INTO target_person_id;

        -- Insert the email if it wasn't found
        IF target_email_id IS NULL THEN
            INSERT INTO public.emails (address, status, metadata)
            VALUES (NEW.email, 'active', jsonb_build_object('verification_status', 'Valid'))
            RETURNING id INTO target_email_id;
        END IF;

        -- Link the newly created email and person
        INSERT INTO public.person_emails (person_id, email_id, is_primary, source)
        VALUES (target_person_id, target_email_id, true, 'auth_trigger');
    END IF;

    RETURN NEW;
END;
$$;
```

### 5.4 Historical Telemetry Backfill
To populate the timeline, we must backfill `activities` from existing legacy execution tables. This will be done after the FKs are correctly migrated (e.g., `campaign_recipients` updated to reference `recipient_person_id`).

**Implementation Strategy:**

1.  **Prospect Calls (Historical):** 

First, we populate the chronological timeline in the `activities` table, moving specific call data like caller identifier and collected emails into the `metadata` JSONB block.

```sql
INSERT INTO activities (person_id, type, channel, description, timestamp, metadata) 
SELECT 
    -- Requires a mapping from the old prospect_id
    pm.person_id, 
    'call_logged', 
    'phone', 
    'Outcome: ' || pc.outcome, 
    pc.called_at,
    jsonb_build_object(
        'caller_name', pc.caller_name, 
        'phone_used', pc.phone_used, 
        'email_captured', pc.email_captured
    )
FROM prospect_calls pc
JOIN person_mappings pm ON pc.prospect_id = pm.prospect_id;
```

Second, we must migrate the **final status states** from the legacy `prospects` table to the `person_phones` junction table (since historical calls dictate the readiness of the specific person-phone relationship). This avoids wiping the database and acts as a safe, instantaneous migration on production:

```sql
-- 1. Sync Call Statuses and Follow-ups to the person-phone link
UPDATE person_phones pp
SET 
    call_status = p_old.call_status::text,
    last_called_at = p_old.last_called_at,
    follow_up_at = p_old.follow_up_at
FROM prospects p_old
JOIN properties prop_new ON prop_new.property_name = p_old.property_name AND prop_new.address = p_old.address
JOIN person_properties p_prop ON p_prop.property_id = prop_new.id
JOIN phones ph_new ON ph_new.id = pp.phone_id
WHERE pp.person_id = p_prop.person_id
  AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_old.phone_numbers) as old_ph
      WHERE old_ph->>'number' = ph_new.number
  )
  AND (p_old.call_status != 'new' OR p_old.follow_up_at IS NOT NULL);

-- 2. DNC flags: Migrate to the Person
UPDATE people p_new
SET lead_status = 'do_not_contact'
FROM prospects p_old
JOIN properties prop_new ON prop_new.property_name = p_old.property_name AND prop_new.address = p_old.address
JOIN person_properties p_prop ON p_prop.property_id = prop_new.id
WHERE p_new.id = p_prop.person_id 
  AND p_old.call_status = 'do_not_call';
```

3.  **Campaign Timeline Sync:** 

Instead of only grabbing replies seamlessly, we must utilize `campaign_recipients` to paint the full historical picture (Sends, Bounces, Replies, and Unsubscribes). We must also `JOIN` the `campaigns` table to ensure the timeline description is human-readable.

```sql
-- Example for Replies (similar SELECTs should be UNIONed for sent_at, bounced_at, unsubscribed_at)
INSERT INTO activities (person_id, type, channel, description, timestamp, metadata)
SELECT 
    cr.recipient_person_id, 
    'email_reply', 
    'email',
    'Replied to Campaign: ' || c.name,
    cr.replied_at,
    jsonb_build_object('campaign_id', c.id)
FROM campaign_recipients cr
JOIN campaigns c ON cr.campaign_id = c.id
WHERE cr.replied_at IS NOT NULL;
```

4.  **Other Events & Architectural Tradeoffs:**
We must carefully consider the tradeoff of duplicating data into the new `activities` ledger versus querying it natively.

**The Tradeoff (`user_events`):**
If a user clicks a button on the website, a row is added to the legacy `user_events` table for analytic tracking. 
* *Pro - Duplication:* If we copy every `user_event` into the `activities` ledger via a DB trigger, the CRM frontend only needs to query *one* table to render the entire Outreach Timeline. 
* *Con - Duplication:* High volume events (like `page_view`) will massively bloat the `activities` table with noisy telemetry that isn't true "CRM Outreach".
**Decision:** We will **NOT** duplicate website `user_events` into the `activities` ledger. The `<EntitySheet>` UI will run two parallel queries: one to fetch `activities` (calls, emails, linkedin) and one to fetch `user_events` (website clicks/logins), merging them client-side or in the API layer before sorting them chronologically for the timeline render.

**The Tradeoff (Email Webhooks - Bounces/Opens/Clicks):**
Unlike website events, email interactions (opens, clicks, bounces) are explicitly CRM outreach events. Currently, SendGrid/Mailgun webhooks hit our python backend (`ozl-backend/api/webhooks...`) and update the `campaign_recipients` table (e.g., `SET bounced_at = NOW()`).
**Decision:** We **WILL** dual-write these email events into the `activities` ledger directly from the python webhook handlers in real-time. This ensures the timeline accurately reflects micro-interactions that don't fit perfectly into the `campaign_recipients` schema.

**Implementation (`ozl-backend` Webhook Python Snippets):**
When a bounce webhook is received from the email provider:
```python
# Inside webhook handler after verifying payload
person_id = get_person_id_by_email(supabase, email_address)

if person_id:
    # 1. Update the state table (legacy integration)
    supabase.table('campaign_recipients')\
        .update({'bounced_at': bounce_time, 'status': 'bounced'})\
        .eq('recipient_person_id', person_id)\
        .eq('campaign_id', campaign_id).execute()
        
    # 2. Append to the ledger for the UI timeline
    supabase.table('activities').insert({
        'person_id': person_id,
        'type': 'email_bounce',
        'channel': 'email',
        'description': f'Email bounced during campaign: {campaign_name}',
        'metadata': {'reason': bounce_reason, 'campaign_id': campaign_id},
        'timestamp': bounce_time
    }).execute()
```

When an "Open" webhook is received (note: we don't track opens in `campaign_recipients`, so the ledger is the *only* place this goes):
```python
if person_id:
    # Append to the ledger for the UI timeline
    supabase.table('activities').insert({
        'person_id': person_id,
        'type': 'email_opened',
        'channel': 'email',
        'description': f'Opened email from campaign: {campaign_name}',
        'metadata': {'ip': request_ip, 'campaign_id': campaign_id},
        'timestamp': open_time
    }).execute()
```

### 5.5 Email Verification Status Fix (Production Backfill)
We must migrate the legacy `email_status` (Valid/Catch-all) from the `people.details` JSONB column to the proper location directly on the email record (`emails.metadata->>'verification_status'`). This SQL backfill ensures data correctness in production without needing a full re-import:

```sql
-- 1. Move email_status from people.details to emails.metadata
UPDATE emails e
SET metadata = jsonb_set(
    COALESCE(e.metadata, '{}'::jsonb),
    '{verification_status}',
    to_jsonb(sub.email_status)
)
FROM (
  SELECT pe.email_id, p.details->>'email_status' as email_status
  FROM person_emails pe
  JOIN people p ON p.id = pe.person_id
  WHERE p.details->>'email_status' IS NOT NULL
    AND pe.source = 'contacts_import'
) sub
WHERE e.id = sub.email_id;

-- 2. Remove the legacy field from people.details to clean up the graph
UPDATE people
SET details = details - 'email_status'
WHERE details ? 'email_status';
```
