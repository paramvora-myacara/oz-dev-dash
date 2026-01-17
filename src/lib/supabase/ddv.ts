import { createClient } from '@/utils/supabase/server'
import { getListingIdBySlug } from '@/lib/supabase/listings'

export interface DDVFile {
  name: string
  id: string
  updated_at: string
  size: number
  metadata?: {
    mimetype?: string
    cacheControl?: string
  }
}

export async function getDDVFiles(listingSlug: string): Promise<DDVFile[]> {
  const supabase = await createClient()
  const bucketName = 'ddv-vault'
  
  // Get listing ID from slug
  const listingId = await getListingIdBySlug(listingSlug)
  if (!listingId) {
    console.error(`Could not find listing ID for slug: ${listingSlug}`)
    return []
  }
  
  console.log(`Attempting to fetch files from bucket: ${bucketName}, folder: ${listingId}`)
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(listingId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })
    
    if (error) {
      console.error(`Error fetching files from bucket ${bucketName}, folder ${listingId}:`, error)
      return []
    }
    
    console.log(`Raw data from bucket ${bucketName}, folder ${listingId}:`, data)
    
    if (!data) {
      console.log(`No data returned from bucket ${bucketName}, folder ${listingId}`)
      return []
    }
    
    // Filter out folders and return only files
    const files = data
      .filter((item: any) => item.id) // Files have an id, folders don't
      .map((item: any) => ({
        name: item.name,
        id: item.id || '',
        updated_at: item.updated_at || '',
        size: item.metadata?.size || 0,
        metadata: item.metadata
      }))
    
    console.log(`Processed files from bucket ${bucketName}, folder ${listingId}:`, files)
    return files
  } catch (error) {
    console.error(`Unexpected error fetching files from bucket ${bucketName}, folder ${listingId}:`, error)
    return []
  }
}

export async function getDDVFileUrl(listingSlug: string, fileName: string): Promise<string | null> {
  const supabase = await createClient()
  const bucketName = 'ddv-vault'
  
  // Get listing ID from slug
  const listingId = await getListingIdBySlug(listingSlug)
  if (!listingId) {
    console.error(`Could not find listing ID for slug: ${listingSlug}`)
    return null
  }
  
  // File path includes listing ID folder
  const filePath = `${listingId}/${fileName}`
  
  try {
    const { data } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    
    return data?.signedUrl || null
  } catch (error) {
    console.error(`Error generating signed URL for ${filePath} in bucket ${bucketName}:`, error)
    return null
  }
} 