import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import Papa from 'papaparse'

// Domain configuration for email sending
const DOMAIN_CONFIG = [
  { domain: 'connect-ozlistings.com', sender_name: 'jeff' },
  { domain: 'engage-ozlistings.com', sender_name: 'jeffrey' },
  { domain: 'get-ozlistings.com', sender_name: 'jeff.richmond' },
  { domain: 'join-ozlistings.com', sender_name: 'jeff.r' },
  { domain: 'outreach-ozlistings.com', sender_name: 'jeffrey.r' },
  { domain: 'ozlistings-reach.com', sender_name: 'jeff' },
  { domain: 'reach-ozlistings.com', sender_name: 'jeffrey' },
]

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      )
    }

    // Read file content
    const csvText = await file.text()

    // Parse CSV using papaparse
    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
      return NextResponse.json(
        { 
          error: 'CSV parsing failed',
          details: parseResult.errors.map((e: Papa.ParseError) => e.message).join('; ')
        },
        { status: 400 }
      )
    }

    const rows = parseResult.data

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      )
    }

    // Validate required columns
    const requiredColumns = ['Email', 'Subject', 'Body']
    const firstRow = rows[0]
    const missingColumns = requiredColumns.filter(col => !(col in firstRow))

    if (missingColumns.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required columns: ${missingColumns.join(', ')}`,
          availableColumns: Object.keys(firstRow)
        },
        { status: 400 }
      )
    }

    // Helper function to replace template variables
    const replaceTemplateVariables = (text: string, row: Record<string, string>): string => {
      // Find all template variables like {{Name}}, {{Company}}, etc.
      return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        // Look for the variable in the row (case-insensitive)
        const value = row[variableName] || row[variableName.toLowerCase()] || row[variableName.toUpperCase()]
        // If found, replace; otherwise leave the template variable as-is
        return value !== undefined ? value : match
      })
    }

    // Add domain assignment, delays, and template replacement to each row
    const enrichedRows = rows.map((row, index) => {
      // Round-robin domain assignment
      const domainIndex = index % DOMAIN_CONFIG.length
      const domainConfig = DOMAIN_CONFIG[domainIndex]
      
      // Generate random delay between 15-100 seconds
      const delaySeconds = Math.floor(Math.random() * (100 - 15 + 1)) + 15
      
      // Construct from_email
      const fromEmail = `${domainConfig.sender_name}@${domainConfig.domain}`

      // Replace template variables in Subject and Body
      const subject = replaceTemplateVariables(row.Subject || '', row)
      const body = replaceTemplateVariables(row.Body || '', row)

      return {
        ...row,
        Subject: subject,
        Body: body,
        domain_index: domainIndex,
        delay_seconds: delaySeconds,
        from_email: fromEmail,
      }
    })

    // Connect to Supabase
    const supabase = createAdminClient()

    // Transform enriched rows to database format
    const queueRows = enrichedRows.map((row: Record<string, any>) => {
      // Extract metadata (all columns except the ones we're storing directly)
      const { Email, Subject, Body, domain_index, delay_seconds, from_email, ...metadataFields } = row
      
      return {
        to_email: Email as string,
        subject: Subject as string,
        body: Body as string,
        from_email: from_email as string,
        domain_index: domain_index as number,
        delay_seconds: delay_seconds as number,
        status: 'queued' as const,
        metadata: metadataFields, // Store other CSV columns as JSONB
        scheduled_for: new Date().toISOString(),
      }
    })

    // Bulk insert into email_queue table
    const { data: insertedRows, error: insertError } = await supabase
      .from('email_queue')
      .insert(queueRows)
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { 
          error: 'Failed to insert emails into queue',
          details: insertError.message
        },
        { status: 500 }
      )
    }

    // Return success with count
    return NextResponse.json({
      success: true,
      message: 'Campaign launched successfully',
      totalEmails: insertedRows?.length || queueRows.length,
      queued: insertedRows?.length || queueRows.length,
      domainDistribution: DOMAIN_CONFIG.map((config, index) => ({
        domain: config.domain,
        count: enrichedRows.filter(row => row.domain_index === index).length
      }))
    })

  } catch (error) {
    console.error('CSV upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

