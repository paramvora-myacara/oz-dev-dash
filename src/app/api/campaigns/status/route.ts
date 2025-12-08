import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export async function GET() {
  try {
    // Verify admin authorization
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to Supabase
    const supabase = createAdminClient()

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error getting total count:', totalError)
      return NextResponse.json(
        { error: 'Failed to fetch campaign status' },
        { status: 500 }
      )
    }

    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('email_queue')
      .select('status')

    if (statusError) {
      console.error('Error getting status counts:', statusError)
      return NextResponse.json(
        { error: 'Failed to fetch campaign status' },
        { status: 500 }
      )
    }

    // Count by status
    const queued = statusCounts?.filter(row => row.status === 'queued').length || 0
    const sent = statusCounts?.filter(row => row.status === 'sent').length || 0
    const failed = statusCounts?.filter(row => row.status === 'failed').length || 0
    const processing = statusCounts?.filter(row => row.status === 'processing').length || 0

    // Determine overall status
    let campaignStatus: 'sending' | 'completed' | 'paused' = 'sending'
    if (queued === 0 && processing === 0 && sent > 0) {
      campaignStatus = 'completed'
    } else if (queued > 0 || processing > 0) {
      campaignStatus = 'sending'
    }

    // Get latest sent_at timestamp
    const { data: latestSent, error: latestError } = await supabase
      .from('email_queue')
      .select('sent_at')
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    const lastUpdated = latestSent?.sent_at || new Date().toISOString()

    // Get recent activity (last 10 sent emails)
    const { data: recentSent, error: recentError } = await supabase
      .from('email_queue')
      .select('id, to_email, sent_at, status, error_message')
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(10)

    // Get recent failures (last 5)
    const { data: recentFailures, error: failuresError } = await supabase
      .from('email_queue')
      .select('id, to_email, error_message, created_at')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(5)

    // Configuration (shared with upload route)
    const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata'
    const WORKING_HOUR_START = 9 // 9am
    const WORKING_HOUR_END = 17 // 5pm
    const WORKING_HOURS = 8 // 9am-5pm
    const INTERVAL_MINUTES_BETWEEN_SAME_DOMAIN = 3.5
    const DOMAIN_COUNT = 7

    // Get next scheduled emails (upcoming queued)
    const { data: nextScheduledRaw, error: scheduledError } = await supabase
      .from('email_queue')
      .select('id, to_email, scheduled_for, domain_index')
      .eq('status', 'queued')
      .order('scheduled_for', { ascending: true })
      .limit(5)

    // Format next scheduled times in campaign timezone for display
    const nextScheduled =
      nextScheduledRaw?.map((item) => {
        const utcDate = new Date(item.scheduled_for as string)
        const zonedTime = toZonedTime(utcDate, TIMEZONE)
        const timeString = zonedTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: TIMEZONE,
        })

        return {
          ...item,
          scheduled_for_display: timeString,
          timezone: TIMEZONE,
        }
      }) ?? []

    // Calculate sending rate (emails sent in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: sentLastHour, error: rateError } = await supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('sent_at', oneHourAgo)

    // Get domain distribution for queued emails
    const { data: domainData, error: domainError } = await supabase
      .from('email_queue')
      .select('domain_index')
      .eq('status', 'queued')

    const domainDistribution: Record<number, number> = {}
    domainData?.forEach(row => {
      domainDistribution[row.domain_index] = (domainDistribution[row.domain_index] || 0) + 1
    })

    // Calculate emails per domain per hour (same formula as upload route)
    const emailsPerDomainPerHour = 60 / INTERVAL_MINUTES_BETWEEN_SAME_DOMAIN
    
    // Get current time in configured timezone
    const nowUTC = new Date()
    const nowZoned = toZonedTime(nowUTC, TIMEZONE)
    const { year, month, day, hour } = {
      year: nowZoned.getFullYear(),
      month: nowZoned.getMonth(),
      day: nowZoned.getDate(),
      hour: nowZoned.getHours(),
    }
    
    // Create date boundaries in timezone, then convert to UTC for database queries
    const createDateInTimezone = (y: number, m: number, d: number, h: number, min: number, sec: number): Date => {
      const localDate = new Date(y, m, d, h, min, sec)
      return fromZonedTime(localDate, TIMEZONE)
    }
    
    // Calculate capacity using same logic as upload route
    // Interval: 3.5 minutes between same-domain emails
    // Emails per domain per hour: 60 / 3.5 = ~17.14 emails/hour
    // Total per hour: 17.14 * 7 domains = ~120 emails/hour
    // Daily capacity: 120 * 8 hours = ~960 emails/day
    const MAX_DAILY_CAPACITY = Math.floor(WORKING_HOURS * emailsPerDomainPerHour * DOMAIN_COUNT)

    // Build schedule for the next 7 days
    const DAYS_TO_SHOW = 7
    const weekSchedule: Array<{
      date: string
      dayLabel: string
      dayOfWeek: string
      queued: number
      sent: number
      capacity: number
      remaining: number
      remainingHours?: number
      isToday: boolean
    }> = []

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    for (let dayOffset = 0; dayOffset < DAYS_TO_SHOW; dayOffset++) {
      // Calculate the date for this day
      const dayDate = new Date(year, month, day)
      dayDate.setDate(dayDate.getDate() + dayOffset)
      
      const dayStart = createDateInTimezone(
        dayDate.getFullYear(),
        dayDate.getMonth(),
        dayDate.getDate(),
        0, 0, 0
      )
      const dayEnd = createDateInTimezone(
        dayDate.getFullYear(),
        dayDate.getMonth(),
        dayDate.getDate(),
        23, 59, 59
      )

      // Count emails queued for this day
      const { count: queuedCount } = await supabase
        .from('email_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'queued')
        .gte('scheduled_for', dayStart.toISOString())
        .lt('scheduled_for', dayEnd.toISOString())

      // Count emails sent on this day (only for today)
      let sentCount = 0
      if (dayOffset === 0) {
        const { count } = await supabase
          .from('email_queue')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sent')
          .gte('sent_at', dayStart.toISOString())
          .lt('sent_at', dayEnd.toISOString())
        sentCount = count || 0
      }

      // Calculate capacity for this day
      let dayCapacity = MAX_DAILY_CAPACITY
      let remainingHours: number | undefined = undefined

      if (dayOffset === 0) {
        // Today - calculate based on current hour
        if (hour < WORKING_HOUR_START) {
          dayCapacity = MAX_DAILY_CAPACITY
          remainingHours = WORKING_HOURS
        } else if (hour >= WORKING_HOUR_END) {
          dayCapacity = 0
          remainingHours = 0
        } else {
          remainingHours = WORKING_HOUR_END - hour
          dayCapacity = Math.floor(remainingHours * emailsPerDomainPerHour * DOMAIN_COUNT)
        }
      }

      // Format date for display
      const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`
      const dayOfWeek = dayNames[dayDate.getDay()]
      
      // Create day label
      let dayLabel: string
      if (dayOffset === 0) {
        dayLabel = 'Today'
      } else if (dayOffset === 1) {
        dayLabel = 'Tomorrow'
      } else {
        dayLabel = `${dayOfWeek} ${dayDate.getDate()}`
      }

      const usedCapacity = dayOffset === 0 ? sentCount + (queuedCount || 0) : (queuedCount || 0)

      weekSchedule.push({
        date: dateStr,
        dayLabel,
        dayOfWeek,
        queued: queuedCount || 0,
        sent: sentCount,
        capacity: dayCapacity,
        remaining: Math.max(0, dayCapacity - usedCapacity),
        remainingHours,
        isToday: dayOffset === 0,
      })
    }

    // Extract today and tomorrow for backwards compatibility
    const today = weekSchedule[0]
    const tomorrow = weekSchedule[1]

    return NextResponse.json({
      status: campaignStatus,
      total: totalCount || 0,
      queued,
      sent,
      failed,
      processing,
      lastUpdated,
      recentActivity: recentSent || [],
      recentFailures: recentFailures || [],
      nextScheduled,
      sendingRate: {
        lastHour: sentLastHour || 0,
        perMinute: sentLastHour ? Math.round((sentLastHour || 0) / 60 * 10) / 10 : 0,
      },
      domainDistribution,
      weekSchedule,
      today: {
        queued: today.queued,
        sent: today.sent,
        capacity: today.capacity,
        remaining: today.remaining,
        remainingMinutes: (today.remainingHours || 0) * 60,
        remainingHours: today.remainingHours || 0,
      },
      tomorrow: {
        queued: tomorrow.queued,
        capacity: tomorrow.capacity,
        remaining: tomorrow.remaining,
      },
    })

  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

