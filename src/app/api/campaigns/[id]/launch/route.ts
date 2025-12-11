import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { toZonedTime } from 'date-fns-tz';
import { adjustToWorkingHours, getStartTimeInTimezone, ScheduleConfig } from '@/lib/scheduling';

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
const SCHEDULING_CONFIG: ScheduleConfig = {
  timezone: TIMEZONE,
  workingHourStart: WORKING_HOUR_START,
  workingHourEnd: WORKING_HOUR_END,
  skipWeekends: true,
};

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

    // 2. Get staged emails to approve (paged to avoid 1k caps)
    const countQuery = supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'staged');

    if (!all && emailIds && emailIds.length > 0) {
      countQuery.in('id', emailIds);
    }

    const { count: stagedCount, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const totalStaged = stagedCount || 0;

    if (totalStaged === 0) {
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
    const startTimeUTC = getStartTimeInTimezone(SCHEDULING_CONFIG);
    const intervalMs = INTERVAL_MINUTES * 60 * 1000;
    const domainCurrentTime: Record<number, Date> = {};
    const emailsByDay: Record<string, number> = {};
    const PAGE_SIZE = 500;
    let roundRobinIndex = 0;
    let totalQueued = 0;

    for (let offset = 0; offset < totalStaged; offset += PAGE_SIZE) {
      const end = Math.min(offset + PAGE_SIZE - 1, totalStaged - 1);
      let pageQuery = supabase
        .from('email_queue')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('status', 'staged')
        .order('created_at', { ascending: true })
        .range(offset, end);

      if (!all && emailIds && emailIds.length > 0) {
        pageQuery = pageQuery.in('id', emailIds);
      }

      const { data: stagedEmails, error: fetchError } = await pageQuery;

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      if (!stagedEmails || stagedEmails.length === 0) {
        continue;
      }

      const updates = stagedEmails.map((email) => {
        const existingDomainIndex = email.domain_index as number | null;
        const domainIndex = existingDomainIndex ?? (roundRobinIndex++ % DOMAIN_CONFIG.length);
        const domainConfig = DOMAIN_CONFIG[domainIndex];
        const jitterMs = Math.random() * JITTER_SECONDS_MAX * 1000;

        let scheduledFor: Date;

        if (domainIndex in domainLastScheduled && !(domainIndex in domainCurrentTime)) {
          // Has existing scheduled emails from other campaigns
          const lastScheduled = domainLastScheduled[domainIndex];
          scheduledFor = adjustToWorkingHours(new Date(lastScheduled.getTime() + intervalMs + jitterMs), SCHEDULING_CONFIG);
        } else if (domainIndex in domainCurrentTime) {
          // Has emails in current batch (across pages)
          scheduledFor = adjustToWorkingHours(new Date(domainCurrentTime[domainIndex].getTime() + intervalMs + jitterMs), SCHEDULING_CONFIG);
        } else {
          // First email for this domain
          scheduledFor = adjustToWorkingHours(new Date(startTimeUTC.getTime() + jitterMs), SCHEDULING_CONFIG);
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

      // Persist this page
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

      totalQueued += updates.length;
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
      queued: totalQueued,
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
