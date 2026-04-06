-- Migration: Add search_vector to properties table
--
-- Depends on: 20260226162159_create_consolidated_crm_storage.sql
--
-- Changes:
--   1. Adds a generated tsvector column covering property_name, address, city, state, zip
--   2. Adds a GIN index on that column for fast full-text search
--
-- This enables the existing /api/crm/properties route (which already calls
-- .textSearch('search_vector', ...)) to actually work, and makes the EntitySheet
-- inline property search consistent with the main Properties tab search.

ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            COALESCE(property_name, '') || ' ' ||
            COALESCE(address, '') || ' ' ||
            COALESCE(city, '') || ' ' ||
            COALESCE(state, '') || ' ' ||
            COALESCE(zip, ''))
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN(search_vector);
