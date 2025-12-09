-- Add campaign_id reference
ALTER TABLE email_queue 
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);

-- Add is_edited flag for tracking manual edits
ALTER TABLE email_queue 
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Allow NULL values for fields that are set at launch time (not staging)
ALTER TABLE email_queue 
  ALTER COLUMN scheduled_for DROP NOT NULL;

ALTER TABLE email_queue 
  ALTER COLUMN from_email DROP NOT NULL;

ALTER TABLE email_queue 
  ALTER COLUMN domain_index DROP NOT NULL;

-- Create index for efficient staging queries
CREATE INDEX IF NOT EXISTS idx_email_queue_campaign_status 
  ON email_queue(campaign_id, status);

-- Create index for staged emails
CREATE INDEX IF NOT EXISTS idx_email_queue_staged 
  ON email_queue(campaign_id) 
  WHERE status = 'staged';

