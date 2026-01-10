-- Create processor_state table for tracking processor progress
-- Used by user-event-processor service to prevent duplicate notifications

CREATE TABLE IF NOT EXISTS processor_state (
  id TEXT PRIMARY KEY DEFAULT 'user_event_processor',
  last_processed_time TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_processor_state_id ON processor_state(id);

-- Add comment
COMMENT ON TABLE processor_state IS 'Tracks last processed timestamp for background processors to prevent duplicate processing';
