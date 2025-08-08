-- Verification queries to check your migration
-- Run these in your Supabase SQL Editor after running the migration

-- 1. Check all listings were created
SELECT 
  id,
  slug,
  project_id,
  title,
  current_version_id IS NOT NULL as has_version
FROM public.listings
ORDER BY created_at;

-- 2. Check all versions were created
SELECT 
  lv.id,
  l.slug,
  lv.version_number,
  lv.created_at,
  lv.published_at
FROM public.listing_versions lv
JOIN public.listings l ON lv.listing_id = l.id
ORDER BY l.slug, lv.version_number;

-- 3. Check that listings are properly linked to their versions
SELECT 
  l.slug,
  l.title,
  lv.version_number,
  lv.data->>'listingName' as data_listing_name,
  lv.data->>'listingSlug' as data_slug
FROM public.listings l
JOIN public.listing_versions lv ON l.current_version_id = lv.id
ORDER BY l.slug;

-- 4. Check the structure of one listing's data (replace 'the-edge-on-main' with any slug)
SELECT 
  l.slug,
  lv.data->'sections' as sections,
  lv.data->'details'->'financialReturns'->'pageTitle' as financial_returns_title,
  lv.data->'details'->'propertyOverview'->'pageTitle' as property_overview_title,
  lv.data->'details'->'marketAnalysis'->'pageTitle' as market_analysis_title,
  lv.data->'details'->'sponsorProfile'->'sponsorName' as sponsor_name
FROM public.listings l
JOIN public.listing_versions lv ON l.current_version_id = lv.id
WHERE l.slug = 'the-edge-on-main';

-- 5. Count total records
SELECT 
  'listings' as table_name,
  COUNT(*) as record_count
FROM public.listings
UNION ALL
SELECT 
  'listing_versions' as table_name,
  COUNT(*) as record_count
FROM public.listing_versions;

-- 6. Check for any orphaned records
SELECT 
  'listings without versions' as issue,
  COUNT(*) as count
FROM public.listings l
LEFT JOIN public.listing_versions lv ON l.current_version_id = lv.id
WHERE lv.id IS NULL
UNION ALL
SELECT 
  'versions without listings' as issue,
  COUNT(*) as count
FROM public.listing_versions lv
LEFT JOIN public.listings l ON lv.listing_id = l.id
WHERE l.id IS NULL; 