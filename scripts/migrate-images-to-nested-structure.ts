#!/usr/bin/env npx tsx

/**
 * Migration Script: Migrate images from flat to nested structure
 *
 * This script:
 * 1. Finds all existing listings in the database
 * 2. For each listing, copies images from old flat paths to new nested paths
 * 3. Updates the JSON data in listing_versions to reflect new image paths
 * 4. LEAVES OLD FILES IN PLACE for safety
 *
 * Run this script first, then test thoroughly before running cleanup.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

interface ListingVersion {
  id: string;
  listing_id: string;
  data: any;
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
 * Get the current version for a listing
 */
async function getCurrentListingVersion(listingId: string): Promise<ListingVersion | null> {
  const { data, error } = await supabase
    .from('listing_versions')
    .select('id, listing_id, data')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch listing version: ${error.message}`);
  }

  return data;
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
 * Update image paths in listing version JSON
 */
async function updateListingVersionImages(listingVersionId: string, oldData: any): Promise<void> {
  const updatedData = { ...oldData };

  if (updatedData.images) {
    // Update general images (these stay the same)
    // updatedData.images.general remains unchanged

    // Update floorplan images
    if (updatedData.images.floorplan && Array.isArray(updatedData.images.floorplan)) {
      updatedData.images.floorplan = updatedData.images.floorplan.map((path: string) => {
        // Convert old path like "listing-slug-001/floorplan/image.jpg"
        // to new path like "listing-slug-001/details/property-overview/floorplansitemapsection/floorplan/image.jpg"
        return path.replace(/\/floorplan\//, '/details/property-overview/floorplansitemapsection/floorplan/');
      });
    }

    // Update sitemap images
    if (updatedData.images.sitemap && Array.isArray(updatedData.images.sitemap)) {
      updatedData.images.sitemap = updatedData.images.sitemap.map((path: string) => {
        // Convert old path like "listing-slug-001/sitemap/image.jpg"
        // to new path like "listing-slug-001/details/property-overview/floorplansitemapsection/sitemap/image.jpg"
        return path.replace(/\/sitemap\//, '/details/property-overview/floorplansitemapsection/sitemap/');
      });
    }
  }

  // Update the listing version
  const { error } = await supabase
    .from('listing_versions')
    .update({ data: updatedData })
    .eq('id', listingVersionId);

  if (error) {
    throw new Error(`Failed to update listing version ${listingVersionId}: ${error.message}`);
  }

  console.log(`✓ Updated image paths in listing version ${listingVersionId}`);
}

/**
 * Migrate images for a single listing
 */
async function migrateListingImages(listing: Listing): Promise<void> {
  console.log(`\n🔄 Migrating images for listing: ${listing.slug}`);

  const projectId = `${listing.slug}-001`;

  try {
    // Get current listing version
    const version = await getCurrentListingVersion(listing.id);
    if (!version) {
      console.log(`⚠️  No version found for listing ${listing.slug}, skipping`);
      return;
    }

    let migratedAny = false;

    // Migrate floorplan images
    const floorplanFiles = await listStorageFiles(`${projectId}/floorplan`);
    if (floorplanFiles.length > 0) {
      console.log(`📁 Migrating ${floorplanFiles.length} floorplan images...`);
      for (const filename of floorplanFiles) {
        const oldPath = `${projectId}/floorplan/${filename}`;
        const newPath = `${projectId}/details/property-overview/floorplansitemapsection/floorplan/${filename}`;
        await copyStorageFile(oldPath, newPath);
      }
      migratedAny = true;
    }

    // Migrate sitemap images
    const sitemapFiles = await listStorageFiles(`${projectId}/sitemap`);
    if (sitemapFiles.length > 0) {
      console.log(`📁 Migrating ${sitemapFiles.length} sitemap images...`);
      for (const filename of sitemapFiles) {
        const oldPath = `${projectId}/sitemap/${filename}`;
        const newPath = `${projectId}/details/property-overview/floorplansitemapsection/sitemap/${filename}`;
        await copyStorageFile(oldPath, newPath);
      }
      migratedAny = true;
    }

    // Update JSON paths if we migrated anything
    if (migratedAny) {
      await updateListingVersionImages(version.id, version.data);
    } else {
      console.log(`ℹ️  No images to migrate for ${listing.slug}`);
    }

    console.log(`✅ Completed migration for ${listing.slug}`);

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
