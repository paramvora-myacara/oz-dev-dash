-- Add analytics tracking to campaign_recipients table
ALTER TABLE campaign_recipients
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_reply_subject TEXT;

-- Add global suppression to contacts table
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS globally_unsubscribed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS globally_bounced BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS suppression_reason TEXT,
  ADD COLUMN IF NOT EXISTS suppression_date TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_replied_at ON campaign_recipients(replied_at);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_unsubscribed_at ON campaign_recipients(unsubscribed_at);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_bounced_at ON campaign_recipients(bounced_at);
CREATE INDEX IF NOT EXISTS idx_contacts_globally_unsubscribed ON contacts(globally_unsubscribed);
CREATE INDEX IF NOT EXISTS idx_contacts_globally_bounced ON contacts(globally_bounced);
