import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin'
import { Listing, NewsCardMetadata } from '@/types/listing'

export async function getPublishedListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = createAdminClient()
  
  // First get the listing to find its current version
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, current_version_id, developer_website, is_verified_oz_project')
    .eq('slug', slug)
    .single()
    
  if (listingError || !listing || !listing.current_version_id) {
    console.error('getPublishedListingBySlug error', listingError)
    return null
  }
  
  // Then get the current version data
  const { data: version, error: versionError } = await supabase
    .from('listing_versions')
    .select('data, news_links')
    .eq('id', listing.current_version_id)
    .single()
    
  if (versionError || !version) {
    console.error('getPublishedListingBySlug version error', versionError)
    return null
  }
  
  return {
    ...(version.data as Listing),
    newsLinks: (version.news_links as NewsCardMetadata[]) || [],
    developer_website: listing.developer_website || null,
    is_verified_oz_project: listing.is_verified_oz_project || false,
  };
}

export interface ListingVersionMeta {
  id: string
  version_number: number
  created_at: string
  published_at: string
  is_current?: boolean
}

export async function listVersionsBySlug(slug: string): Promise<ListingVersionMeta[]> {
  const supabase = createAdminClient()
  const { data: listingRow, error: listingError } = await supabase
    .from('listings')
    .select('id, current_version_id')
    .eq('slug', slug)
    .single()
  if (listingError || !listingRow) return []

  const { data, error } = await supabase
    .from('listing_versions')
    .select('id, version_number, created_at, published_at')
    .eq('listing_id', listingRow.id)
    .order('version_number', { ascending: false })
  if (error || !data) return []
  
  // Mark the current version
  return (data as ListingVersionMeta[]).map(version => ({
    ...version,
    is_current: version.id === listingRow.current_version_id
  }))
}

export async function getVersionData(slug: string, versionId: string): Promise<Listing | null> {
  const supabase = createAdminClient()
  const { data: listingRow } = await supabase
    .from('listings')
    .select('id')
    .eq('slug', slug)
    .single()
  if (!listingRow) return null

  const { data, error } = await supabase
    .from('listing_versions')
    .select('data')
    .eq('id', versionId)
    .eq('listing_id', listingRow.id)
    .single()
  if (error) return null
  return (data?.data as Listing) ?? null
} 