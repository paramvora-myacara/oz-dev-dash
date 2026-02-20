import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminClient()

  let listingSlugs: string[]

  if (user.role === 'internal_admin') {
    // Internal admins see all listings from the listings table
    const { data: allListings, error: listingsError } = await supabase
      .from('listings')
      .select('slug')

    if (listingsError) return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
    listingSlugs = (allListings || []).map((r: { slug: string }) => r.slug)
  } else {
    // Customers see only listings they're associated with
    const { data: userListings, error: listingsError } = await supabase
      .from('admin_user_listings')
      .select('listing_slug')
      .eq('user_id', user.id)

    if (listingsError) return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
    listingSlugs = (userListings || []).map((r: { listing_slug: string }) => r.listing_slug)
  }

  const listings = listingSlugs.map((slug) => ({ listing_slug: slug }))

  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role }, listings })
}
