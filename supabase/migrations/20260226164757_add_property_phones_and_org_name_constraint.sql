-- Migration: Add property_phones junction table and unique constraint on organizations.name
--
-- Depends on: 20260226162159_create_consolidated_crm_storage.sql
--
-- Changes:
--   1. Creates property_phones junction table (phones linked directly to properties,
--      for orphan property-level phones that have no named personal contact)
--   2. Adds UNIQUE(name) constraint to organizations so ON CONFLICT dedup works
--      during QOZB import (exact name match only, no fuzzy merging)

-- ─── 1. property_phones junction table ───────────────────────────────────────
-- Connects a phone number entity to a property directly (no person intermediary).
-- Use case: the QOZB CSV has a property-level "Phone Number" column that is often
-- a building switchboard, not a personal contact number. These can't go on a `people`
-- record but are still useful for calling / contact lookup.
-- The org relationship is implicit: navigate property → person_properties → person_organizations.

CREATE TABLE IF NOT EXISTS property_phones (
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    phone_id    UUID NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
    label       TEXT,                          -- 'property_line', 'switchboard', etc.
    source      TEXT DEFAULT 'qozb_import',    -- origin of this link
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (property_id, phone_id)
);

CREATE INDEX IF NOT EXISTS idx_property_phones_property ON property_phones(property_id);
CREATE INDEX IF NOT EXISTS idx_property_phones_phone    ON property_phones(phone_id);

-- Add to realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'property_phones'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE property_phones;
    END IF;
END $$;

-- ─── 2. Unique constraint on organizations.name ───────────────────────────────
-- Required for the import script to use ON CONFLICT (name) DO UPDATE
-- to safely upsert organizations without duplicates.
-- Strategy: exact name match only. "Greystar" and "Greystar Management" are
-- intentionally kept as separate records.

ALTER TABLE organizations
    ADD CONSTRAINT organizations_name_unique UNIQUE (name);
