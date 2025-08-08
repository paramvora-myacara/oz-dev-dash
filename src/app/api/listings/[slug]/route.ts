import { NextResponse } from 'next/server'
import { getPublishedListingBySlug, listVersionsBySlug } from '@/lib/supabase/listings'

export async function GET(_: Request, context: any) {
  const params = await context.params
  const slug = params?.slug as string
  const [listing, versions] = await Promise.all([
    getPublishedListingBySlug(slug),
    listVersionsBySlug(slug),
  ])
  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ listing, versions })
} 