-- Remove redundant step-specific and unused fields from campaigns table
-- These are now stored in campaign_steps or no longer needed

ALTER TABLE campaigns
DROP COLUMN IF EXISTS subject_line,
DROP COLUMN IF EXISTS subject_prompt,
DROP COLUMN IF EXISTS sections,
DROP COLUMN IF EXISTS template_slug;

-- Note: Keeping email_format and sender for now as they might still be used
-- Note: sections column was already removed but keeping this for completeness
