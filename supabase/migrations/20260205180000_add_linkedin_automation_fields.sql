-- Create linkedin_status enum
DO $$ BEGIN
    CREATE TYPE linkedin_automation_status AS ENUM (
        'queued', 'searching', 'invited', 'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add LinkedIn fields to prospect_calls
ALTER TABLE prospect_calls ADD COLUMN IF NOT EXISTS linkedin_status linkedin_automation_status;
ALTER TABLE prospect_calls ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE prospect_calls ADD COLUMN IF NOT EXISTS linkedin_error TEXT;

-- Add LinkedIn URL to prospect_phones for quick access
ALTER TABLE prospect_phones ADD COLUMN IF NOT EXISTS linkedin_url TEXT;


