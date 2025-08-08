-- Run this in Supabase SQL Editor
-- Core content tables
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  project_id text,
  title text,
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_versions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  version_number int not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  published_at timestamptz not null default now()
);

create unique index if not exists listing_versions_unique_version on public.listing_versions(listing_id, version_number);
create index if not exists listing_versions_listing_id_idx on public.listing_versions(listing_id);

alter table public.listings
  add constraint listings_current_version_fkey
  foreign key (current_version_id) references public.listing_versions(id) on delete set null;

-- Admin users and permissions (plaintext passwords by request; do not use in production)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_user_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_users(id) on delete cascade,
  listing_slug text not null,
  unique (user_id, listing_slug)
);

-- Domains mapping for canonical hosts per listing
create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  hostname text unique not null,
  listing_slug text not null,
  created_at timestamptz not null default now()
);

-- If you prefer direct table access, uncomment simplified policies:
-- create policy versions_select on public.listing_versions
--   for select using (true);
-- create policy listings_select on public.listings for select using (true);

-- Seed example (optional)
-- insert into public.listings (slug, project_id, title) values ('the-edge-on-main','edge-on-main-mesa-001','The Edge on Main') on conflict do nothing;
-- with base as (
--   select id from public.listings where slug = 'the-edge-on-main'
-- )
-- insert into public.listing_versions (listing_id, version_number, data)
-- select base.id, 1, '{"listingName":"The Edge on Main", "listingSlug":"the-edge-on-main", "projectId":"edge-on-main-mesa-001", "sections":[], "details": {"financialReturns": {"pageTitle":"","pageSubtitle":"","backgroundImages":[],"sections":[]}, "propertyOverview": {"pageTitle":"","pageSubtitle":"","backgroundImages":[],"sections":[]}, "marketAnalysis": {"pageTitle":"","pageSubtitle":"","backgroundImages":[],"sections":[]}, "sponsorProfile": {"sponsorName":"","sections":[]}}}'::jsonb
-- from base
-- on conflict do nothing; 