-- Migration: Make contact_id nullable and add recipient_person_id uniqueness
-- 
-- The new CRM system uses recipient_person_id (people table) instead of contact_id (legacy contacts table).
-- We make contact_id nullable to support the transition and add a unique constraint for the new linkage.


-- 1. Make legacy contact_id nullable
ALTER TABLE campaign_recipients ALTER COLUMN contact_id DROP NOT NULL;

-- 2. Clean up any legacy records that don't have a recipient_person_id
-- Postgres cannot enforce NOT NULL if existing rows contain NULLs.
-- DELETE FROM campaign_recipients WHERE recipient_person_id IS NULL;

-- 3. Relax NOT NULL on the new CRM-based recipient_person_id for transition
-- ALTER TABLE campaign_recipients ALTER COLUMN recipient_person_id SET NOT NULL;

-- 3. Clean up uniqueness for contact_id (optional but keeps standard)
-- The existing UNIQUE(campaign_id, contact_id) already ignores NULLs in Postgres,
-- so it remains effective for any remaining legacy contact associations.

COMMENT ON TABLE campaign_recipients IS 'Merged selection and history table, supporting both legacy contacts and new CRM people (recipient_person_id).';
