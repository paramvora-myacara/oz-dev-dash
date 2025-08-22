import { createClient } from '@/utils/supabase/server'

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
  const bucketName = `ddv-${listingSlug}`
  
  console.log(`Attempting to fetch files from bucket: ${bucketName}`)
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })
    
    if (error) {
      console.error(`Error fetching files from bucket ${bucketName}:`, error)
      return []
    }
    
    console.log(`Raw data from bucket ${bucketName}:`, data)
    
    if (!data) {
      console.log(`No data returned from bucket ${bucketName}`)
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
    
    console.log(`Processed files from bucket ${bucketName}:`, files)
    return files
  } catch (error) {
    console.error(`Unexpected error fetching files from bucket ${bucketName}:`, error)
    return []
  }
}

export async function getDDVFileUrl(listingSlug: string, fileName: string): Promise<string | null> {
  const supabase = await createClient()
  const bucketName = `ddv-${listingSlug}`
  
  try {
    const { data } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600) // 1 hour expiry
    
    return data?.signedUrl || null
  } catch (error) {
    console.error(`Error generating signed URL for ${fileName} in bucket ${bucketName}:`, error)
    return null
  }
} 