-- Update linkedin_automation_status enum with new statuses
ALTER TYPE linkedin_automation_status RENAME TO linkedin_automation_status_old;

CREATE TYPE linkedin_automation_status AS ENUM (
  'search_pending',
  'searching',
  'search_complete',
  'search_failed',
  'connection_pending',
  'connecting',
  'invited',
  'failed'
);

-- Update the column to use the new enum
ALTER TABLE prospect_calls 
  ALTER COLUMN linkedin_status TYPE linkedin_automation_status 
  USING linkedin_status::text::linkedin_automation_status;

-- Drop the old enum
DROP TYPE linkedin_automation_status_old;

-- Create linkedin_search_results table
CREATE TABLE IF NOT EXISTS linkedin_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_phone_id UUID NOT NULL REFERENCES prospect_phones(id) ON DELETE CASCADE,
  call_log_id UUID NOT NULL REFERENCES prospect_calls(id) ON DELETE CASCADE,
  profile_url TEXT NOT NULL,
  profile_name TEXT,
  profile_title TEXT,
  profile_company TEXT,
  profile_location TEXT,
  profile_image_url TEXT,
  search_query TEXT NOT NULL,
  rank INTEGER NOT NULL,
  selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_linkedin_search_results_call_log 
  ON linkedin_search_results(call_log_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_search_results_prospect_phone 
  ON linkedin_search_results(prospect_phone_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_search_results_selected 
  ON linkedin_search_results(call_log_id, selected) 
  WHERE selected = TRUE;

-- Add RLS policies
ALTER TABLE linkedin_search_results ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service role has full access" ON linkedin_search_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read their own results
-- (We'll need to join through prospect_calls to check ownership)
CREATE POLICY "Users can read their own search results" ON linkedin_search_results
  FOR SELECT
  TO authenticated
  USING (
    prospect_phone_id IN (
      SELECT id FROM prospect_phones 
      WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE linkedin_search_results IS 'LinkedIn profile search results for each prospect call';
COMMENT ON COLUMN linkedin_search_results.rank IS 'Search result position (1-based)';
COMMENT ON COLUMN linkedin_search_results.selected IS 'Whether this profile was selected by the user for connection';
