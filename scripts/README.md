# Data Migration to Supabase

This script helps you migrate your listing data from the `/src/lib/listings/` folder into your Supabase database.

## Prerequisites

1. Make sure you have the Supabase schema set up (run `docs/sql/oz-schema.sql` in your Supabase SQL Editor)
2. Install dependencies: `npm install`

## Running the Migration

1. **Generate the SQL migration file:**
   ```bash
   npm run migrate
   ```

2. **Apply the migration to Supabase:**
   - Copy the contents of `scripts/migration.sql`
   - Paste it into your Supabase SQL Editor
   - Run the script

## What the Migration Does

The migration script will:

1. **Create listing records** in the `public.listings` table for each of your listings:
   - The Edge on Main
   - SoGood Dallas  
   - Marshall St. Louis
   - Up Campus Reno

2. **Create version records** in the `public.listing_versions` table with:
   - Version number 1 for each listing
   - Complete JSON data including all sections and details
   - Proper foreign key relationships

3. **Link listings to their current versions** by updating the `current_version_id` field

## Database Structure

After migration, your data will be structured as:

```
listings table:
- id (UUID, primary key)
- slug (text, unique)
- project_id (text)
- title (text)
- current_version_id (UUID, foreign key to listing_versions)

listing_versions table:
- id (UUID, primary key)
- listing_id (UUID, foreign key to listings)
- version_number (int)
- data (jsonb) - contains all your listing data
- created_at (timestamp)
- published_at (timestamp)
```

## Verifying the Migration

After running the migration, you can verify it worked by running these queries in Supabase:

```sql
-- Check all listings
SELECT * FROM public.listings;

-- Check all versions
SELECT * FROM public.listing_versions;

-- Check a specific listing with its data
SELECT 
  l.slug,
  l.title,
  lv.data
FROM public.listings l
JOIN public.listing_versions lv ON l.current_version_id = lv.id
WHERE l.slug = 'the-edge-on-main';
```

## Troubleshooting

If you encounter issues:

1. **Check the migration SQL file** - it will be generated in `scripts/migration.sql`
2. **Verify your Supabase schema** - make sure you've run the schema creation script
3. **Check for JSON parsing errors** - the script logs any issues during processing

## Next Steps

After successful migration:

1. Update your application code to read from Supabase instead of the local files
2. Consider implementing versioning controls for future updates
3. Set up proper authentication and authorization policies in Supabase 