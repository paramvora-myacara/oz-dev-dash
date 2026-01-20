-- Migration: Modernize contact_type storage to use PostgreSQL arrays
-- This allows for more flexible and efficient multi-type filtering without combinatorial string matching.

-- 1. Add new array column
ALTER TABLE contacts ADD COLUMN contact_types TEXT[] DEFAULT ARRAY['developer'];

-- 2. Migrate existing data from comma-separated string to array
-- Example: 'developer,investor' -> ['developer', 'investor']
UPDATE contacts 
SET contact_types = string_to_array(contact_type, ',')
WHERE contact_type IS NOT NULL;

-- 3. Add GIN index for efficient array searching
-- This makes overlaps (&&) and contains (@>) operators very fast
CREATE INDEX idx_contacts_types_gin ON contacts USING GIN(contact_types);

-- Note: We are keeping the old contact_type column for now to ensure 
-- backward compatibility during the transition. Once all systems are 
-- updated, it can be dropped in a subsequent migration.

COMMENT ON COLUMN contacts.contact_types IS 'Array of contact categories (developer, investor, fund, broker, etc.)';
