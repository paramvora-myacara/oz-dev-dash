import { NextResponse } from 'next/server'
import { listVersionsBySlug } from '@/lib/supabase/listings'
import { createAdminClient } from '@/utils/supabase/admin'
import { verifyAdminCanEditSlug } from '@/lib/admin/auth'
import { Listing } from '@/types/listing'

export async function GET(_: Request, context: any) {
  const params = await context.params
  const versions = await listVersionsBySlug(params?.slug as string)
  return NextResponse.json({ versions })
}

export async function POST(request: Request, context: any) {
  const params = await context.params
  const slug = params?.slug as string
  const user = await verifyAdminCanEditSlug(slug)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const data = body?.data
  if (!data) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

  // Validate that we have a complete Listing object, not just details
  if (!data.listingName || !data.sections) {
    console.error('Incomplete data received:', {
      hasListingName: !!data.listingName,
      hasSections: !!data.sections,
      hasDetails: !!data.details
    });
    return NextResponse.json({ 
      error: 'Incomplete data: must include listingName and sections' 
    }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Ensure listing exists
  const { data: listingRow, error: listingErr } = await supabase
    .from('listings')
    .select('id, current_version_id')
    .eq('slug', slug)
    .maybeSingle()
  if (listingErr) return NextResponse.json({ error: 'Failed to load listing' }, { status: 500 })

  let listingId = listingRow?.id as string | undefined
  if (!listingId) {
    const { data: inserted, error: insertErr } = await supabase
      .from('listings')
      .insert({ slug })
      .select('id')
      .single()
    if (insertErr || !inserted) return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
    listingId = inserted.id
  }

  // Determine next version number
  const { data: maxRow, error: maxErr } = await supabase
    .from('listing_versions')
    .select('version_number')
    .eq('listing_id', listingId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (maxErr) return NextResponse.json({ error: 'Failed to read versions' }, { status: 500 })
  const nextVersion = (maxRow?.version_number ?? 0) + 1

  // Insert version
  const { data: version, error: verErr } = await supabase
    .from('listing_versions')
    .insert({ listing_id: listingId, version_number: nextVersion, data })
    .select('id, version_number, created_at, published_at')
    .single()
  if (verErr || !version) return NextResponse.json({ error: 'Failed to create version' }, { status: 500 })

  // Set as current version
  const { error: updErr } = await supabase
    .from('listings')
    .update({ current_version_id: version.id })
    .eq('id', listingId)
  if (updErr) return NextResponse.json({ error: 'Failed to set current version' }, { status: 500 })

  return NextResponse.json({ version })
} 