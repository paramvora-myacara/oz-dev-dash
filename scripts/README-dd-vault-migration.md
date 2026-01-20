# DDV Vault Migration Guide

This guide explains how to migrate Due Diligence Vault files from the old per-listing bucket structure to the new unified bucket structure.

## Overview

**Old Structure:**
- Each listing had its own bucket: `ddv-{slug}`
- Files stored directly in bucket root: `ddv-{slug}/filename.pdf`

**New Structure:**
- Single unified bucket: `ddv-vault`
- Files organized by listing ID: `ddv-vault/{listingId}/filename.pdf`

## Prerequisites

1. **Run the database migration first:**
   ```bash
   # Apply the migration that creates the ddv-vault bucket
   supabase db push
   # Or manually run: supabase/migrations/20260117152000_create_ddv_vault_bucket.sql
   ```

2. **Ensure environment variables are set:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Migration Steps

### Step 1: Run the Migration Script

```bash
cd /path/to/oz-dev-dash
npx tsx scripts/migrate-dd-vault-to-unified-bucket.ts
```

The script will:
- Find all existing `ddv-*` buckets
- Look up listing IDs for each slug
- Copy all files to `ddv-vault/{listingId}/filename.pdf`
- Leave old buckets intact for safety
- Provide a detailed summary

### Step 2: Verify Migration

1. **Check the migration summary** - ensure all files were migrated successfully
2. **Test file access** - visit `/{slug}/access-dd-vault` for each listing
3. **Verify downloads** - test downloading files from the new structure
4. **Check file counts** - ensure file counts match between old and new locations

### Step 3: Cleanup (After Verification)

Once you've verified everything works correctly, you can delete the old buckets:

**Option A: Manual cleanup via Supabase Dashboard**
- Go to Storage → Buckets
- Delete each `ddv-{slug}` bucket manually

**Option B: SQL cleanup script** (create if needed)
```sql
-- Delete old DDV buckets (run after verification)
DELETE FROM storage.buckets 
WHERE name LIKE 'ddv-%' AND name != 'ddv-vault';
```

## What Gets Migrated

- All files from buckets matching `ddv-*` pattern
- Files are copied (not moved) - originals remain until cleanup
- File metadata (size, mimetype, etc.) is preserved

## Troubleshooting

### "Target bucket does not exist"
- Run the database migration first: `20260117152000_create_ddv_vault_bucket.sql`

### "Listing ID not found for slug"
- The script will skip buckets where the listing doesn't exist
- Check your database to ensure all listings are properly set up

### "Failed to copy file"
- Check file permissions
- Verify service role key has proper access
- Check Supabase storage quotas/limits

## Rollback

If you need to rollback:
1. Old buckets are still intact (files weren't deleted)
2. Revert code changes to use old bucket structure
3. Files will be accessible from old locations

## Notes

- The migration script is **idempotent** - safe to run multiple times
- Files in the new location will be overwritten if they already exist (upsert mode)
- Old buckets are NOT deleted automatically - manual cleanup required after verification
