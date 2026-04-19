-- Speed up campaign summary engagement queries filtering by type + metadata campaign_id
CREATE INDEX IF NOT EXISTS idx_activities_type_metadata_campaign_id
  ON public.activities (type, ((metadata->>'campaign_id')))
  WHERE type IN ('email_opened', 'email_clicked');
