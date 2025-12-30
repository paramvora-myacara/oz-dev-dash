import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { fullName, email, targetSlug } = await request.json()
    
    if (!fullName || !email || !targetSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const signWellData = {
      test_mode: process.env.NODE_ENV === 'development',
      template_id: process.env.NEXT_PUBLIC_SIGNWELL_TEMPLATE_ID,
      embedded_signing: true,
      recipients: [
        {
          id: "1",
          placeholder_name: "receiving party",
          name: fullName,
          email: email,
        }
      ]
    }
    
    const response = await fetch('https://www.signwell.com/api/v1/document_templates/documents/', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.NEXT_PUBLIC_SIGNWELL_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signWellData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('SignWell API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: response.status }
      )
    }
    
    const documentData = await response.json()
    
    return NextResponse.json({
      embeddedSigningUrl: documentData.recipients[0].embedded_signing_url
    })
  } catch (error) {
    console.error('Error creating SignWell document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 