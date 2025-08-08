# Data Migration Guide: Moving from Local Files to Supabase

This guide will help you migrate your listing data from the `/src/lib/listings/` folder into your Supabase database.

## What We've Created

1. **Migration Script** (`scripts/migrate-to-supabase.ts`) - Generates SQL from your TypeScript files
2. **SQL Migration File** (`scripts/migration.sql`) - Ready-to-run SQL for Supabase
3. **Verification Script** (`scripts/verify-migration.sql`) - Queries to verify the migration worked
4. **Documentation** (`scripts/README.md`) - Detailed instructions

## Prerequisites

1. ✅ **Supabase Schema**: Make sure you've run `docs/sql/oz-schema.sql` in your Supabase SQL Editor
2. ✅ **Dependencies**: Run `npm install` to install the required packages
3. ✅ **Migration Script**: The script has been generated and is ready to run

## Step-by-Step Migration Process

### Step 1: Generate the Migration SQL

The migration script has already been run and generated the SQL file. If you need to regenerate it:

```bash
npm run migrate
```

This creates `scripts/migration.sql` with all your listing data.

### Step 2: Apply the Migration to Supabase

1. **Copy the SQL**: Open `scripts/migration.sql` and copy all its contents
2. **Paste into Supabase**: Go to your Supabase dashboard → SQL Editor
3. **Run the script**: Paste the SQL and click "Run"

### Step 3: Verify the Migration

Run the verification queries in `scripts/verify-migration.sql` to ensure everything worked:

1. **Check listings were created**: Should show 4 listings
2. **Check versions were created**: Should show 4 version records
3. **Check data integrity**: Verify the JSON data is properly stored
4. **Check for orphaned records**: Should show 0 orphaned records

## What Gets Migrated

Your migration includes these 4 listings:

| Listing | Slug | Project ID |
|---------|------|------------|
| The Edge on Main | `the-edge-on-main` | `edge-on-main-mesa-001` |
| SoGood Dallas | `sogood-dallas` | `sogood-dallas-001` |
| The Marshall St. Louis | `marshall-st-louis` | `marshall-st-louis-001` |
| University of Nevada, Reno Student Housing | `up-campus-reno` | `up-campus-reno-001` |

## Database Structure After Migration

```
listings table:
├── id (UUID, primary key)
├── slug (text, unique) 
├── project_id (text)
├── title (text)
├── current_version_id (UUID, foreign key)
├── created_at (timestamp)
└── updated_at (timestamp)

listing_versions table:
├── id (UUID, primary key)
├── listing_id (UUID, foreign key to listings)
├── version_number (int)
├── data (jsonb) - contains all your listing data
├── created_at (timestamp)
└── published_at (timestamp)
```

## Data Structure in JSONB

Each listing's data is stored as JSONB with this structure:

```json
{
  "listingName": "The Edge on Main",
  "listingSlug": "the-edge-on-main", 
  "projectId": "edge-on-main-mesa-001",
  "sections": [
    // All your hero, ticker metrics, compelling reasons, etc.
  ],
  "details": {
    "financialReturns": {
      "pageTitle": "...",
      "pageSubtitle": "...",
      "backgroundImages": [],
      "sections": [...]
    },
    "propertyOverview": { ... },
    "marketAnalysis": { ... },
    "sponsorProfile": { ... }
  }
}
```

## Next Steps After Migration

1. **Update your application code** to read from Supabase instead of local files
2. **Test the new data source** by updating your API routes
3. **Consider implementing versioning controls** for future updates
4. **Set up proper authentication and authorization** policies in Supabase

## Troubleshooting

### Common Issues

1. **"Table doesn't exist"**: Make sure you've run the schema creation script first
2. **"JSON parsing errors"**: Check that the migration script ran without errors
3. **"Foreign key constraint violations"**: The migration script handles this automatically

### Verification Queries

Run these in Supabase to verify everything worked:

```sql
-- Should return 4 listings
SELECT COUNT(*) FROM public.listings;

-- Should return 4 versions  
SELECT COUNT(*) FROM public.listing_versions;

-- Should return 4 linked records
SELECT COUNT(*) 
FROM public.listings l
JOIN public.listing_versions lv ON l.current_version_id = lv.id;
```

## Files Created

- `scripts/migrate-to-supabase.ts` - Migration script
- `scripts/migration.sql` - Generated SQL (ready to run)
- `scripts/verify-migration.sql` - Verification queries
- `scripts/README.md` - Detailed documentation
- `MIGRATION_GUIDE.md` - This guide

## Support

If you encounter any issues:

1. Check the console output from `npm run migrate`
2. Verify your Supabase schema is set up correctly
3. Run the verification queries to identify specific problems
4. Check the generated SQL file for any obvious issues

The migration preserves all your data structure and relationships while moving it into a proper database format that supports versioning and better scalability. 