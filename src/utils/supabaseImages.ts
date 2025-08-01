// src/utils/supabaseImages.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BUCKET_NAME = 'oz-projects-images';

// Debug logging
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[SupabaseImages] ${message}`, data || '');
  }
}

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
  
  if (DEBUG) {
    debugLog('Supabase Config Validation:', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_ANON_KEY,
      urlLength: SUPABASE_URL?.length || 0,
      keyLength: SUPABASE_ANON_KEY?.length || 0
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export type ProjectId = string;

export const IMAGE_CATEGORIES = ['general', 'floorplan', 'sitemap'] as const;

export type ImageCategory = typeof IMAGE_CATEGORIES[number];

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
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Test Supabase connection and bucket access
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    debugLog('Testing Supabase connection...');
    
    // Test basic connection
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      debugLog('Bucket listing error:', bucketError);
      return {
        success: false,
        message: `Failed to list buckets: ${bucketError.message}`,
        details: bucketError
      };
    }
    
    debugLog('Available buckets:', buckets);
    
    // Test specific bucket access
    const { data: bucketFiles, error: bucketAccessError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });
    
    if (bucketAccessError) {
      debugLog('Bucket access error:', bucketAccessError);
      return {
        success: false,
        message: `Failed to access bucket '${BUCKET_NAME}': ${bucketAccessError.message}`,
        details: bucketAccessError
      };
    }
    
    debugLog('Bucket access successful, sample files:', bucketFiles);
    
    return {
      success: true,
      message: 'Supabase connection and bucket access successful',
      details: { buckets: buckets?.length || 0, bucketFiles: bucketFiles?.length || 0 }
    };
    
  } catch (error) {
    debugLog('Connection test error:', error);
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
  debugLog(`Fetching images for ${projectId}/${category}`);
  
  try {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list(`${projectId}/${category}`, { 
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      debugLog('Error listing images:', error);
      return [];
    }

    if (!data) {
      debugLog('No data returned from Supabase');
      return [];
    }

    debugLog(`Found ${data.length} files in ${projectId}/${category}`);

    // Filter for image files only and convert to full URLs
    const imageUrls = data
      .filter(file => file.name && isImageFile(file.name))
      .map(file => getSupabaseImageUrl(projectId, category, file.name));

    debugLog(`Filtered to ${imageUrls.length} image files`);
    return imageUrls;
  } catch (error) {
    debugLog('Error fetching images from Supabase:', error);
    return [];
  }
}

/**
 * Get random selection of images for background slideshow (max 7)
 */
export async function getRandomImages(projectId: ProjectId, category: ImageCategory, maxCount: number = 7): Promise<string[]> {
  debugLog(`Getting ${maxCount} random images for ${projectId}/${category}`);
  
  const allImages = await getAvailableImages(projectId, category);
  
  if (allImages.length <= maxCount) {
    debugLog(`Returning all ${allImages.length} images (less than max ${maxCount})`);
    return shuffleArray(allImages);
  }
  
  const selectedImages = shuffleArray(allImages).slice(0, maxCount);
  debugLog(`Returning ${selectedImages.length} random images`);
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
  debugLog(`Getting all project images for category: ${category}`);
  
  const results = await Promise.all(
    projects.map(async (projectId) => ({
      projectId,
      images: await getAvailableImages(projectId, category)
    }))
  );

  const filteredResults = results.filter(result => result.images.length > 0);
  debugLog(`Found images for ${filteredResults.length} projects`);
  
  return filteredResults;
}