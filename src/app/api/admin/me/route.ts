import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminClient()
  
  // Get user's listings
  const { data: userListings, error: listingsError } = await supabase
    .from('admin_user_listings')
    .select('listing_slug')
    .eq('user_id', user.id)
  
  if (listingsError) return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  
  // Get domain information for these listings
  const listingSlugs = (userListings || []).map((r: any) => r.listing_slug)
  const { data: domainsData, error: domainsError } = await supabase
    .from('domains')
    .select('hostname, listing_slug')
    .in('listing_slug', listingSlugs)
  
  if (domainsError) return NextResponse.json({ error: 'Failed to load domains' }, { status: 500 })
  
  // Create a map of listing_slug to hostname
  const domainMap = new Map()
  ;(domainsData || []).forEach((domain: any) => {
    domainMap.set(domain.listing_slug, domain.hostname)
  })
  
  // Transform the data to include hostname
  const listings = (userListings || []).map((r: any) => ({
    listing_slug: r.listing_slug,
    hostname: domainMap.get(r.listing_slug)
  }))
  
  return NextResponse.json({ user, listings })
} 