-- Migration script to add developer_ca_email and developer_ca_name fields
-- Run this in Supabase SQL Editor after running the main schema

-- Add the new columns if they don't exist
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS developer_ca_email text;

ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS developer_ca_name text;

-- Update existing listings with developer CA information
UPDATE public.listings 
SET 
  developer_ca_name = 'ACARA OZ Fund I LLC',
  developer_ca_email = 'legal@acara.com'
WHERE slug = 'the-edge-on-main';

UPDATE public.listings 
SET 
  developer_ca_name = 'Hoque Global',
  developer_ca_email = 'legal@hoqueglobal.com'
WHERE slug = 'sogood-dallas';

UPDATE public.listings 
SET 
  developer_ca_name = 'Aptitude Development',
  developer_ca_email = 'legal@aptitudedevelopment.com'
WHERE slug = 'marshall-st-louis';

UPDATE public.listings 
SET 
  developer_ca_name = 'UP Campus Properties LLC',
  developer_ca_email = 'legal@upcampusproperties.com'
WHERE slug = 'up-campus-reno';

-- Verify the updates
SELECT slug, title, developer_entity_name, developer_ca_name, developer_ca_email
FROM public.listings 
ORDER BY slug; 