-- Migration: Remove legacy delay_seconds field
-- This field is no longer used for scheduling as we've moved to a more robust domain-based timing system.

ALTER TABLE email_queue DROP COLUMN IF EXISTS delay_seconds;
