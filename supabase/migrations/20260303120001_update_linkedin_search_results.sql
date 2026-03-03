-- Migration to adapt linkedin_search_results for consolidated CRM use
-- Removes legacy call-related links and focuses on people

-- 1. Drop dependent indexes first
DROP INDEX IF EXISTS idx_linkedin_search_results_call_log;
DROP INDEX IF EXISTS idx_linkedin_search_results_prospect_phone;

-- 2. Drop the legacy columns
ALTER TABLE linkedin_search_results 
  DROP COLUMN IF EXISTS prospect_phone_id,
  DROP COLUMN IF EXISTS call_log_id;

-- 3. Ensure person_id exists and is indexed
ALTER TABLE linkedin_search_results
  ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_linkedin_search_results_person ON linkedin_search_results(person_id);

