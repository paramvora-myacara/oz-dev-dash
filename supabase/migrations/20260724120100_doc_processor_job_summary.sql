-- generation-ux-plan §5: persist an archival summary per job.
--
-- Live streamed partials are ephemeral by nature — fine, they're a live
-- effect. But the generation panel is now permanent and re-expandable, so a
-- page reload must be able to reconstruct a faithful audit trail: what each
-- section ended up saying, and how many images landed in each category.
--
-- stage_progress carries live file/agent state; this carries the settled
-- result that survives the job.

ALTER TABLE public.listing_generation_jobs
  ADD COLUMN IF NOT EXISTS summary jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.listing_generation_jobs.summary IS
  'Archival per-job summary: {sections: {agent: {sectionType, preview}}, categories: {category: count}}. Written at completion (generation-ux-plan §5).';
