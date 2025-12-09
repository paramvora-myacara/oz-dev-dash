import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import Papa from 'papaparse'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

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

// Scheduling configuration
const WORKING_HOURS = 8 // 9am-5pm
const JITTER_SECONDS_MAX = 30 // Random variation 0-30 seconds
const MIN_INTERVAL_MINUTES = 2 // Safety floor: minimum 2 minutes between same-domain emails

// Interval between emails from the same domain (in minutes)
// This value was calculated using the formula:
//   interval = 60 / (total_emails / domain_count / working_hours)
// For 950 emails across 7 domains over 8 hours:
//   interval = 60 / (950 / 7 / 8) = 60 / 16.96 ≈ 3.5 minutes
// This ensures ~17 emails per domain per hour, which is safe for warmed domains.
// TODO: Make this configurable in the future if we need to adjust sending rates.
const INTERVAL_MINUTES_BETWEEN_SAME_DOMAIN = 3.5

// Timezone configuration
// Default: Asia/Kolkata (Mumbai)
// Production: America/Los_Angeles (Pacific Time)
// Can be overridden via TIMEZONE environment variable
const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata'
const WORKING_HOUR_START = 9 // 9am
const WORKING_HOUR_END = 17 // 5pm

/**
 * Get current time components in the configured timezone
 */
function getCurrentTimeInTimezone(): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const now = new Date()
  const zonedTime = toZonedTime(now, TIMEZONE)
  
  return {
    year: zonedTime.getFullYear(),
    month: zonedTime.getMonth(), // Already 0-indexed
    day: zonedTime.getDate(),
    hour: zonedTime.getHours(),
    minute: zonedTime.getMinutes(),
    second: zonedTime.getSeconds(),
  }
}

/**
 * Convert a local time in the configured timezone to a UTC Date
 * Uses date-fns-tz to properly handle timezone conversion
 */
function createDateInTimezone(year: number, month: number, day: number, hour: number, minute: number, second: number): Date {
  // Create a Date object with the local time components
  // This date is interpreted as being in the system timezone, but we'll treat it as the target timezone
  const localDate = new Date(year, month, day, hour, minute, second)
  
  // Convert from the target timezone to UTC
  // fromZonedTime treats the date as if it's in the specified timezone and converts to UTC
  return fromZonedTime(localDate, TIMEZONE)
}

/**
 * Get the start time for scheduling emails in the configured timezone
 * Returns UTC Date and whether it's today
 */
function getStartTimeInTimezone(): { startTimeUTC: Date; isToday: boolean; remainingHoursToday: number } {
  const now = getCurrentTimeInTimezone()
  const { year, month, day, hour } = now
  
  if (hour < WORKING_HOUR_START) {
    // Before 9am - start at 9am today
    const startTimeUTC = createDateInTimezone(year, month, day, WORKING_HOUR_START, 0, 0)
    return { 
      startTimeUTC, 
      isToday: true, 
      remainingHoursToday: WORKING_HOUR_END - WORKING_HOUR_START // Full 8 hours
    }
  } else if (hour >= WORKING_HOUR_END) {
    // After 5pm - start at 9am tomorrow
    const tomorrow = new Date(year, month, day)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startTimeUTC = createDateInTimezone(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      WORKING_HOUR_START,
      0,
      0
    )
    return { 
      startTimeUTC, 
      isToday: false, 
      remainingHoursToday: 0 
    }
  } else {
    // Between 9am-5pm - start now
    const nowUTC = createDateInTimezone(year, month, day, hour, now.minute, now.second)
    const remainingHours = WORKING_HOUR_END - hour
    return { 
      startTimeUTC: nowUTC, 
      isToday: true, 
      remainingHoursToday: remainingHours 
    }
  }
}

/**
 * Get the 5pm boundary for a given UTC date in the configured timezone
 * Returns the 5pm UTC time for the same calendar day (in the configured timezone) as the input date
 */
function get5pmBoundaryForDate(utcDate: Date): Date {
  // Convert UTC date to timezone to get the calendar day
  const zonedTime = toZonedTime(utcDate, TIMEZONE)
  
  // Return 5pm of that calendar day in UTC
  return createDateInTimezone(
    zonedTime.getFullYear(),
    zonedTime.getMonth(),
    zonedTime.getDate(),
    WORKING_HOUR_END,
    0,
    0
  )
}

/**
 * Get the 9am start time for the next working day after the given UTC date
 * Returns 9am UTC of the next calendar day (in the configured timezone)
 */
function getNext9amAfterDate(utcDate: Date): Date {
  // Convert UTC date to timezone to get the calendar day
  const zonedTime = toZonedTime(utcDate, TIMEZONE)
  
  // Add one day
  const nextDay = new Date(zonedTime.getFullYear(), zonedTime.getMonth(), zonedTime.getDate())
  nextDay.setDate(nextDay.getDate() + 1)
  
  // Return 9am of the next day in UTC
  return createDateInTimezone(
    nextDay.getFullYear(),
    nextDay.getMonth(),
    nextDay.getDate(),
    WORKING_HOUR_START,
    0,
    0
  )
}

/**
 * Adjust a candidate scheduled time to fall within working hours (9am-5pm)
 * If the candidate time is at or after 5pm of its day, roll over to 9am of the next day
 * This handles multi-day overflow automatically
 */
function adjustToWorkingHours(candidateTime: Date): Date {
  const boundary5pm = get5pmBoundaryForDate(candidateTime)
  
  if (candidateTime >= boundary5pm) {
    // Past 5pm - roll over to 9am next day
    return getNext9amAfterDate(candidateTime)
  }
  
  return candidateTime
}

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

    // Connect to Supabase
    const supabase = createAdminClient()

    // Query existing email_queue for max scheduled_for per domain (for queued emails)
    // This ensures multiple CSV uploads in a day don't overlap scheduling
    const { data: existingSchedules } = await supabase
      .from('email_queue')
      .select('domain_index, scheduled_for')
      .eq('status', 'queued')
      .order('scheduled_for', { ascending: false })

    // Build map of last scheduled time per domain from existing queued emails
    const domainLastScheduled: Record<number, Date> = {}
    if (existingSchedules) {
      for (const row of existingSchedules) {
        const domainIndex = row.domain_index as number
        if (!(domainIndex in domainLastScheduled)) {
          domainLastScheduled[domainIndex] = new Date(row.scheduled_for)
        }
      }
    }

    // Use fixed interval between emails from the same domain
    // See INTERVAL_MINUTES_BETWEEN_SAME_DOMAIN constant for derivation and formula
    const intervalMinutes = INTERVAL_MINUTES_BETWEEN_SAME_DOMAIN
    
    const totalEmails = rows.length
    const domainCount = DOMAIN_CONFIG.length
    
    // Calculate emails per domain per hour for logging/capacity calculations
    // This is derived from: emailsPerDomainPerHour = 60 / intervalMinutes
    // (inverse of the formula used to calculate the interval)
    const emailsPerDomainPerHour = 60 / intervalMinutes
    
    console.log(`Scheduling ${totalEmails} emails across ${domainCount} domains`)
    console.log(`Interval between same-domain emails: ${intervalMinutes} minutes (fixed)`)
    console.log(`Effective emails per domain per hour: ${emailsPerDomainPerHour.toFixed(2)}`)

    // Get start time in configured timezone and calculate capacity
    const { startTimeUTC, isToday, remainingHoursToday } = getStartTimeInTimezone()
    
    // Calculate capacity per day for logging
    const emailsPerDomainPerHourActual = emailsPerDomainPerHour
    const capacityPerDay = WORKING_HOURS * emailsPerDomainPerHourActual * domainCount
    const capacityToday = isToday && remainingHoursToday > 0
      ? Math.floor(remainingHoursToday * emailsPerDomainPerHourActual * domainCount)
      : 0
    
    console.log(`Start time (UTC): ${startTimeUTC.toISOString()}`)
    console.log(`Starting today: ${isToday}, Remaining hours today: ${remainingHoursToday}`)
    console.log(`Capacity today: ${capacityToday}, Capacity per full day: ${capacityPerDay}`)
    
    // Estimate how many days this will take
    const estimatedDays = Math.ceil(totalEmails / capacityPerDay)
    console.log(`Estimated days to send all emails: ${estimatedDays}`)

    // Track current scheduling time per domain
    // This will automatically span multiple days as needed
    const domainCurrentTime: Record<number, Date> = {}

    // Add domain assignment, scheduling, and template replacement to each row
    const enrichedRows = rows.map((row, index) => {
      // Round-robin domain assignment
      const domainIndex = index % DOMAIN_CONFIG.length
      const domainConfig = DOMAIN_CONFIG[domainIndex]
      
      // Calculate scheduled_for with domain spacing
      let scheduledFor: Date
      const intervalMs = intervalMinutes * 60 * 1000
      const jitterMs = Math.random() * JITTER_SECONDS_MAX * 1000 // 0-30 seconds random jitter
      
      // Check if this domain has existing scheduled emails (from previous uploads)
      if (domainIndex in domainLastScheduled && !(domainIndex in domainCurrentTime)) {
        // This domain has previous emails scheduled but not yet processed in this batch
        // Add interval to the last scheduled time
        const lastScheduled = domainLastScheduled[domainIndex]
        const candidateTime = new Date(lastScheduled.getTime() + intervalMs + jitterMs)
        
        // Adjust to working hours (will roll over to next day if past 5pm)
        scheduledFor = adjustToWorkingHours(candidateTime)
      } else if (domainIndex in domainCurrentTime) {
        // This domain has emails in current batch - add interval
        const currentTime = domainCurrentTime[domainIndex]
        const candidateTime = new Date(currentTime.getTime() + intervalMs + jitterMs)
        
        // Adjust to working hours (will roll over to next day if past 5pm)
        scheduledFor = adjustToWorkingHours(candidateTime)
      } else {
        // First email for this domain - start from the calculated start time
        scheduledFor = new Date(startTimeUTC.getTime())
      }
      
      // Update tracking for next email of this domain
      domainCurrentTime[domainIndex] = scheduledFor
      domainLastScheduled[domainIndex] = scheduledFor
      
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
        from_email: fromEmail,
        scheduled_for: scheduledFor,
      }
    })

    // Transform enriched rows to database format
    const queueRows = enrichedRows.map((row: Record<string, any>) => {
      // Extract metadata (all columns except the ones we're storing directly)
      const { Email, Subject, Body, domain_index, from_email, scheduled_for, ...metadataFields } = row
      
      return {
        to_email: Email as string,
        subject: Subject as string,
        body: Body as string,
        from_email: from_email as string,
        domain_index: domain_index as number,
        delay_seconds: 0, // No longer used - scheduling is handled by scheduled_for
        status: 'queued' as const,
        metadata: metadataFields, // Store other CSV columns as JSONB
        scheduled_for: (scheduled_for as Date).toISOString(),
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

    // Calculate estimated completion time
    const allScheduledTimes = Object.values(domainLastScheduled)
    const lastScheduledTime = allScheduledTimes.length > 0
      ? allScheduledTimes.reduce((latest, time) => time > latest ? time : latest)
      : startTimeUTC

    // Calculate how many emails are scheduled per day for reporting
    const emailsByDay: Record<string, number> = {}
    for (const row of enrichedRows) {
      const zonedTime = toZonedTime(row.scheduled_for as Date, TIMEZONE)
      const dayKey = `${zonedTime.getFullYear()}-${String(zonedTime.getMonth() + 1).padStart(2, '0')}-${String(zonedTime.getDate()).padStart(2, '0')}`
      emailsByDay[dayKey] = (emailsByDay[dayKey] || 0) + 1
    }

    // Return success with count and scheduling info
    return NextResponse.json({
      success: true,
      message: 'Campaign launched successfully',
      totalEmails: insertedRows?.length || queueRows.length,
      queued: insertedRows?.length || queueRows.length,
      scheduling: {
        timezone: TIMEZONE,
        intervalMinutes: parseFloat(intervalMinutes.toFixed(2)),
        emailsPerDomainPerHour: parseFloat(emailsPerDomainPerHour.toFixed(2)),
        startTimeUTC: startTimeUTC.toISOString(),
        estimatedEndTimeUTC: lastScheduledTime.toISOString(),
        emailsByDay: emailsByDay,
        totalDays: Object.keys(emailsByDay).length,
      },
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

