import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { verifyAdminCanEditSlug } from '@/lib/admin/auth'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, listingSlug } = body

    if (!fileName || !listingSlug) {
      return NextResponse.json(
        { error: 'File name and listing slug are required' },
        { status: 400 }
      )
    }

    // Verify admin authorization
    const adminUser = await verifyAdminCanEditSlug(listingSlug)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const bucketName = `ddv-${listingSlug}`

    // Delete file from Supabase storage
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName])

    if (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `File ${fileName} deleted successfully`
    })

  } catch (error) {
    console.error('Error in delete endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 