import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin'
import { getProjectIdFromSlug } from '@/utils/listing'
import { getSupabaseImageUrl } from '@/utils/supabaseImages'

const BUCKET_NAME = 'oz-projects-images'

/**
 * Check if a filename is a valid image file
 */
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

/**
 * Get the first available image URL for a listing (server-side)
 * Used for OG image metadata. Returns the first image alphabetically.
 * Returns null if no images are found.
 */
export async function getFirstImageUrl(slug: string): Promise<string | null> {
  try {
    const projectId = getProjectIdFromSlug(slug)
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list(`${projectId}/general`, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error || !data) {
      return null
    }

    // Find the first image file
    const firstImage = data.find(file => file.name && isImageFile(file.name))
    
    if (!firstImage) {
      return null
    }

    // Return the full public URL
    return getSupabaseImageUrl(projectId, 'general', firstImage.name)
  } catch (error) {
    console.error('Error fetching OG image:', error)
    return null
  }
}
