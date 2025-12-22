-- Add subject_prompt column to campaigns to store last-used AI subject prompt
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS subject_prompt text;