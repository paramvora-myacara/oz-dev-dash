#!/usr/bin/env npx tsx

/**
 * Migration Script: Migrate DDV files from per-listing buckets to unified ddv-vault bucket
 *
 * This script:
 * 1. Finds all existing DDV buckets (ddv-{slug})
 * 2. For each bucket, extracts the slug and looks up the listing ID
 * 3. Copies all files from old bucket to new structure: ddv-vault/{listingId}/filename.pdf
 * 4. LEAVES OLD FILES IN PLACE for safety - run cleanup script separately after verification
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
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const OLD_BUCKET_PREFIX = 'ddv-';
const NEW_BUCKET_NAME = 'ddv-vault';

interface BucketInfo {
  id: string;
  name: string;
  slug: string;
  listingId: string | null;
}

interface MigrationResult {
  bucketName: string;
  slug: string;
  listingId: string | null;
  filesFound: number;
  filesMigrated: number;
  errors: string[];
}

/**
 * Get all DDV buckets (excluding the new unified bucket)
 * Since listBuckets() requires admin permissions, we'll try to access known buckets directly
 * or get them from the database seed data
 */
async function getDDVBuckets(): Promise<BucketInfo[]> {
  // Since we can't list buckets with anon key, we'll get slugs from the database
  // and try to access buckets with the pattern ddv-{slug}
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, slug');

  if (listingsError) {
    throw new Error(`Failed to fetch listings: ${listingsError.message}`);
  }

  const bucketInfos: BucketInfo[] = [];

  // Try to access each potential DDV bucket
  for (const listing of listings || []) {
    const bucketName = `${OLD_BUCKET_PREFIX}${listing.slug}`;
    
    // Try to list files in this bucket to see if it exists
    const { error: bucketError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });

    // If no error (or error is not "not found"), bucket exists
    if (!bucketError || (!bucketError.message.includes('not found') && !bucketError.message.includes('does not exist'))) {
      bucketInfos.push({
        id: bucketName, // Use bucket name as ID since we can't get actual ID
        name: bucketName,
        slug: listing.slug,
        listingId: listing.id
      });
    }
  }

  console.log(`📦 Found ${bucketInfos.length} DDV buckets to migrate\n`);

  return bucketInfos;
}

/**
 * List all files in a bucket
 */
async function listBucketFiles(bucketName: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 1000 });

  if (error) {
    // If bucket doesn't exist or is empty, return empty array
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return [];
    }
    throw new Error(`Failed to list files in ${bucketName}: ${error.message}`);
  }

  // Filter out folders (files have an id, folders don't)
  return (data || [])
    .filter(item => item.id) // Only files have an id
    .map(item => item.name);
}

/**
 * Copy a file from old bucket to new location in ddv-vault
 */
async function copyFileToNewBucket(
  oldBucketName: string,
  fileName: string,
  newPath: string
): Promise<void> {
  try {
    // Download file from old bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(oldBucketName)
      .download(fileName);

    if (downloadError) {
      throw new Error(`Failed to download ${fileName} from ${oldBucketName}: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error(`No data received for ${fileName} from ${oldBucketName}`);
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to new location in ddv-vault bucket
    const { error: uploadError } = await supabase.storage
      .from(NEW_BUCKET_NAME)
      .upload(newPath, fileBuffer, {
        cacheControl: '3600',
        upsert: true // Allow overwriting if file already exists
      });

    if (uploadError) {
      throw new Error(`Failed to upload to ${newPath}: ${uploadError.message}`);
    }

    console.log(`  ✓ Copied ${fileName} → ${newPath}`);
  } catch (error: any) {
    console.error(`  ✗ Failed to copy ${fileName}:`, error.message || error);
    throw error;
  }
}

/**
 * Migrate files for a single bucket
 */
async function migrateBucket(bucketInfo: BucketInfo): Promise<MigrationResult> {
  const result: MigrationResult = {
    bucketName: bucketInfo.name,
    slug: bucketInfo.slug,
    listingId: bucketInfo.listingId,
    filesFound: 0,
    filesMigrated: 0,
    errors: []
  };

  console.log(`\n🔄 Migrating bucket: ${bucketInfo.name} (slug: ${bucketInfo.slug})`);

  if (!bucketInfo.listingId) {
    const errorMsg = `Cannot migrate: Listing ID not found for slug "${bucketInfo.slug}"`;
    console.error(`  ❌ ${errorMsg}`);
    result.errors.push(errorMsg);
    return result;
  }

  try {
    // List all files in the old bucket
    const files = await listBucketFiles(bucketInfo.name);
    result.filesFound = files.length;

    if (files.length === 0) {
      console.log(`  ℹ️  No files found in ${bucketInfo.name}`);
      return result;
    }

    console.log(`  📁 Found ${files.length} file(s) to migrate...`);

    // Migrate each file
    for (const fileName of files) {
      try {
        const newPath = `${bucketInfo.listingId}/${fileName}`;
        await copyFileToNewBucket(bucketInfo.name, fileName, newPath);
        result.filesMigrated++;
      } catch (error: any) {
        const errorMsg = `Failed to migrate ${fileName}: ${error.message || error}`;
        console.error(`  ✗ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    if (result.filesMigrated === result.filesFound) {
      console.log(`  ✅ Successfully migrated all ${result.filesMigrated} file(s) for ${bucketInfo.slug}`);
    } else {
      console.log(`  ⚠️  Migrated ${result.filesMigrated}/${result.filesFound} file(s) for ${bucketInfo.slug}`);
    }

  } catch (error: any) {
    const errorMsg = `Failed to migrate bucket ${bucketInfo.name}: ${error.message || error}`;
    console.error(`  ❌ ${errorMsg}`);
    result.errors.push(errorMsg);
  }

  return result;
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting DDV migration from per-listing buckets to unified ddv-vault bucket...\n');

  try {
    // Verify new bucket exists by trying to access it directly
    // (listBuckets() requires admin permissions, but we can try to list files)
    const { error: bucketError } = await supabase.storage
      .from(NEW_BUCKET_NAME)
      .list('', { limit: 1 });

    if (bucketError) {
      // Check if it's a "bucket not found" error
      if (bucketError.message.includes('not found') || bucketError.message.includes('does not exist')) {
        console.error(`❌ Error: Target bucket "${NEW_BUCKET_NAME}" does not exist!`);
        console.error(`   Please create the bucket first by running the migration: 20260117152000_create_ddv_vault_bucket.sql`);
        process.exit(1);
      } else {
        // Other errors (like permission issues) - log but continue
        console.warn(`⚠️  Warning: Could not verify bucket "${NEW_BUCKET_NAME}": ${bucketError.message}`);
        console.warn(`   Continuing anyway - ensure the bucket exists and is accessible\n`);
      }
    } else {
      console.log(`✅ Target bucket "${NEW_BUCKET_NAME}" exists and is accessible\n`);
    }

    // Get all DDV buckets to migrate
    const bucketInfos = await getDDVBuckets();

    if (bucketInfos.length === 0) {
      console.log('ℹ️  No DDV buckets found to migrate. Migration complete!');
      return;
    }

    const results: MigrationResult[] = [];
    let totalFilesFound = 0;
    let totalFilesMigrated = 0;
    let totalErrors = 0;

    // Process each bucket
    for (const bucketInfo of bucketInfos) {
      const result = await migrateBucket(bucketInfo);
      results.push(result);
      totalFilesFound += result.filesFound;
      totalFilesMigrated += result.filesMigrated;
      totalErrors += result.errors.length;
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Migration Summary');
    console.log(`${'='.repeat(60)}`);
    console.log(`Buckets processed: ${results.length}`);
    console.log(`Total files found: ${totalFilesFound}`);
    console.log(`Total files migrated: ${totalFilesMigrated}`);
    console.log(`Total errors: ${totalErrors}`);

    if (totalErrors > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      results.forEach(result => {
        if (result.errors.length > 0) {
          console.log(`\n  Bucket: ${result.bucketName}`);
          result.errors.forEach(error => console.log(`    - ${error}`));
        }
      });
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`\n⚠️  IMPORTANT: Old buckets are still in place.`);
    console.log(`   Test thoroughly before running cleanup script to delete old buckets.`);
    console.log(`   Verify files are accessible at: /{slug}/access-dd-vault`);

  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();
