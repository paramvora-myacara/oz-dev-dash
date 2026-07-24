-- generation-ux-plan §6.5 / §10.8
--
-- `oz_projects.project_slug` is the ONLY link between the marketplace and the
-- `listings` table (string equality, no FK). It has been plain nullable text
-- with no uniqueness, and the hand-run seed scripts in
-- supabase/oz_projects_inserts/ explicitly warn:
--   "No unique on project_slug; re-running inserts new rows."
--
-- Before the go-live upsert can be safe, project_slug must be unique + NOT NULL.
--
-- ⚠️ RUN THE AUDIT QUERY BELOW FIRST AND LOOK AT THE RESULTS. The de-dupe keeps
-- an arbitrary row per slug (lowest ctid); if duplicates differ in content you
-- want to choose deliberately rather than let ctid order decide.
--
--   SELECT project_slug, COUNT(*), array_agg(project_id)
--   FROM public.oz_projects
--   GROUP BY project_slug
--   HAVING COUNT(*) > 1;
--
--   SELECT project_id, project_slug FROM public.oz_projects
--   WHERE project_slug IS NULL;

BEGIN;

-- 1. Normalize: trim/lowercase so string equality with listings.slug holds.
UPDATE public.oz_projects
SET project_slug = lower(btrim(project_slug))
WHERE project_slug IS NOT NULL
  AND project_slug <> lower(btrim(project_slug));

-- 2. De-dupe, keeping the physically-first row per slug.
DELETE FROM public.oz_projects a
USING public.oz_projects b
WHERE a.ctid < b.ctid
  AND a.project_slug IS NOT NULL
  AND a.project_slug = b.project_slug;

-- 3. Drop rows with no slug at all — they can never join to a listing and
--    render as cards linking nowhere.
DELETE FROM public.oz_projects WHERE project_slug IS NULL;

-- 4. Constraints. No FK to listings(slug) by design: the delete route already
--    cleans up oz_projects explicitly, and an FK would prevent managing
--    marketplace rows independently of listings.
ALTER TABLE public.oz_projects
  ALTER COLUMN project_slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS oz_projects_project_slug_key
  ON public.oz_projects (project_slug);

COMMIT;

COMMENT ON INDEX public.oz_projects_project_slug_key IS
  'Join key to listings.slug. Required for idempotent upsert at go-live (generation-ux-plan §6.5).';
