import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { fullName, email, targetSlug } = await request.json()
    
    if (!fullName || !email || !targetSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Fetch the developer information from the listings table
    const supabase = await createClient()
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('developer_entity_name, developer_ca_email, developer_ca_name')
      .eq('slug', targetSlug)
      .single()
    
    if (listingError || !listing) {
      console.error('Error fetching listing:', listingError)
      return NextResponse.json(
        { error: 'Failed to fetch listing information' },
        { status: 500 }
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
        },
        {
          id: "2",
          placeholder_name: "disclosing party",
          name: listing.developer_ca_name || listing.developer_entity_name || "Development Entity",
          email: listing.developer_ca_email || "noreply@development-entity.com"
        }
      ],
      template_fields: [
        {
          api_id: "developer_entity_name",
          value: listing.developer_entity_name || "Development Entity"
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