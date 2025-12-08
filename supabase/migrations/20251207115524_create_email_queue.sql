-- Create email_queue table for cold email campaign system
-- This table stores all emails to be sent, with domain rotation and timing

CREATE TABLE IF NOT EXISTS email_queue (
  id SERIAL PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  from_email TEXT NOT NULL,
  domain_index INTEGER NOT NULL,
  delay_seconds INTEGER NOT NULL,
  status TEXT DEFAULT 'queued',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for) WHERE status = 'queued';

-- Add comment to table
COMMENT ON TABLE email_queue IS 'Queue table for cold email campaigns. Stores emails to be sent with domain rotation and timing.';

