import { NextRequest, NextResponse } from 'next/server'
import { getDDVFileUrl } from '@/lib/supabase/ddv'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Verify Supabase session
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
    }
    
    // Get the file URL (public or signed)
    const fileUrl = await getDDVFileUrl(slug, fileName)
    
    if (!fileUrl) {
      console.error(`Failed to get file URL for slug: ${slug}, fileName: ${fileName}`)
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      )
    }
    
    console.log(`Redirecting to file URL: ${fileUrl}`)
    
    // Redirect directly to Supabase storage URL
    // Browser will download directly from Supabase, bypassing server-side fetch
    // This avoids network restrictions and domain rewrite issues in production
    return NextResponse.redirect(fileUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error in DDV download route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 