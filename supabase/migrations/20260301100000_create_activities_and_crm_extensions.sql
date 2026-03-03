-- Migration: Create activities table and extend CRM for call tracking + campaign person links
--
-- Depends on: 20260226162159_create_consolidated_crm_storage.sql
--             20260226164757_add_property_phones_and_org_name_constraint.sql
--             20260227152500_optimize_crm_indices.sql
--
-- Changes:
--   1. Creates the `activities` table — unified timeline ledger for calls, emails, linkedin
--   2. Adds call tracking columns to `person_phones` (call_status, call_count, etc.)
--   3. Adds `recipient_person_id` to `campaign_recipients` for CRM person linkage
--   4. Updates `handle_new_user()` trigger to write to the CRM tables instead of contacts

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Activities table — unified timeline ledger
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    type TEXT NOT NULL,          -- 'email_reply', 'call_logged', 'linkedin_message', 'email_bounce', etc.
    channel TEXT NOT NULL,       -- 'email', 'phone', 'linkedin', 'system'
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_person_id ON activities(person_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

-- Add to realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'activities'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE activities;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Call tracking columns on person_phones
-- ═══════════════════════════════════════════════════════════════════════════════
-- These migrate the call flow state from the legacy prospect_phones table into
-- the CRM junction table, so the CRM UI can show call status per person-phone.

ALTER TABLE person_phones
    ADD COLUMN IF NOT EXISTS call_status TEXT DEFAULT 'new',     -- 'new','called','answered','no_answer','invalid_number','follow_up','closed','rejected','do_not_call','pending_signup'
    ADD COLUMN IF NOT EXISTS call_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_called_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_called_by TEXT,
    ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_person_phones_call_status ON person_phones(call_status);
CREATE INDEX IF NOT EXISTS idx_person_phones_follow_up ON person_phones(follow_up_at) WHERE follow_up_at IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Campaign recipients → people linkage
-- ═══════════════════════════════════════════════════════════════════════════════
-- Adds the FK column to connect campaign_recipients to the new CRM people table.
-- The backfill (setting the actual values) happens in the import script via the
-- contacts_to_people_mapping, NOT in this migration.

ALTER TABLE campaign_recipients
    ADD COLUMN IF NOT EXISTS recipient_person_id UUID REFERENCES people(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_camp_recipients_person ON campaign_recipients(recipient_person_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Updated auth trigger — writes to CRM tables instead of contacts
-- ═══════════════════════════════════════════════════════════════════════════════
-- When a new user signs up on the website, this trigger:
--   A) If their email exists in the CRM → links the auth user and upgrades lead_status
--   B) If they're brand new → creates a people + emails + person_emails record

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
            user_id = NEW.id,
            lead_status = 'warm',
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

    -- Also continue inserting into legacy contacts table for backwards compatibility
    -- (until all consumers are migrated off contacts)
    INSERT INTO public.contacts (
        email, name, source, contact_type, details, user_id
    )
    VALUES (
        NEW.email,
        NULLIF(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ''),
        'website_signup',
        'investor',
        jsonb_build_object('lead_status', 'warm'),
        NEW.id
    )
    ON CONFLICT (email)
    DO UPDATE SET
        user_id = COALESCE(contacts.user_id, NEW.id),
        name = COALESCE(NULLIF(contacts.name, ''), NULLIF(NEW.raw_user_meta_data->>'full_name', '')),
        source = COALESCE(contacts.source, 'website_signup'),
        details = COALESCE(contacts.details, '{}'::jsonb) || jsonb_build_object('lead_status', 'warm'),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new auth signup: creates/enriches CRM person + email + link, and dual-writes to legacy contacts table for backwards compatibility.';
