#!/usr/bin/env npx tsx

/**
 * Migration Script: Migrate images from flat to nested structure
 *
 * This script:
 * 1. Finds all existing listings in the database
 * 2. For each listing, copies images from old flat paths to new nested paths
 * 3. LEAVES OLD FILES IN PLACE for safety
 *
 * Note: Images are not stored in listing_versions JSON - they're handled entirely
 * through Supabase storage paths. No JSON updates are needed.
 *
 * Run this script first, then test thoroughly before running cleanup.
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

  return (data || []).map(file => file.name).filter(name => name && isImageFile(name));
}

/**
 * Check if a filename is an image
 */
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

/**
 * Copy a file from old path to new path in Supabase storage
 */
async function copyStorageFile(oldPath: string, newPath: string): Promise<void> {
  try {
    // First, download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(oldPath);

    if (downloadError) {
      throw new Error(`Failed to download ${oldPath}: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error(`No data received for ${oldPath}`);
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to new location
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(newPath, fileBuffer, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload to ${newPath}: ${uploadError.message}`);
    }

    console.log(`✓ Copied ${oldPath} → ${newPath}`);
  } catch (error) {
    console.error(`✗ Failed to copy ${oldPath} → ${newPath}:`, error);
    throw error;
  }
}


/**
 * Migrate images for a single listing
 */
async function migrateListingImages(listing: Listing): Promise<void> {
  console.log(`\n🔄 Migrating images for listing: ${listing.slug}`);

  const projectId = `${listing.slug}-001`;

  try {
    let migratedCount = 0;

    // Migrate floorplan images
    const floorplanFiles = await listStorageFiles(`${projectId}/floorplan`);
    if (floorplanFiles.length > 0) {
      console.log(`📁 Migrating ${floorplanFiles.length} floorplan images...`);
      for (const filename of floorplanFiles) {
        const oldPath = `${projectId}/floorplan/${filename}`;
        const newPath = `${projectId}/details/property-overview/floorplansitemapsection/floorplan/${filename}`;
        await copyStorageFile(oldPath, newPath);
        migratedCount++;
      }
    }

    // Migrate sitemap images
    const sitemapFiles = await listStorageFiles(`${projectId}/sitemap`);
    if (sitemapFiles.length > 0) {
      console.log(`📁 Migrating ${sitemapFiles.length} sitemap images...`);
      for (const filename of sitemapFiles) {
        const oldPath = `${projectId}/sitemap/${filename}`;
        const newPath = `${projectId}/details/property-overview/floorplansitemapsection/sitemap/${filename}`;
        await copyStorageFile(oldPath, newPath);
        migratedCount++;
      }
    }

    if (migratedCount === 0) {
      console.log(`ℹ️  No images to migrate for ${listing.slug}`);
    } else {
      console.log(`✅ Migrated ${migratedCount} images for ${listing.slug}`);
    }

  } catch (error) {
    console.error(`❌ Failed to migrate images for ${listing.slug}:`, error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting image migration from flat to nested structure...\n');

  try {
    // Get all listings
    const listings = await getAllListings();
    console.log(`📋 Found ${listings.length} listings to process\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each listing
    for (const listing of listings) {
      try {
        await migrateListingImages(listing);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to process listing ${listing.slug}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully processed: ${successCount} listings`);
    if (errorCount > 0) {
      console.log(`❌ Failed to process: ${errorCount} listings`);
    }
    console.log(`\n⚠️  IMPORTANT: Old files are still in place. Test thoroughly before running cleanup script.`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();
