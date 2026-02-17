-- Add updated_at column to prospect_calls
ALTER TABLE prospect_calls 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill updated_at with called_at for existing records
UPDATE prospect_calls 
SET updated_at = called_at 
WHERE updated_at IS NULL OR updated_at = called_at; -- heuristic check, mostly we want to ensure it has a value

-- Create index for sorting queue
CREATE INDEX IF NOT EXISTS idx_prospect_calls_updated_at ON prospect_calls(updated_at DESC);
