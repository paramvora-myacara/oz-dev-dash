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
  // Use unencoded path - Supabase handles encoding internally
  const filePath = `${listingId}/${fileName}`
  
  try {
    // Since the bucket is public, use getPublicUrl instead of createSignedUrl
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)
    
    if (data?.publicUrl) {
      console.log(`Generated public URL for ${filePath}: ${data.publicUrl}`)
      return data.publicUrl
    }
    
    // Fallback to signed URL if public URL doesn't work
    console.log(`Public URL not available, trying signed URL for ${filePath}`)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600)
    
    if (signedError) {
      console.error(`Error generating signed URL for ${filePath} in bucket ${bucketName}:`, signedError)
      return null
    }
    
    if (signedData?.signedUrl) {
      console.log(`Generated signed URL for ${filePath}`)
      return signedData.signedUrl
    }
    
    return null
  } catch (error) {
    console.error(`Error generating file URL for ${filePath} in bucket ${bucketName}:`, error)
    return null
  }
} 