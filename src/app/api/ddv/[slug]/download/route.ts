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
    const supabase = createClient()
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
    
    // Get the signed URL for the file
    const signedUrl = await getDDVFileUrl(slug, fileName)
    
    if (!signedUrl) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      )
    }
    
    // Fetch the file from Supabase storage
    const response = await fetch(signedUrl)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: 500 }
      )
    }
    
    // Get the file content and headers
    const fileBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentLength = response.headers.get('content-length')
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || '',
        'Content-Disposition': `attachment; filename="${fileName}"`,
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