const fs = require('fs');
const path = require('path');

// Function to read and parse TypeScript files
function extractListingData(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the export const data
  const exportMatch = content.match(/export const (\w+)Data: Listing = ({[\s\S]*?});/);
  if (!exportMatch) {
    throw new Error(`Could not find listing data in ${filePath}`);
  }
  
  const dataString = exportMatch[2];
  
  // Simple JSON parsing (this is a basic approach - you might need to handle more complex cases)
  try {
    // Remove TypeScript type annotations and comments
    let cleanData = dataString
      .replace(/\/\/.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/:\s*[A-Za-z<>\[\]{}|&, ]+/g, ':') // Remove type annotations
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    // Handle the sections array and details object
    const sectionsMatch = cleanData.match(/sections:\s*\[([\s\S]*?)\]/);
    const detailsMatch = cleanData.match(/details:\s*({[\s\S]*?})/);
    
    if (sectionsMatch) {
      cleanData = cleanData.replace(sectionsMatch[0], 'sections: []');
    }
    
    if (detailsMatch) {
      cleanData = cleanData.replace(detailsMatch[0], 'details: {}');
    }
    
    const parsed = eval(`(${cleanData})`);
    
    // Now add back the sections and details
    if (sectionsMatch) {
      const sectionsData = eval(`([${sectionsMatch[1]}])`);
      parsed.sections = sectionsData;
    }
    
    if (detailsMatch) {
      const detailsData = eval(`(${detailsMatch[1]})`);
      parsed.details = detailsData;
    }
    
    return parsed;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    throw error;
  }
}

// Function to generate SQL insert statements
function generateSQL(listingData) {
  const { listingName, listingSlug, projectId, sections, details } = listingData;
  
  // Create the listing record
  const listingSQL = `
-- Insert listing: ${listingName}
INSERT INTO public.listings (slug, project_id, title) 
VALUES ('${listingSlug}', '${projectId}', '${listingName}')
ON CONFLICT (slug) DO UPDATE SET 
  project_id = EXCLUDED.project_id,
  title = EXCLUDED.title,
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

// Main migration function
function migrateListings() {
  const listingsDir = path.join(__dirname, '../src/lib/listings');
  const files = fs.readdirSync(listingsDir).filter(file => file.endsWith('.ts'));
  
  console.log('Starting migration of listings to Supabase...\n');
  
  let allSQL = `-- Migration script generated on ${new Date().toISOString()}
-- This script will migrate all listings from /lib/listings/ to Supabase
-- Run this in your Supabase SQL Editor

`;

  for (const file of files) {
    try {
      const filePath = path.join(listingsDir, file);
      console.log(`Processing ${file}...`);
      
      const listingData = extractListingData(filePath);
      const sql = generateSQL(listingData);
      
      allSQL += sql + '\n\n';
      
      console.log(`✓ Successfully processed ${listingData.listingName}`);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
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