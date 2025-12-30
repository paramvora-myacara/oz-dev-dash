-- Revert seed-listings.sql script
-- This script removes all data inserted by seed-listings.sql

-- Remove admin user association first (no foreign key constraints)
DELETE FROM admin_user_listings
WHERE listing_slug = 'alden-brockton-ma';

-- Remove the current_version_id from the listing to break the foreign key constraint
UPDATE listings
SET current_version_id = NULL
WHERE slug = 'alden-brockton-ma';

-- Delete the listing version
DELETE FROM listing_versions
WHERE id = '456e7890-e89b-12d3-a456-426614174001';

-- Finally delete the listing itself
DELETE FROM listings
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- Verify the data has been removed
SELECT 'Remaining listings count:' as info, COUNT(*) as count FROM listings;
SELECT 'Remaining listing_versions count:' as info, COUNT(*) as count FROM listing_versions;
SELECT 'Remaining admin_user_listings count:' as info, COUNT(*) as count FROM admin_user_listings;
