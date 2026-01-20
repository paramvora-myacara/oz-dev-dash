-- Migration: Convert oz_projects.created_at from text to timestamptz
-- Existing values will be set to NULL, new inserts will default to NOW()

-- Step 1: Add a new column with the correct type
ALTER TABLE oz_projects 
ADD COLUMN created_at_new TIMESTAMPTZ;

-- Step 2: Drop the old text column
ALTER TABLE oz_projects 
DROP COLUMN created_at;

-- Step 3: Rename the new column to the original name
ALTER TABLE oz_projects 
RENAME COLUMN created_at_new TO created_at;

-- Step 4: Set default for future inserts
ALTER TABLE oz_projects 
ALTER COLUMN created_at SET DEFAULT NOW();
