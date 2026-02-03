# Prospect Phones Migration Guide

This guide explains how to migrate from the property-centric prospects model to the phone-first prospect_phones model.

## Overview

**Old Model:**
- `prospects` table: one row per property, with `phone_numbers` JSONB array
- `prospect_calls` references `prospect_id`

**New Model:**
- `prospect_phones` table: one row per (property, phone) with status on the phone
- `prospect_calls` has `prospect_phone_id` linking to the specific phone

## Prerequisites

1. **Apply the database migration:**
   ```bash
   supabase db push
   # Or: supabase migration up
   ```
   This creates the `prospect_phones` table and adds `prospect_phone_id` to `prospect_calls`.

2. **Environment variables** (in `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Migration Steps

### Step 1: Run the Data Migration Script

```bash
npm run migrate-prospects-to-phones
# Or: npx tsx scripts/migrate_prospects_to_phones.ts
```

This script:
1. Extracts phone numbers from `prospects.phone_numbers` into `prospect_phones`
2. Deduplicates by (prospect_id, phone_number) - merges labels when same person has multiple roles
3. Links existing `prospect_calls` to `prospect_phones` via `prospect_phone_id`

### Step 2: Verify

- Check that `prospect_phones` has rows
- Check that `prospect_calls` has `prospect_phone_id` set for existing calls

## Future Imports

After migration, the import script (`import_prospects.ts`) still writes to `prospects` with `phone_numbers`. To sync new imports to `prospect_phones`, run the migration script again after importing. Alternatively, update the import script to insert into `prospect_phones` directly.
