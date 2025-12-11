import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

// Keep in sync with launch route
const DOMAIN_CONFIG = [
  { domain: 'connect-ozlistings.com', sender_name: 'jeff' },
  { domain: 'engage-ozlistings.com', sender_name: 'jeffrey' },
  { domain: 'get-ozlistings.com', sender_name: 'jeff.richmond' },
  { domain: 'join-ozlistings.com', sender_name: 'jeff.r' },
  { domain: 'outreach-ozlistings.com', sender_name: 'jeffrey.r' },
  { domain: 'ozlistings-reach.com', sender_name: 'jeff' },
  { domain: 'reach-ozlistings.com', sender_name: 'jeffrey' },
]

const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles'
const WORKING_HOUR_START = 9
const WORKING_HOUR_END = 17
const INTERVAL_MINUTES = 3.5
const JITTER_SECONDS_MAX = 30

function getCurrentTimeInTimezone() {
  const now = new Date()
  const zonedTime = toZonedTime(now, TIMEZONE)
  return {
    year: zonedTime.getFullYear(),
    month: zonedTime.getMonth(),
    day: zonedTime.getDate(),
    hour: zonedTime.getHours(),
    minute: zonedTime.getMinutes(),
    second: zonedTime.getSeconds(),
  }
}

function createDateInTimezone(year: number, month: number, day: number, hour: number, minute: number, second: number): Date {
  const localDate = new Date(year, month, day, hour, minute, second)
  return fromZonedTime(localDate, TIMEZONE)
}

function getStartTimeInTimezone() {
  const now = getCurrentTimeInTimezone()
  const { year, month, day, hour } = now

  if (hour < WORKING_HOUR_START) {
    return createDateInTimezone(year, month, day, WORKING_HOUR_START, 0, 0)
  } else if (hour >= WORKING_HOUR_END) {
    const tomorrow = new Date(year, month, day)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return createDateInTimezone(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), WORKING_HOUR_START, 0, 0)
  } else {
    return createDateInTimezone(year, month, day, hour, now.minute, now.second)
  }
}

function get5pmBoundary(utcDate: Date): Date {
  const zonedTime = toZonedTime(utcDate, TIMEZONE)
  return createDateInTimezone(zonedTime.getFullYear(), zonedTime.getMonth(), zonedTime.getDate(), WORKING_HOUR_END, 0, 0)
}

function getNext9am(utcDate: Date): Date {
  const zonedTime = toZonedTime(utcDate, TIMEZONE)
  const nextDay = new Date(zonedTime.getFullYear(), zonedTime.getMonth(), zonedTime.getDate())
  nextDay.setDate(nextDay.getDate() + 1)
  return createDateInTimezone(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), WORKING_HOUR_START, 0, 0)
}

function adjustToWorkingHours(candidateTime: Date): Date {
  const boundary5pm = get5pmBoundary(candidateTime)
  if (candidateTime >= boundary5pm) {
    return getNext9am(candidateTime)
  }
  return candidateTime
}

// POST /api/campaigns/:id/retry-failed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId } = await params
    const supabase = createAdminClient()

    // 1) Fetch failed emails for this campaign
    const { data: failedEmails, error: failedError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'failed')
      .order('created_at', { ascending: true })

    if (failedError) {
      return NextResponse.json({ error: failedError.message }, { status: 500 })
    }

    if (!failedEmails || failedEmails.length === 0) {
      return NextResponse.json({ error: 'No failed emails to retry' }, { status: 400 })
    }

    // 2) Pull existing scheduled emails across all campaigns for domain spacing
    const { data: existingSchedules, error: scheduleError } = await supabase
      .from('email_queue')
      .select('domain_index, scheduled_for')
      .in('status', ['queued', 'processing'])
      .not('scheduled_for', 'is', null)
      .order('scheduled_for', { ascending: false })

    if (scheduleError) {
      return NextResponse.json({ error: scheduleError.message }, { status: 500 })
    }

    const domainLastScheduled: Record<number, Date> = {}
    existingSchedules?.forEach((row) => {
      const domainIndex = row.domain_index as number
      if (!(domainIndex in domainLastScheduled)) {
        domainLastScheduled[domainIndex] = new Date(row.scheduled_for as string)
      }
    })

    // 3) Calculate new schedules using same logic as launch
    const startTimeUTC = getStartTimeInTimezone()
    const intervalMs = INTERVAL_MINUTES * 60 * 1000
    const domainCurrentTime: Record<number, Date> = {}
    let roundRobinIndex = 0

    const updates = failedEmails.map((email) => {
      const existingDomainIndex = email.domain_index as number | null
      const domainIndex = existingDomainIndex ?? (roundRobinIndex++ % DOMAIN_CONFIG.length)
      const domainConfig = DOMAIN_CONFIG[domainIndex]
      const jitterMs = Math.random() * JITTER_SECONDS_MAX * 1000

      let scheduledFor: Date

      if (domainIndex in domainLastScheduled && !(domainIndex in domainCurrentTime)) {
        // Existing scheduled emails from other campaigns
        const lastScheduled = domainLastScheduled[domainIndex]
        scheduledFor = adjustToWorkingHours(new Date(lastScheduled.getTime() + intervalMs + jitterMs))
      } else if (domainIndex in domainCurrentTime) {
        // Already scheduled in this retry batch
        scheduledFor = adjustToWorkingHours(new Date(domainCurrentTime[domainIndex].getTime() + intervalMs + jitterMs))
      } else {
        // First email for this domain
        scheduledFor = adjustToWorkingHours(new Date(startTimeUTC.getTime() + jitterMs))
      }

      domainCurrentTime[domainIndex] = scheduledFor
      domainLastScheduled[domainIndex] = scheduledFor

      return {
        id: email.id,
        domainIndex,
        fromEmail: `${domainConfig.sender_name}@${domainConfig.domain}`,
        scheduledFor,
      }
    })

    console.log(
      'retry-failed: starting update',
      JSON.stringify({
        campaignId,
        failedCount: failedEmails.length,
        updates: updates.map((u) => ({
          id: u.id,
          domainIndex: u.domainIndex,
          scheduledFor: u.scheduledFor.toISOString(),
        })),
      })
    )

    // 4) Persist updates
    for (const update of updates) {
      const { error } = await supabase
        .from('email_queue')
        .update({
          status: 'queued',
          domain_index: update.domainIndex,
          from_email: update.fromEmail,
          scheduled_for: update.scheduledFor.toISOString(),
        })
        .eq('id', update.id)

      if (error) {
        console.error(
          'retry-failed: update error',
          JSON.stringify({
            campaignId,
            emailId: update.id,
            error: error.message,
          })
        )
        return NextResponse.json({ error: `Failed to update email ${update.id}: ${error.message}` }, { status: 500 })
      }
    }

    const lastScheduledTime = Object.values(domainLastScheduled)
      .reduce((latest, time) => (time > latest ? time : latest), startTimeUTC)

    console.log(
      'retry-failed: completed update',
      JSON.stringify({
        campaignId,
        retried: updates.length,
        estimatedEndTimeUTC: lastScheduledTime.toISOString(),
      })
    )

    return NextResponse.json({
      success: true,
      retried: updates.length,
      scheduling: {
        timezone: TIMEZONE,
        intervalMinutes: INTERVAL_MINUTES,
        estimatedEndTimeUTC: lastScheduledTime.toISOString(),
      },
    })
  } catch (error) {
    console.error('POST /api/campaigns/:id/retry-failed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
