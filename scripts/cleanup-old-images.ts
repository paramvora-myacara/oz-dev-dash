#!/usr/bin/env npx tsx

/**
 * Cleanup Script: Remove old flat structure image files
 *
 * This script permanently deletes the old image files after thorough verification.
 *
 * ⚠️  WARNING: This action is IRREVERSIBLE!
 *
 * Only run this script after:
 * 1. Migration script has completed successfully
 * 2. New nested structure is working correctly
 * 3. All team members have verified functionality
 * 4. You have backups of all data
 *
 * This script will:
 * 1. Verify that new nested files exist for each old file
 * 2. Delete old flat structure files
 * 3. Clean up any empty folders
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
 * Check if a file exists in Supabase storage
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(filePath.substring(0, filePath.lastIndexOf('/')), {
        limit: 1000,
        search: filePath.substring(filePath.lastIndexOf('/') + 1)
      });

    if (error) return false;

    return (data || []).some(file => file.name === filePath.substring(filePath.lastIndexOf('/') + 1));
  } catch {
    return false;
  }
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
 * Verify that new files exist before deleting old ones
 */
async function verifyMigration(listing: Listing): Promise<{ canCleanup: boolean; issues: string[] }> {
  const projectId = `${listing.slug}-001`;
  const issues: string[] = [];

  // Check floorplan images
  const oldFloorplanFiles = await listStorageFiles(`${projectId}/floorplan`);
  for (const filename of oldFloorplanFiles) {
    const newPath = `${projectId}/details/property-overview/floorplansitemapsection/floorplan/${filename}`;
    if (!(await fileExists(newPath))) {
      issues.push(`Missing new floorplan file: ${newPath}`);
    }
  }

  // Check sitemap images
  const oldSitemapFiles = await listStorageFiles(`${projectId}/sitemap`);
  for (const filename of oldSitemapFiles) {
    const newPath = `${projectId}/details/property-overview/floorplansitemapsection/sitemap/${filename}`;
    if (!(await fileExists(newPath))) {
      issues.push(`Missing new sitemap file: ${newPath}`);
    }
  }

  return {
    canCleanup: issues.length === 0,
    issues
  };
}

/**
 * Clean up old files for a single listing
 */
async function cleanupListing(listing: Listing): Promise<void> {
  console.log(`\n🧹 Cleaning up old files for listing: ${listing.slug}`);

  // Verify migration first
  const verification = await verifyMigration(listing);
  if (!verification.canCleanup) {
    console.error(`❌ Cannot clean up ${listing.slug} - verification failed:`);
    verification.issues.forEach(issue => console.error(`   ${issue}`));
    throw new Error(`Verification failed for ${listing.slug}`);
  }

  const projectId = `${listing.slug}-001`;
  let deletedCount = 0;

  try {
    // Delete old floorplan files
    const oldFloorplanFiles = await listStorageFiles(`${projectId}/floorplan`);
    if (oldFloorplanFiles.length > 0) {
      console.log(`🗑️  Deleting ${oldFloorplanFiles.length} old floorplan files...`);
      for (const filename of oldFloorplanFiles) {
        await deleteStorageFile(`${projectId}/floorplan/${filename}`);
        deletedCount++;
      }
    }

    // Delete old sitemap files
    const oldSitemapFiles = await listStorageFiles(`${projectId}/sitemap`);
    if (oldSitemapFiles.length > 0) {
      console.log(`🗑️  Deleting ${oldSitemapFiles.length} old sitemap files...`);
      for (const filename of oldSitemapFiles) {
        await deleteStorageFile(`${projectId}/sitemap/${filename}`);
        deletedCount++;
      }
    }

    if (deletedCount === 0) {
      console.log(`ℹ️  No old files to clean up for ${listing.slug}`);
    } else {
      console.log(`✅ Cleaned up ${deletedCount} old files for ${listing.slug}`);
    }

  } catch (error) {
    console.error(`❌ Failed to clean up files for ${listing.slug}:`, error);
    throw error;
  }
}

/**
 * Confirmation prompt
 */
async function getUserConfirmation(): Promise<boolean> {
  console.log('\n🚨 DANGER: This will permanently delete old image files!');
  console.log('Are you absolutely sure you want to continue?');
  console.log('Type "yes" to continue or anything else to abort:');

  // In a real script, you'd use readline for user input
  // For now, we'll just warn and proceed (uncomment the next line for safety)
  // return false;

  return true; // Remove this line and add proper user confirmation
}

/**
 * Main cleanup function
 */
async function main() {
  console.log('🧹 Starting cleanup of old image files...\n');
  console.log('⚠️  WARNING: This will PERMANENTLY DELETE old files!');
  console.log('   Make sure you have verified the migration works correctly.\n');

  // Uncomment this for safety
  // const confirmed = await getUserConfirmation();
  // if (!confirmed) {
  //   console.log('Cleanup aborted by user.');
  //   return;
  // }

  try {
    // Get all listings
    const listings = await getAllListings();
    console.log(`📋 Found ${listings.length} listings to process\n`);

    let successCount = 0;
    let errorCount = 0;
    let totalDeleted = 0;

    // Process each listing
    for (const listing of listings) {
      try {
        await cleanupListing(listing);
        successCount++;
        // Note: We can't easily track totalDeleted across listings without more complex state
      } catch (error) {
        console.error(`❌ Failed to clean up listing ${listing.slug}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`✅ Successfully processed: ${successCount} listings`);
    if (errorCount > 0) {
      console.log(`❌ Failed to process: ${errorCount} listings`);
    }
    console.log(`\n💥 Old image files have been permanently deleted!`);
    console.log(`   This action cannot be undone.`);

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
main();
