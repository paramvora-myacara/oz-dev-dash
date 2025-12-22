import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import { adjustToWorkingHours, getStartTimeInTimezone, ScheduleConfig } from '@/lib/scheduling'

// Base domains (without sender-specific configuration)
const BASE_DOMAINS = [
  // Original 7 domains (temporarily disabled for testing new domains)
  'connect-ozlistings.com',
  'engage-ozlistings.com',
  'get-ozlistings.com',
  'join-ozlistings.com',
  'outreach-ozlistings.com',
  'ozlistings-reach.com',
  'reach-ozlistings.com',

  // New warmed domains under test
  'access-ozlistings.com',
  'contact-ozlistings.com',
  'direct-ozlistings.com',
  'grow-ozlistings.com',
  'growth-ozlistings.com',
  'link-ozlistings.com',
  'network-ozlistings.com',
  'ozlistings-access.com',
  'ozlistings-connect.com',
  'ozlistings-contact.com',
  'ozlistings-direct.com',
  'ozlistings-engage.com',
  'ozlistings-get.com',
  'ozlistings-grow.com',
  'ozlistings-join.com',
  'ozlistings-link.com',
  'ozlistings-network.com',
  'ozlistings-outreach.com',
  'ozlistings-team.com',
  'ozlistngs-growth.com',
  'team-ozlistings.com',
];

// Generate domain config based on campaign sender
function generateDomainConfig(sender: 'todd_vitzthum' | 'jeff_richmond') {
  const senderLocal = sender === 'todd_vitzthum' ? 'todd.vitzthum' : 'jeff.richmond'
  const displayName = sender === 'todd_vitzthum' ? 'Todd Vitzthum' : 'Jeff Richmond'

  return BASE_DOMAINS.map((domain) => ({
    domain,
    sender_local: senderLocal,
    display_name: displayName,
  }))
}

const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles'
const WORKING_HOUR_START = 9
const WORKING_HOUR_END = 17
const INTERVAL_MINUTES = 3.5
const JITTER_SECONDS_MAX = 30
const SCHEDULING_CONFIG: ScheduleConfig = {
  timezone: TIMEZONE,
  workingHourStart: WORKING_HOUR_START,
  workingHourEnd: WORKING_HOUR_END,
  skipWeekends: true,
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

    // 1) Verify campaign exists and get sender
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('sender')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Generate domain config based on campaign sender
    const DOMAIN_CONFIG = generateDomainConfig(campaign.sender)

    // 2) Fetch failed emails for this campaign
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
    const startTimeUTC = getStartTimeInTimezone(SCHEDULING_CONFIG)
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
        scheduledFor = adjustToWorkingHours(new Date(lastScheduled.getTime() + intervalMs + jitterMs), SCHEDULING_CONFIG)
      } else if (domainIndex in domainCurrentTime) {
        // Already scheduled in this retry batch
        scheduledFor = adjustToWorkingHours(
          new Date(domainCurrentTime[domainIndex].getTime() + intervalMs + jitterMs),
          SCHEDULING_CONFIG
        )
      } else {
        // First email for this domain
        scheduledFor = adjustToWorkingHours(new Date(startTimeUTC.getTime() + jitterMs), SCHEDULING_CONFIG)
      }

      domainCurrentTime[domainIndex] = scheduledFor
      domainLastScheduled[domainIndex] = scheduledFor

      return {
        id: email.id,
        domainIndex,
        fromEmail: `${domainConfig.display_name} <${domainConfig.sender_local}@${domainConfig.domain}>`,
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
