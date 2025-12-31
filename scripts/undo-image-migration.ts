#!/usr/bin/env npx tsx

/**
 * Undo Script: Reverse image migration changes
 *
 * This script reverses the effects of the migration script:
 * 1. Deletes newly created files in nested structure
 *
 * Note: Images are not stored in listing_versions JSON, so no JSON restoration needed.
 *
 * Run this if migration causes issues and you need to rollback quickly.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars: { [key: string]: string } = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        // Remove quotes if present
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value;
      }
    }
  });

  return envVars;
}

const envVars = loadEnvFile();
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BUCKET_NAME = 'oz-projects-images';

interface Listing {
  id: string;
  slug: string;
}


/**
 * Get all listings from the database
 */
async function getAllListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('id, slug');

  if (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }

  return data || [];
}


/**
 * List all files in a Supabase storage folder
 */
async function listStorageFiles(folderPath: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folderPath, { limit: 1000 });

  if (error) {
    // If folder doesn't exist, return empty array
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return [];
    }
    throw new Error(`Failed to list files in ${folderPath}: ${error.message}`);
  }

  return (data || []).map(file => file.name).filter(name => name);
}

/**
 * Delete a file from Supabase storage
 */
async function deleteStorageFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete ${filePath}: ${error.message}`);
  }

  console.log(`✓ Deleted ${filePath}`);
}


/**
 * Undo migration for a single listing
 */
async function undoListingMigration(listing: Listing): Promise<void> {
  console.log(`\n🔄 Undoing migration for listing: ${listing.slug}`);

  const projectId = `${listing.slug}-001`;

  try {
    let deletedCount = 0;

    // Delete migrated floorplan images
    const newFloorplanFiles = await listStorageFiles(`${projectId}/details/property-overview/floorplansitemapsection/floorplan`);
    if (newFloorplanFiles.length > 0) {
      console.log(`🗑️  Deleting ${newFloorplanFiles.length} migrated floorplan images...`);
      for (const filename of newFloorplanFiles) {
        const newPath = `${projectId}/details/property-overview/floorplansitemapsection/floorplan/${filename}`;
        await deleteStorageFile(newPath);
        deletedCount++;
      }
    }

    // Delete migrated sitemap images
    const newSitemapFiles = await listStorageFiles(`${projectId}/details/property-overview/floorplansitemapsection/sitemap`);
    if (newSitemapFiles.length > 0) {
      console.log(`🗑️  Deleting ${newSitemapFiles.length} migrated sitemap images...`);
      for (const filename of newSitemapFiles) {
        const newPath = `${projectId}/details/property-overview/floorplansitemapsection/sitemap/${filename}`;
        await deleteStorageFile(newPath);
        deletedCount++;
      }
    }

    if (deletedCount === 0) {
      console.log(`ℹ️  No migrated images to undo for ${listing.slug}`);
    } else {
      console.log(`✅ Deleted ${deletedCount} migrated images for ${listing.slug}`);
    }

  } catch (error) {
    console.error(`❌ Failed to undo migration for ${listing.slug}:`, error);
    throw error;
  }
}

/**
 * Main undo function
 */
async function main() {
  console.log('🔄 Starting undo of image migration...\n');

  try {
    // Get all listings
    const listings = await getAllListings();
    console.log(`📋 Found ${listings.length} listings to process\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each listing
    for (const listing of listings) {
      try {
        await undoListingMigration(listing);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to undo listing ${listing.slug}:`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ Undo completed!`);
    console.log(`✅ Successfully processed: ${successCount} listings`);
    if (errorCount > 0) {
      console.log(`❌ Failed to process: ${errorCount} listings`);
    }
    console.log(`\n📝 Original flat structure files are still in place.`);

  } catch (error) {
    console.error('💥 Undo failed:', error);
    process.exit(1);
  }
}

// Run the undo
main();
