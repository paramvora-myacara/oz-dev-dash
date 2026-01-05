-- Migration: Add thread_id for reliable email threading
-- This provides a UUID anchor for Message-ID headers without breaking existing int PKs

ALTER TABLE email_queue 
ADD COLUMN IF NOT EXISTS thread_id UUID DEFAULT gen_random_uuid();

-- Create index for matching
CREATE INDEX IF NOT EXISTS idx_email_queue_thread_id ON email_queue(thread_id);
