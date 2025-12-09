import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

// Domain configuration (same as upload route)
const DOMAIN_CONFIG = [
  { domain: 'connect-ozlistings.com', sender_name: 'jeff' },
  { domain: 'engage-ozlistings.com', sender_name: 'jeffrey' },
  { domain: 'get-ozlistings.com', sender_name: 'jeff.richmond' },
  { domain: 'join-ozlistings.com', sender_name: 'jeff.r' },
  { domain: 'outreach-ozlistings.com', sender_name: 'jeffrey.r' },
  { domain: 'ozlistings-reach.com', sender_name: 'jeff' },
  { domain: 'reach-ozlistings.com', sender_name: 'jeffrey' },
];

const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';
const WORKING_HOUR_START = 9;
const WORKING_HOUR_END = 17;
const INTERVAL_MINUTES = 3.5;
const JITTER_SECONDS_MAX = 30;

function getCurrentTimeInTimezone() {
  const now = new Date();
  const zonedTime = toZonedTime(now, TIMEZONE);
  return {
    year: zonedTime.getFullYear(),
    month: zonedTime.getMonth(),
    day: zonedTime.getDate(),
    hour: zonedTime.getHours(),
    minute: zonedTime.getMinutes(),
    second: zonedTime.getSeconds(),
  };
}

function createDateInTimezone(year: number, month: number, day: number, hour: number, minute: number, second: number): Date {
  const localDate = new Date(year, month, day, hour, minute, second);
  return fromZonedTime(localDate, TIMEZONE);
}

function getStartTimeInTimezone() {
  const now = getCurrentTimeInTimezone();
  const { year, month, day, hour } = now;
  
  if (hour < WORKING_HOUR_START) {
    return createDateInTimezone(year, month, day, WORKING_HOUR_START, 0, 0);
  } else if (hour >= WORKING_HOUR_END) {
    const tomorrow = new Date(year, month, day);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return createDateInTimezone(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), WORKING_HOUR_START, 0, 0);
  } else {
    return createDateInTimezone(year, month, day, hour, now.minute, now.second);
  }
}

function get5pmBoundary(utcDate: Date): Date {
  const zonedTime = toZonedTime(utcDate, TIMEZONE);
  return createDateInTimezone(zonedTime.getFullYear(), zonedTime.getMonth(), zonedTime.getDate(), WORKING_HOUR_END, 0, 0);
}

function getNext9am(utcDate: Date): Date {
  const zonedTime = toZonedTime(utcDate, TIMEZONE);
  const nextDay = new Date(zonedTime.getFullYear(), zonedTime.getMonth(), zonedTime.getDate());
  nextDay.setDate(nextDay.getDate() + 1);
  return createDateInTimezone(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), WORKING_HOUR_START, 0, 0);
}

function adjustToWorkingHours(candidateTime: Date): Date {
  const boundary5pm = get5pmBoundary(candidateTime);
  if (candidateTime >= boundary5pm) {
    return getNext9am(candidateTime);
  }
  return candidateTime;
}

// POST /api/campaigns/:id/launch
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await request.json().catch(() => ({}));
    const { emailIds, all = true } = body;

    const supabase = createAdminClient();

    // 1. Verify campaign exists and is in correct state
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!['staged', 'draft'].includes(campaign.status)) {
      return NextResponse.json(
        { error: 'Campaign must be in staged or draft status to launch' },
        { status: 400 }
      );
    }

    // 2. Get staged emails to approve
    let query = supabase
      .from('email_queue')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'staged')
      .order('created_at', { ascending: true });

    if (!all && emailIds && emailIds.length > 0) {
      query = query.in('id', emailIds);
    }

    const { data: stagedEmails, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!stagedEmails || stagedEmails.length === 0) {
      return NextResponse.json({ error: 'No staged emails to launch' }, { status: 400 });
    }

    // 3. Query ALL existing scheduled emails across ALL campaigns for domain coordination
    const { data: existingSchedules } = await supabase
      .from('email_queue')
      .select('domain_index, scheduled_for')
      .in('status', ['queued', 'processing'])
      .not('scheduled_for', 'is', null)
      .order('scheduled_for', { ascending: false });

    // Build map of last scheduled time per domain
    const domainLastScheduled: Record<number, Date> = {};
    if (existingSchedules) {
      for (const row of existingSchedules) {
        const domainIndex = row.domain_index as number;
        if (!(domainIndex in domainLastScheduled)) {
          domainLastScheduled[domainIndex] = new Date(row.scheduled_for);
        }
      }
    }

    // 4. Calculate scheduling
    const startTimeUTC = getStartTimeInTimezone();
    const intervalMs = INTERVAL_MINUTES * 60 * 1000;
    const domainCurrentTime: Record<number, Date> = {};
    const emailsByDay: Record<string, number> = {};

    const updates = stagedEmails.map((email, index) => {
      const domainIndex = index % DOMAIN_CONFIG.length;
      const domainConfig = DOMAIN_CONFIG[domainIndex];
      const jitterMs = Math.random() * JITTER_SECONDS_MAX * 1000;

      let scheduledFor: Date;

      if (domainIndex in domainLastScheduled && !(domainIndex in domainCurrentTime)) {
        // Has existing scheduled emails from other campaigns
        const lastScheduled = domainLastScheduled[domainIndex];
        scheduledFor = adjustToWorkingHours(new Date(lastScheduled.getTime() + intervalMs + jitterMs));
      } else if (domainIndex in domainCurrentTime) {
        // Has emails in current batch
        scheduledFor = adjustToWorkingHours(new Date(domainCurrentTime[domainIndex].getTime() + intervalMs + jitterMs));
      } else {
        // First email for this domain
        scheduledFor = new Date(startTimeUTC.getTime());
      }

      domainCurrentTime[domainIndex] = scheduledFor;
      domainLastScheduled[domainIndex] = scheduledFor;

      // Track emails by day
      const zonedTime = toZonedTime(scheduledFor, TIMEZONE);
      const dayKey = `${zonedTime.getFullYear()}-${String(zonedTime.getMonth() + 1).padStart(2, '0')}-${String(zonedTime.getDate()).padStart(2, '0')}`;
      emailsByDay[dayKey] = (emailsByDay[dayKey] || 0) + 1;

      return {
        id: email.id,
        status: 'queued',
        domain_index: domainIndex,
        from_email: `${domainConfig.sender_name}@${domainConfig.domain}`,
        scheduled_for: scheduledFor.toISOString(),
      };
    });

    // 5. Bulk update emails
    for (const update of updates) {
      await supabase
        .from('email_queue')
        .update({
          status: update.status,
          domain_index: update.domain_index,
          from_email: update.from_email,
          scheduled_for: update.scheduled_for,
        })
        .eq('id', update.id);
    }

    // 6. Update campaign status
    await supabase
      .from('campaigns')
      .update({
        status: 'scheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    // 7. Calculate response stats
    const lastScheduledTime = Object.values(domainLastScheduled)
      .reduce((latest, time) => time > latest ? time : latest, startTimeUTC);

    return NextResponse.json({
      success: true,
      queued: updates.length,
      scheduling: {
        timezone: TIMEZONE,
        intervalMinutes: INTERVAL_MINUTES,
        startTimeUTC: startTimeUTC.toISOString(),
        estimatedEndTimeUTC: lastScheduledTime.toISOString(),
        emailsByDay,
        totalDays: Object.keys(emailsByDay).length,
      },
    });
  } catch (error) {
    console.error('POST /api/campaigns/:id/launch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
