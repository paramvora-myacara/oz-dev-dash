import * as fs from 'fs';
import * as path from 'path';

// Import the listing data directly
import { theEdgeOnMainData } from '../src/lib/listings/the-edge-on-main';
import { soGoodDallasData } from '../src/lib/listings/sogood-dallas';
import { marshallStLouisData } from '../src/lib/listings/marshall-st-louis';
import upCampusRenoData from '../src/lib/listings/up-campus-reno';

interface ListingData {
  listingName: string;
  listingSlug: string;
  projectId: string;
  sections: any[];
  details: {
    financialReturns: any;
    propertyOverview: any;
    marketAnalysis: any;
    sponsorProfile: any;
  };
}

// Function to generate SQL insert statements
function generateSQL(listingData: ListingData): string {
  const { listingName, listingSlug, projectId, sections, details } = listingData;
  
  // Create the listing record
  const listingSQL = `
-- Insert listing: ${listingName}
INSERT INTO public.listings (slug, project_id, title, developer_entity_name, developer_ca_name, developer_ca_email) 
VALUES ('${listingSlug}', '${projectId}', '${listingName}', '${getDeveloperEntityName(listingSlug)}', '${getDeveloperCAName(listingSlug)}', '${getDeveloperCAEmail(listingSlug)}')
ON CONFLICT (slug) DO UPDATE SET 
  project_id = EXCLUDED.project_id,
  title = EXCLUDED.title,
  developer_entity_name = EXCLUDED.developer_entity_name,
  developer_ca_name = EXCLUDED.developer_ca_name,
  developer_ca_email = EXCLUDED.developer_ca_email,
  updated_at = now();`;

  // Create the version record
  const versionData = {
    listingName,
    listingSlug,
    projectId,
    sections,
    details
  };
  
  const versionSQL = `
-- Insert version for: ${listingName}
WITH listing_ref AS (
  SELECT id FROM public.listings WHERE slug = '${listingSlug}'
)
INSERT INTO public.listing_versions (listing_id, version_number, data)
SELECT listing_ref.id, 1, '${JSON.stringify(versionData).replace(/'/g, "''")}'::jsonb
FROM listing_ref
ON CONFLICT (listing_id, version_number) DO UPDATE SET
  data = EXCLUDED.data,
  published_at = now();`;

  // Update the listing to point to the current version
  const updateSQL = `
-- Set current version for: ${listingName}
UPDATE public.listings 
SET current_version_id = (
  SELECT id FROM public.listing_versions 
  WHERE listing_id = public.listings.id AND version_number = 1
)
WHERE slug = '${listingSlug}';`;

  return listingSQL + '\n' + versionSQL + '\n' + updateSQL;
}

// Helper function to get developer entity name based on listing slug
function getDeveloperEntityName(slug: string): string {
  switch (slug) {
    case 'the-edge-on-main':
      return 'ACARA OZ Fund I LLC';
    case 'sogood-dallas':
      return 'Hoque Global';
    case 'marshall-st-louis':
      return 'Aptitude Development';
    case 'up-campus-reno':
      return 'UP Campus Properties LLC';
    default:
      return 'Development Entity LLC';
  }
}

// Helper function to get developer CA name based on listing slug
function getDeveloperCAName(slug: string): string {
  switch (slug) {
    case 'the-edge-on-main':
      return 'ACARA OZ Fund I LLC';
    case 'sogood-dallas':
      return 'Hoque Global';
    case 'marshall-st-louis':
      return 'Aptitude Development';
    case 'up-campus-reno':
      return 'UP Campus Properties LLC';
    default:
      return 'Development Entity LLC';
  }
}

// Helper function to get developer CA email based on listing slug
function getDeveloperCAEmail(slug: string): string {
  switch (slug) {
    case 'the-edge-on-main':
      return 'legal@acara.com';
    case 'sogood-dallas':
      return 'legal@hoqueglobal.com';
    case 'marshall-st-louis':
      return 'legal@aptitudedevelopment.com';
    case 'up-campus-reno':
      return 'legal@upcampusproperties.com';
    default:
      return 'legal@development-entity.com';
  }
}

// Main migration function
function migrateListings() {
  console.log('Starting migration of listings to Supabase...\n');
  
  const listings: ListingData[] = [
    theEdgeOnMainData,
    soGoodDallasData,
    marshallStLouisData,
    upCampusRenoData
  ];
  
  let allSQL = `-- Migration script generated on ${new Date().toISOString()}
-- This script will migrate all listings from /lib/listings/ to Supabase
-- Run this in your Supabase SQL Editor

`;

  for (const listingData of listings) {
    try {
      console.log(`Processing ${listingData.listingName}...`);
      
      const sql = generateSQL(listingData);
      allSQL += sql + '\n\n';
      
      console.log(`✓ Successfully processed ${listingData.listingName}`);
    } catch (error) {
      console.error(`✗ Error processing ${listingData.listingName}:`, error);
    }
  }
  
  // Write the SQL file
  const outputPath = path.join(__dirname, 'migration.sql');
  fs.writeFileSync(outputPath, allSQL);
  
  console.log(`\nMigration complete! SQL file written to: ${outputPath}`);
  console.log('\nTo apply the migration:');
  console.log('1. Copy the contents of migration.sql');
  console.log('2. Paste it into your Supabase SQL Editor');
  console.log('3. Run the script');
}

// Run the migration
migrateListings(); 