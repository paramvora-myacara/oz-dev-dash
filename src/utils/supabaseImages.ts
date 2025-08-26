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

export const IMAGE_CATEGORIES = ['general', 'floorplan', 'sitemap'] as const;

export type ImageCategory = string;

/**
 * Get public URL for a Supabase storage object
 */
export function getSupabaseImageUrl(projectId: ProjectId, category: ImageCategory, filename: string): string {
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

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}.${extension}`;
    const filePath = `${projectId}/${category}/${filename}`;

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
    const filePath = `${projectId}/${category}/${filename}`;

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