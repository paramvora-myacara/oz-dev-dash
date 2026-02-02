-- Migration to consolidate email status into prospect_calls table

-- 1. Add columns to prospect_calls
ALTER TABLE prospect_calls 
ADD COLUMN IF NOT EXISTS email_status TEXT,
ADD COLUMN IF NOT EXISTS email_error TEXT,
ADD COLUMN IF NOT EXISTS email_template TEXT,
ADD COLUMN IF NOT EXISTS email_message_id TEXT;

