-- Create admin_events table for operational alerts
create table if not exists public.admin_events (
    id uuid default gen_random_uuid() primary key,
    event_type text not null,
    payload jsonb default '{}'::jsonb,
    status text default 'pending', -- 'pending', 'processed', 'failed'
    processed_at timestamptz,
    error text,
    created_at timestamptz default now() not null
);

-- Index for efficient polling of pending events
create index if not exists idx_admin_events_status_created_at
    on public.admin_events(status, created_at)
    where status = 'pending';


