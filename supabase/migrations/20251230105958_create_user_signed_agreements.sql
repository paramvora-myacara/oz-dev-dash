-- Create user_signed_agreements table to track CA signings
-- Replaces localStorage-based tracking with persistent database storage

CREATE TABLE IF NOT EXISTS public.user_signed_agreements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_slug text not null references public.listings(slug) on delete cascade,
  signed_at timestamptz not null default now(),

  -- User's information at time of signing
  full_name text not null,
  email text not null,

  unique(user_id, listing_slug)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_signed_agreements_user_id ON user_signed_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_signed_agreements_listing_slug ON user_signed_agreements(listing_slug);
CREATE INDEX IF NOT EXISTS idx_user_signed_agreements_signed_at ON user_signed_agreements(signed_at desc);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_signed_agreements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own signing records
CREATE POLICY "Users can view their own signed agreements" ON public.user_signed_agreements
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only authenticated users can insert (via our API)
CREATE POLICY "Allow authenticated users to insert agreements" ON public.user_signed_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
