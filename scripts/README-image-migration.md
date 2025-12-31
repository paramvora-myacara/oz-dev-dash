# Image Migration Scripts

This directory contains scripts to migrate images from the old flat bucket structure to the new nested structure.

## Migration Overview

**Old Structure:**
```
oz-projects-images/
├── listing-slug-001/
│   ├── general/        # Hero images
│   ├── floorplan/      # Floor plan images
│   └── sitemap/        # Site map images
```

**New Structure:**
```
oz-projects-images/
├── listing-slug-001/
│   ├── general/        # Hero images (unchanged)
│   └── details/
│       └── property-overview/
│           └── floorplansitemapsection/
│               ├── floorplan/    # Floor plan images
│               └── sitemap/      # Site map images
```

## Scripts

### 1. Migration Script (`migrate-images-to-nested-structure.ts`)

**What it does:**
- Copies all existing images from old flat paths to new nested paths
- **Leaves old files in place** for safety

**Note:** Images are managed entirely through Supabase storage paths, not stored in listing_versions JSON, so no database updates are needed.

**When to run:** After deploying new code to production

**Command:**
```bash
npx tsx scripts/migrate-images-to-nested-structure.ts
```

### 2. Undo Script (`undo-image-migration.ts`)

**What it does:**
- Deletes newly copied files in nested structure
- Leaves old flat structure files intact

**Note:** Since images aren't stored in JSON, no database restoration is needed.

**When to run:** If migration causes issues and you need to rollback quickly

**Command:**
```bash
npx tsx scripts/undo-image-migration.ts
```

### 3. Cleanup Script (`cleanup-old-images.ts`)

**What it does:**
- Verifies that all new files exist
- Permanently deletes old flat structure files
- **This action is irreversible!**

**When to run:** Only after thorough testing and verification that everything works

**Command:**
```bash
npx tsx scripts/cleanup-old-images.ts
```

## Migration Process

### Phase 1: Deploy & Test
1. Deploy new code to staging
2. Test all image functionality thoroughly
3. Verify no broken images or missing content

### Phase 2: Production Migration
1. **Deploy new code to production**
2. **Run migration script:**
   ```bash
   npx tsx scripts/migrate-images-to-nested-structure.ts
   ```
3. **Test production thoroughly** for at least 24-48 hours
4. Monitor for any image loading issues

### Phase 3: Verification & Cleanup
1. **Verify everything works** for several days
2. **Run cleanup script** (irreversible):
   ```bash
   npx tsx scripts/cleanup-old-images.ts
   ```

### Phase 4: Emergency Rollback
If issues arise during testing:
1. **Run undo script immediately:**
   ```bash
   npx tsx scripts/undo-image-migration.ts
   ```
2. Fix issues in code
3. Redeploy and re-run migration

## Safety Measures

- ✅ **Zero-downtime migration** - old files remain until cleanup
- ✅ **Complete rollback capability** with undo script
- ✅ **Verification before cleanup** - checks new files exist
- ✅ **Gradual process** - test thoroughly before final cleanup

## Environment Variables Required

All scripts need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## What Gets Migrated

- ✅ Floor plan images: `listing/floorplan/*` → `listing/details/property-overview/floorplansitemapsection/floorplan/*`
- ✅ Site map images: `listing/sitemap/*` → `listing/details/property-overview/floorplansitemapsection/sitemap/*`
- ✅ General images: Stay in same location (no migration needed)

**Note:** Images are managed through Supabase storage paths only. No JSON data updates are needed.

## Monitoring

After migration, monitor:
- Image loading times
- 404 errors in logs
- User reports of missing images
- Database query performance

## Support

If migration fails or causes issues:
1. Run undo script immediately
2. Check script logs for specific errors
3. Verify environment variables
4. Check Supabase permissions and storage quotas
