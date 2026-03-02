-- Migration: Add locking columns to CRM core entities
--
-- Changes:
--   1. Adds viewing_by, viewing_since, and lockout_until to `people`
--   2. Adds viewing_by, viewing_since, and lockout_until to `organizations`
--   3. Adds viewing_by, viewing_since, and lockout_until to `properties`

ALTER TABLE people
    ADD COLUMN IF NOT EXISTS viewing_by TEXT,
    ADD COLUMN IF NOT EXISTS viewing_since TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ;

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS viewing_by TEXT,
    ADD COLUMN IF NOT EXISTS viewing_since TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ;

ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS viewing_by TEXT,
    ADD COLUMN IF NOT EXISTS viewing_since TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ;

-- Add indexes for lock lookups
CREATE INDEX IF NOT EXISTS idx_people_viewing_by ON people(viewing_by);
CREATE INDEX IF NOT EXISTS idx_organizations_viewing_by ON organizations(viewing_by);
CREATE INDEX IF NOT EXISTS idx_properties_viewing_by ON properties(viewing_by);
