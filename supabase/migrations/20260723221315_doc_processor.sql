-- Doc processor: listing generation jobs + image classification records.
-- See ozl-backend/docs/doc-processor-productionization-plan.md (§2.2).

create table if not exists listing_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  listing_slug text not null,
  status text not null default 'queued',
    -- queued | ingesting | converting | classifying_docs | extracting
    -- | classifying_images | publishing | complete | failed
  dry_run boolean not null default false,
  agent_filter text,                  -- set for single-agent regen runs
  claimed_at timestamptz,
  heartbeat_at timestamptz,
  attempt int not null default 0,
  stage_progress jsonb not null default '{}'::jsonb,
  timings jsonb not null default '{}'::jsonb,
  version_id uuid,                    -- listing_versions row produced
  pointer_updated boolean,            -- did publish repoint current_version_id? (§2.5)
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Resubmit lockout: at most one non-terminal job per listing (plan §0/§2.3).
create unique index if not exists one_active_job_per_listing
  on listing_generation_jobs (listing_id)
  where status not in ('complete', 'failed');

create index if not exists listing_generation_jobs_slug_idx
  on listing_generation_jobs (listing_slug, created_at desc);

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references listing_generation_jobs(id) on delete set null,
  listing_slug text not null,
  storage_path text not null,        -- final path in oz-projects-images
  category text not null,            -- taxonomy key (pipeline/image_taxonomy.py)
  target_entity text,                -- member/project slug for per-entity folders
  confidence real,
  hero_quality int,
  caption text,
  reasoning text,
  taxonomy_version text,
  source_file text,
  source_page int,
  status text not null default 'auto',  -- auto | confirmed | moved | discarded
  created_at timestamptz not null default now()
);

create index if not exists listing_images_slug_idx
  on listing_images (listing_slug);

-- updated_at maintenance (function already exists in remote schema; replace is idempotent)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists listing_generation_jobs_updated_at on listing_generation_jobs;
create trigger listing_generation_jobs_updated_at
  before update on listing_generation_jobs
  for each row execute function set_updated_at();

-- Private artifacts bucket (idempotent). Storage API also works; this is the SQL route.
insert into storage.buckets (id, name, public)
values ('doc-processor-artifacts', 'doc-processor-artifacts', false)
on conflict (id) do nothing;
