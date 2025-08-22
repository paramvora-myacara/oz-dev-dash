import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    console.log('=== SignWell API Route Started ===')
    
    const { fullName, email, targetSlug } = await request.json()
    console.log('Request payload received:', { fullName, email, targetSlug })
    
    if (!fullName || !email || !targetSlug) {
      console.error('Missing required fields:', { fullName, email, targetSlug })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    console.log('Creating Supabase client...')
    // Fetch the developer information from the listings table
    const supabase = createClient()
    console.log('Supabase client created, querying listings table...')
    
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('developer_entity_name, developer_ca_email, developer_ca_name')
      .eq('slug', targetSlug)
      .single()
    
    console.log('Database query result:', { listing, listingError })
    
    if (listingError || !listing) {
      console.error('Error fetching listing:', listingError)
      console.error('Listing data:', listing)
      return NextResponse.json(
        { error: 'Failed to fetch listing information' },
        { status: 500 }
      )
    }
    
    console.log('Building SignWell data...')
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
    
    // Log the complete request data for debugging
    console.log('SignWell request data:', JSON.stringify(signWellData, null, 2))
    console.log('Listing data fetched:', listing)
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      TEMPLATE_ID: process.env.NEXT_PUBLIC_SIGNWELL_TEMPLATE_ID ? 'SET' : 'NOT SET',
      API_KEY: process.env.NEXT_PUBLIC_SIGNWELL_API_KEY ? 'SET' : 'NOT SET'
    })
    
    console.log('Making request to SignWell API...')
    const response = await fetch('https://www.signwell.com/api/v1/document_templates/documents/', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.NEXT_PUBLIC_SIGNWELL_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signWellData)
    })
    
    console.log('SignWell API response received:', { status: response.status, ok: response.ok })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('SignWell API error:', errorData)
      console.error('Response status:', response.status)
      console.error('Response headers:', Object.fromEntries(response.headers.entries()))
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: response.status }
      )
    }
    
    const documentData = await response.json()
    console.log('SignWell response data:', documentData)
    console.log('=== SignWell API Route Completed Successfully ===')
    
    return NextResponse.json({
      embeddedSigningUrl: documentData.recipients[0].embedded_signing_url
    })
  } catch (error) {
    console.error('=== SignWell API Route Error ===')
    console.error('Error creating SignWell document:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 