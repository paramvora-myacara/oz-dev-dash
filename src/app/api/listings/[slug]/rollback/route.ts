import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { verifyAdminCanEditSlug } from '@/lib/admin/auth'

export async function POST(request: Request, context: any) {
  const params = await context.params
  const slug = params?.slug as string
  const user = await verifyAdminCanEditSlug(slug)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const versionId = body?.versionId
  if (!versionId) return NextResponse.json({ error: 'Missing versionId' }, { status: 400 })

  const supabase = createAdminClient()

  // Get the listing
  const { data: listingRow, error: listingErr } = await supabase
    .from('listings')
    .select('id')
    .eq('slug', slug)
    .single()
  if (listingErr || !listingRow) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  // Verify the version exists and belongs to this listing
  const { data: versionRow, error: versionErr } = await supabase
    .from('listing_versions')
    .select('id, version_number')
    .eq('id', versionId)
    .eq('listing_id', listingRow.id)
    .single()
  if (versionErr || !versionRow) return NextResponse.json({ error: 'Version not found' }, { status: 404 })

  // Update the listing to point to the selected version
  const { error: updateErr } = await supabase
    .from('listings')
    .update({ current_version_id: versionId })
    .eq('id', listingRow.id)
  if (updateErr) return NextResponse.json({ error: 'Failed to rollback' }, { status: 500 })

  return NextResponse.json({ 
    success: true, 
    message: `Rolled back to version ${versionRow.version_number}` 
  })
} 