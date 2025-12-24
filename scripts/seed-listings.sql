-- Custom seed data for listings - run this after db reset
-- Sample listings for testing DDV functionality

-- Insert listing first without current_version_id to avoid circular dependency
INSERT INTO listings (id, slug, title, has_vault, developer_entity_name, developer_ca_name, created_at, updated_at) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'alden-brockton-ma', 'Alden Brockton MA Development', true, 'Alden Development Corp', 'John Smith', NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  has_vault = EXCLUDED.has_vault,
  developer_entity_name = EXCLUDED.developer_entity_name,
  developer_ca_name = EXCLUDED.developer_ca_name,
  updated_at = NOW();

-- Add sample listing version for the Alden Brockton MA listing
INSERT INTO listing_versions (id, listing_id, version_number, data, created_at, published_at, news_links) VALUES
  ('456e7890-e89b-12d3-a456-426614174001',
   '123e4567-e89b-12d3-a456-426614174000',
   1,
   '{
     "title": "Alden Brockton MA Development",
     "description": "A premier multifamily development project in Brockton, MA featuring modern amenities and sustainable design.",
     "location": {
       "address": "117 North Main Street, Brockton, MA",
       "city": "Brockton",
       "state": "MA",
       "coordinates": {"lat": 42.0834, "lng": -71.0184}
     },
     "projectDetails": {
       "propertyType": "Multifamily",
       "unitCount": 150,
       "squareFootage": 125000,
       "yearBuilt": 2024
     },
     "financials": {
       "totalInvestment": 25000000,
       "minimumInvestment": 50000,
       "targetIRR": 12.5,
       "projectedHoldPeriod": 7
     },
     "developer": {
       "entityName": "Alden Development Corp",
       "contactName": "John Smith",
       "contactEmail": "john.smith@aldendevelopment.com",
       "website": "https://aldendevelopment.com"
     },
     "images": {
       "general": ["alden-brockton-ma-001/general/img-1.jpeg"],
       "floorplan": ["alden-brockton-ma-001/floorplan/img-9.jpeg", "alden-brockton-ma-001/floorplan/img-10.jpeg", "alden-brockton-ma-001/floorplan/img-11.jpeg"],
       "sitemap": ["alden-brockton-ma-001/sitemap/img-2.jpeg"]
     },
     "status": "Development",
     "hasVault": true
   }'::jsonb,
   NOW(),
   NOW(),
   ARRAY[]::jsonb[])
ON CONFLICT (listing_id, version_number) DO UPDATE SET
  data = EXCLUDED.data,
  published_at = NOW();

-- Update the listing to set the current_version_id after the listing_version exists
UPDATE listings SET current_version_id = '456e7890-e89b-12d3-a456-426614174001' WHERE slug = 'alden-brockton-ma';

-- Associate admin user with the listing for management access
INSERT INTO admin_user_listings (user_id, listing_slug) VALUES
  ((SELECT id FROM admin_users WHERE email = 'aryan@ozlistings.com' LIMIT 1), 'alden-brockton-ma')
ON CONFLICT (user_id, listing_slug) DO NOTHING;
