-- Add expiration fields for linkedin_profiles so stale URLs can be excluded
ALTER TABLE public.linkedin_profiles
  ADD COLUMN IF NOT EXISTS is_expired boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS expired_at timestamptz,
  ADD COLUMN IF NOT EXISTS expired_by text,
  ADD COLUMN IF NOT EXISTS expired_reason text;

CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_is_expired
  ON public.linkedin_profiles(is_expired);

