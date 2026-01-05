// src/utils/supabaseImages.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BUCKET_NAME = 'oz-projects-images';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Validate environment variables
export function validateSupabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  
  if (!SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export type ProjectId = string;

export const PROJECTS: ProjectId[] = [
  'edge-on-main-mesa-001',
  'marshall-st-louis-001',
  'sogood-dallas-001'
];

// Image category definitions for new nested structure
export const IMAGE_CATEGORIES = [
  // Root level categories
  'general',

  // Nested categories for property overview
  'details/property-overview/floorplansitemapsection/floorplan',
  'details/property-overview/floorplansitemapsection/sitemap',

  // Nested categories for portfolio projects (dynamic - project-name will be appended)
  'details/portfolio-projects/',
] as const;

export type ImageCategory = string;

/**
 * Get public URL for a Supabase storage object
 * Handles both flat (general) and nested path structures
 */
export function getSupabaseImageUrl(projectId: ProjectId, category: ImageCategory, filename: string): string {
  // General category stays at root level for hero images
  if (category === 'general') {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${projectId}/${category}/${filename}`;
  }

  // All other categories use nested paths
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${projectId}/${category}/${filename}`;
}

/**
 * Check if a filename is a valid image file
 */
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

/**
 * Shuffle array using Fisher-Yates algorithm. Can be seeded for deterministic shuffling.
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;

  const seededRandom = () => {
    // If no seed, use standard Math.random
    if (currentSeed === undefined) {
      return Math.random();
    }
    // Simple pseudo-random number generator
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Test Supabase connection and bucket access
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Test basic connection
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return {
        success: false,
        message: `Failed to list buckets: ${bucketError.message}`,
        details: bucketError
      };
    }
    
    // Test specific bucket access
    const { data: bucketFiles, error: bucketAccessError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });
    
    if (bucketAccessError) {
      return {
        success: false,
        message: `Failed to access bucket '${BUCKET_NAME}': ${bucketAccessError.message}`,
        details: bucketAccessError
      };
    }
    
    return {
      success: true,
      message: 'Supabase connection and bucket access successful',
      details: { buckets: buckets?.length || 0, bucketFiles: bucketFiles?.length || 0 }
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}

/**
 * Get all available images for a project category using Supabase Storage API
 */
export async function getAvailableImages(projectId: ProjectId, category: ImageCategory): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list(`${projectId}/${category}`, { 
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      return [];
    }

    if (!data) {
      return [];
    }

    // Filter for image files only and convert to full URLs
    const imageUrls = data
      .filter(file => file.name && isImageFile(file.name))
      .map(file => getSupabaseImageUrl(projectId, category, file.name));

    return imageUrls;
  } catch (error) {
    return [];
  }
}

/**
 * Get a daily-random selection of images for background slideshow (max 7).
 * The list of images is stable for a given day to allow for effective caching.
 */
export async function getRandomImages(projectId: ProjectId, category: ImageCategory, maxCount: number = 7): Promise<string[]> {
  const allImages = await getAvailableImages(projectId, category);
  
  // Use the current UTC date as a seed for shuffling. This ensures all users see the
  // same "random" order for a full day, allowing Vercel's CDN to cache the images.
  const now = new Date();
  const seed = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
  
  const shuffledImages = shuffleArray(allImages, seed);
  
  if (shuffledImages.length <= maxCount) {
    return shuffledImages;
  }
  
  const selectedImages = shuffledImages.slice(0, maxCount);
  return selectedImages;
}

/**
 * Get project ID from pathname
 */
export function getProjectIdFromPath(pathname: string): ProjectId | null {
  if (pathname.includes('the-edge-on-main')) return 'edge-on-main-mesa-001';
  if (pathname.includes('marshall-st-louis')) return 'marshall-st-louis-001';
  if (pathname.includes('sogood-dallas')) return 'sogood-dallas-001';
  return null;
}

/**
 * Get all available images for all projects in a category (for main page carousel)
 */
export async function getAllProjectImages(category: ImageCategory, projects: ProjectId[]): Promise<Array<{ projectId: ProjectId; images: string[] }>> {
  const results = await Promise.all(
    projects.map(async (projectId) => ({
      projectId,
      images: await getAvailableImages(projectId, category)
    }))
  );

  const filteredResults = results.filter(result => result.images.length > 0);
  
  return filteredResults;
}

/**
 * Upload a new image to a project category
 */
export async function uploadImage(
  projectId: ProjectId,
  category: ImageCategory,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file type
    if (!isImageFile(file.name)) {
      return { success: false, error: 'Invalid file type. Only image files are allowed.' };
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size too large. Maximum size is 10MB.' };
    }

    // Ensure the folder exists before uploading
    const folderPath = getCategoryFolderPath(category);
    const folderResult = await ensureFolderExists(projectId, folderPath);
    if (!folderResult.success) {
      return { success: false, error: `Failed to create folder: ${folderResult.error}` };
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}.${extension}`;
    const filePath = buildImageFilePath(projectId, category, filename);

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    // Get public URL for the uploaded image
    const imageUrl = getSupabaseImageUrl(projectId, category, filename);

    return { success: true, url: imageUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Delete an image from a project category
 */
export async function deleteImage(
  projectId: ProjectId,
  category: ImageCategory,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const filePath = buildImageFilePath(projectId, category, filename);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: `Delete failed: ${error.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get filename from full image URL
 */
export function getFilenameFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
}

/**
 * Create folders in Supabase storage if they don't exist
 * Supabase creates folders implicitly when uploading files, but this ensures they're created explicitly
 */
export async function ensureFolderExists(projectId: ProjectId, folderPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Try to list the folder to see if it exists
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${projectId}/${folderPath}`, { limit: 1 });

    // If no error, folder exists or can be accessed
    if (!error) {
      return { success: true };
    }

    // If it's a "folder not found" type error, we can still proceed
    // Supabase will create folders implicitly when we upload files
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to ensure folder exists: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Create the general folder for a new listing by uploading a temporary placeholder file
 */
export async function createListingGeneralFolder(projectId: ProjectId): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Creating general folder for projectId:', projectId);
    // Create a placeholder file to establish the folder structure
    // Supabase creates folders implicitly when files are uploaded
    const placeholderPath = `${projectId}/general/.keep`;
    const placeholderContent = new Uint8Array([32]); // Small content instead of empty

    console.log('Uploading placeholder file to:', placeholderPath, 'in bucket:', BUCKET_NAME);
    const { error, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(placeholderPath, placeholderContent, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: `Failed to create general folder: ${error.message}` };
    }

    console.log('Placeholder file uploaded successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception in createListingGeneralFolder:', error);
    return {
      success: false,
      error: `Failed to create general folder: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get the folder path for a given category
 * This abstracts the folder structure logic
 */
export function getCategoryFolderPath(category: ImageCategory): string {
  // General category is at root level
  if (category === 'general') {
    return 'general';
  }

  // All other categories are nested
  return category;
}

/**
 * Build the full file path for an image upload
 */
export function buildImageFilePath(projectId: ProjectId, category: ImageCategory, filename: string): string {
  const folderPath = getCategoryFolderPath(category);
  return `${projectId}/${folderPath}/${filename}`;
}

// ==================== CAMPAIGN IMAGE FUNCTIONS ====================

export const CAMPAIGN_IMAGE_CATEGORY = 'images';

/**
 * Sanitizes campaign name for filesystem-safe folder names
 * - Converts spaces to dashes
 * - Removes special characters except dashes and underscores
 * - Converts to lowercase
 * - Limits length to prevent filesystem issues
 */
export function sanitizeCampaignName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace spaces and multiple spaces with single dash
    .replace(/\s+/g, '-')
    // Remove special characters except dashes and underscores
    .replace(/[^a-z0-9\-_]/g, '')
    // Remove multiple consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Limit length (filesystem friendly)
    .substring(0, 50);
}

/**
 * Generates campaign folder path: {sanitized-name}-{campaignId}
 */
export function getCampaignFolderName(campaignName: string, campaignId: string): string {
  const sanitizedName = sanitizeCampaignName(campaignName);
  return `${sanitizedName}-${campaignId}`;
}

/**
 * Creates campaign image folder if it doesn't exist
 */
export async function ensureCampaignImageFolder(
  campaignName: string,
  campaignId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const folderName = getCampaignFolderName(campaignName, campaignId);
    const placeholderPath = `campaigns/${folderName}/.keep`;

    // Upload a tiny placeholder to create the folder structure
    const placeholderContent = new Uint8Array([32]); // Single space character

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(placeholderPath, placeholderContent, {
        cacheControl: '3600',
        upsert: true  // Overwrite if exists
      });

    if (error) {
      return { success: false, error: `Failed to create folder: ${error.message}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get public URL for a campaign image
 */
export function getCampaignImageUrl(campaignName: string, campaignId: string, filename: string): string {
  const folderName = getCampaignFolderName(campaignName, campaignId);
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/campaigns/${folderName}/${CAMPAIGN_IMAGE_CATEGORY}/${filename}`;
}

/**
 * Get all available images for a campaign
 */
export async function getCampaignImages(campaignName: string, campaignId: string): Promise<string[]> {
  try {
    const folderName = getCampaignFolderName(campaignName, campaignId);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`campaigns/${folderName}/${CAMPAIGN_IMAGE_CATEGORY}`);

    if (error) return [];
    if (!data) return [];

    return data
      .filter(file => file.name && isImageFile(file.name))
      .map(file => getCampaignImageUrl(campaignName, campaignId, file.name));
  } catch (error) {
    return [];
  }
}

/**
 * Upload an image to a campaign
 */
export async function uploadCampaignImage(
  campaignName: string,
  campaignId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!isImageFile(file.name)) {
      return { success: false, error: 'Invalid file type. Only image files are allowed.' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size too large. Maximum size is 10MB.' };
    }

    const folderName = getCampaignFolderName(campaignName, campaignId);
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}.${extension}`;
    const filePath = `campaigns/${folderName}/${CAMPAIGN_IMAGE_CATEGORY}/${filename}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    const imageUrl = getCampaignImageUrl(campaignName, campaignId, filename);
    return { success: true, url: imageUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Delete a campaign image
 */
export async function deleteCampaignImage(
  campaignName: string,
  campaignId: string,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const folderName = getCampaignFolderName(campaignName, campaignId);
    const filePath = `campaigns/${folderName}/${CAMPAIGN_IMAGE_CATEGORY}/${filename}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: `Delete failed: ${error.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Clean up all images for a campaign (used when campaign is deleted)
 */
export async function cleanupCampaignImages(
  campaignName: string,
  campaignId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const folderName = getCampaignFolderName(campaignName, campaignId);

    // Get all files in the campaign folder
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`campaigns/${folderName}`, { limit: 1000 });

    if (listError) {
      return { success: false, error: `Failed to list files: ${listError.message}` };
    }

    if (!files || files.length === 0) {
      return { success: true }; // Nothing to clean up
    }

    // Build file paths for deletion
    const filePaths = files.map(file => `campaigns/${folderName}/${file.name}`);

    // Delete all files
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (deleteError) {
      return { success: false, error: `Failed to delete files: ${deleteError.message}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}