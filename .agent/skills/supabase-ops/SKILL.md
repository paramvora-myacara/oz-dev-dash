---
name: supabase-ops
description: Specialized workflows for Supabase database operations, including production data dumping, local sandbox seeding, and managing auth schema restores.
---

# Supabase Operations Skill

Use this skill when performing advanced database maintenance, migrations, or setting up local sandboxes with production data.

## Core Workflows

### 1. Creating a Local Sandbox from Production Data
To create a local testing environment that mirrors production data (specifically for CRM/Identity migrations):

#### Step A: Dump Auth Data
Dumping the `auth` schema separately ensures proper handling of Supabase's internal identity tables.
```bash
npx supabase db dump --data-only \
  --db-url "[YOUR_PROD_DB_URL]" \
  --schema auth \
  -f supabase/seed_auth.sql
```

#### Step B: Dump Public Data (with Exclusions)
Exclude large, irrelevant tables (logs, versions, analytics) to keep the dump manageable.
```bash
npx supabase db dump --data-only \
  --db-url "[YOUR_PROD_DB_URL]" \
  --schema public \
  -x public.listings \
  -x public.listing_versions \
  -x public.email_queue \
  -x public.user_events \
  -x public.linkedin_search_results \
  -x public.oz_projects \
  -x public.oz_webinars \
  -x public.ozzie_user_profiles \
  -x public.user_attribution \
  -x public.developer_profiles \
  -x public.investor_profiles \
  -x public.user_interests \
  -x public.webinar_users \
  -x public.domains \
  -x public.user_signed_agreements \
  -x public.subscription_plans \
  -x public.subscriptions \
  -x public.payments \
  -x public.processor_state \
  -x public.admin_user_listings \
  -x public.investor_staging \
  -x public.temp_contacts_update \
  -f supabase/seed_public.sql
```

#### Step C: Reset Local Database
This wipes the local DB and reapplies all migrations from `supabase/migrations`.
```bash
npx supabase db reset
```

#### Step D: Restore via Direct PSQL
Skip the standard `supabase/seed.sql` runner for large dumps. Use the local `postgres` superuser connection directly to bypass permission issues with `DISABLE TRIGGER ALL` (required for circular FKs like campaigns/campaign_steps).
```bash
# Restore auth first to maintain FK integrity
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" < supabase/seed_auth.sql
# Restore public data
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" < supabase/seed_public.sql
```

## Troubleshooting & Best Practices

- **Circular Dependencies**: `pg_dump` will warn about circular FKs (e.g., `campaigns` <-> `campaign_steps`). This is safe to ignore as long as you use the `psql` restore method which can successfully execute the `DISABLE TRIGGER ALL` commands included in the dump.
- **Permission Denied (Seed)**: If `supabase db reset` fails during seeding with "must be owner of table" or "system trigger" errors, it's because the Supabase seed runner has limited privileges. Switch to the direct `psql` restore method mentioned in Step D.
- **Generated Columns**: `pg_dump --column-inserts` usually handles generated columns correctly, but verify that `GENERATED ALWAYS` columns are not being explicitly inserted if errors occur.
- **Auth Trigger Side-Effects**: Restoring `auth.users` will likely trigger any `AFTER INSERT` triggers (like `handle_new_user`). Ensure these triggers use `ON CONFLICT` or that you restore `auth` before `public` to handle potential duplication.
