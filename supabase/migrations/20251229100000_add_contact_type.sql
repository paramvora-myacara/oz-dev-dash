-- Add contact_type column to contacts table for differentiating between developers and investors
-- Using TEXT to allow comma-separated values like 'developer,investor'
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_type TEXT NOT NULL DEFAULT 'developer';

-- Add index for performance when filtering by contact type
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(contact_type);
