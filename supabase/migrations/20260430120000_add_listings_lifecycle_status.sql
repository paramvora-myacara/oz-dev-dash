-- Listing workflow: draft → in_review → live (authoritative for UX; keep in sync with current_version_id on publish).

DO $create_enum$
BEGIN
  CREATE TYPE listing_lifecycle_status AS ENUM ('draft', 'in_review', 'live');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$create_enum$;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS lifecycle_status listing_lifecycle_status NOT NULL DEFAULT 'draft';

COMMENT ON COLUMN public.listings.lifecycle_status IS 'Developer/internal workflow: draft, in_review (submitted for build), live (published). Must be live iff current_version_id is set.';

UPDATE public.listings
SET lifecycle_status = 'live'
WHERE current_version_id IS NOT NULL;

UPDATE public.listings
SET lifecycle_status = 'draft'
WHERE current_version_id IS NULL;
