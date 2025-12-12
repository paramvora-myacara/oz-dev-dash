import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import { checkAndUpdateCompletedCampaign } from '@/lib/campaigns/completion'

// GET /api/campaigns/:id/summary
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId } = await params
    const supabase = createAdminClient()
    const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY

    // Check and update campaign completion status (on-demand check)
    await checkAndUpdateCompletedCampaign(supabase, campaignId)

    // Get campaign name and creation date for constructing SparkPost campaign_id and date range
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('name, created_at, status')
      .eq('id', campaignId)
      .single()

    // Construct SparkPost campaign_id format: "campaign_name - uuid"
    const constructSparkpostCampaignId = (name: string | null, uuid: string): string => {
      if (name) {
        // Sanitize campaign name: remove special chars (same logic as backend)
        const sanitized = name.replace(/[^a-zA-Z0-9\s\-_]/g, '')
        // Truncate to max 25 chars to ensure total length <= 64 bytes
        const truncated = sanitized.length > 25 ? sanitized.substring(0, 25) : sanitized
        return `${truncated} - ${uuid}`
      }
      return uuid
    }

    const sparkpostCampaignId = constructSparkpostCampaignId(campaign?.name || null, campaignId)

    const countForStatus = async (status: string) => {
      const { count } = await supabase
        .from('email_queue')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', status)
      return count || 0
    }

    const [sent, failed, queued, processing, staged] = await Promise.all([
      countForStatus('sent'),
      countForStatus('failed'),
      countForStatus('queued'),
      countForStatus('processing'),
      countForStatus('staged'),
    ])

    const { data: lastSentRow } = await supabase
      .from('email_queue')
      .select('sent_at')
      .eq('campaign_id', campaignId)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    const { data: firstSentRow } = await supabase
      .from('email_queue')
      .select('sent_at')
      .eq('campaign_id', campaignId)
      .eq('status', 'sent')
      .order('sent_at', { ascending: true })
      .limit(1)
      .single()

    const { data: nextQueuedRow } = await supabase
      .from('email_queue')
      .select('scheduled_for')
      .eq('campaign_id', campaignId)
      .eq('status', 'queued')
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .single()

    // Get campaign launch date (when status changed to scheduled/sending) or creation date
    // Check for the earliest scheduled email as a proxy for launch date
    const { data: earliestScheduledRow } = await supabase
      .from('email_queue')
      .select('scheduled_for')
      .eq('campaign_id', campaignId)
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .single()

    // Fetch SparkPost metrics if API key is available and there are sent emails
    let sparkpostMetrics: {
      deliveryRate: number | null
      bounceRate: number | null
      countDelivered: number | null
      countBounced: number | null
    } = {
      deliveryRate: null,
      bounceRate: null,
      countDelivered: null,
      countBounced: null,
    }

    if (SPARKPOST_API_KEY && sent > 0) {
      try {
        // Determine date range: from campaign start (creation/launch) to now
        // Use the earliest of: campaign created_at, earliest scheduled email, or first sent email
        const now = new Date()
        let fromDate: Date
        
        // Priority order:
        // 1. Campaign creation date (when campaign was created)
        // 2. Earliest scheduled email (when campaign was launched)
        // 3. First sent email (when first email was actually sent)
        // 4. Fallback to 30 days ago
        
        if (campaign?.created_at) {
          fromDate = new Date(campaign.created_at)
        } else if (earliestScheduledRow?.scheduled_for) {
          fromDate = new Date(earliestScheduledRow.scheduled_for)
        } else if (firstSentRow?.sent_at) {
          fromDate = new Date(firstSentRow.sent_at)
        } else {
          // Fallback to 30 days ago
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        
        // Ensure we go back at least 1 hour from now to account for SparkPost processing delays
        // But don't go further back than the campaign start
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        if (fromDate > oneHourAgo) {
          fromDate = oneHourAgo
        }
        
        const toDate = now

        // Format dates for SparkPost API (YYYY-MM-DDTHH:MM) in UTC
        const formatDate = (date: Date) => {
          // Convert to UTC for SparkPost API
          const utcDate = new Date(date.toISOString())
          const year = utcDate.getUTCFullYear()
          const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
          const day = String(utcDate.getUTCDate()).padStart(2, '0')
          const hours = String(utcDate.getUTCHours()).padStart(2, '0')
          const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}`
        }

        const fromParam = formatDate(fromDate)
        const toParam = formatDate(toDate)

        // Call SparkPost Metrics API
        const metricsUrl = new URL('https://api.sparkpost.com/api/v1/metrics/deliverability/campaign')
        metricsUrl.searchParams.set('from', fromParam)
        metricsUrl.searchParams.set('to', toParam)
        metricsUrl.searchParams.set('campaigns', sparkpostCampaignId)
        metricsUrl.searchParams.set('metrics', 'count_sent,count_delivered,count_bounce')
        metricsUrl.searchParams.set('timezone', 'UTC') // Explicitly set timezone

        console.log('[summary] Fetching SparkPost metrics', {
          campaignId,
          sparkpostCampaignId,
          dateRange: { 
            from: fromParam, 
            to: toParam,
            fromLocal: fromDate.toISOString(),
            toLocal: toDate.toISOString(),
            durationMinutes: Math.round((toDate.getTime() - fromDate.getTime()) / (60 * 1000)),
            durationDays: Math.round((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000) * 10) / 10,
          },
          dateSources: {
            campaignCreatedAt: campaign?.created_at || null,
            earliestScheduled: earliestScheduledRow?.scheduled_for || null,
            firstSent: firstSentRow?.sent_at || null,
            used: campaign?.created_at ? 'campaign_created_at' : 
                  earliestScheduledRow?.scheduled_for ? 'earliest_scheduled' :
                  firstSentRow?.sent_at ? 'first_sent' : 'fallback_30_days',
          },
          url: metricsUrl.toString().replace(SPARKPOST_API_KEY, '***'),
        })

        const metricsResponse = await fetch(metricsUrl.toString(), {
          headers: {
            Authorization: SPARKPOST_API_KEY,
          },
        })

        console.log('[summary] SparkPost Metrics API response status:', metricsResponse.status)

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          console.log('[summary] SparkPost Metrics API response:', {
            campaignId,
            sparkpostCampaignId,
            totalResults: metricsData.results?.length || 0,
            allResults: metricsData.results,
          })

          // Find the result for this campaign (match by the constructed campaign_id)
          const campaignResult = metricsData.results?.find(
            (r: any) => r.campaign_id === sparkpostCampaignId
          )

          if (campaignResult) {
            const countSent = campaignResult.count_sent || 0
            const countDelivered = campaignResult.count_delivered || 0
            const countBounce = campaignResult.count_bounce || 0

            const deliveryRate = countSent > 0 ? (countDelivered / countSent) * 100 : null
            const bounceRate = countSent > 0 ? (countBounce / countSent) * 100 : null

            sparkpostMetrics = {
              deliveryRate,
              bounceRate,
              countDelivered,
              countBounced: countBounce,
            }

            console.log('[summary] SparkPost metrics calculated:', {
              campaignId,
              sparkpostCampaignId,
              countSent,
              countDelivered,
              countBounce,
              deliveryRate: deliveryRate !== null ? `${deliveryRate.toFixed(2)}%` : 'N/A',
              bounceRate: bounceRate !== null ? `${bounceRate.toFixed(2)}%` : 'N/A',
            })
          } else {
            console.warn('[summary] Campaign result not found in SparkPost response', {
              campaignId,
              sparkpostCampaignId,
              availableCampaignIds: metricsData.results?.map((r: any) => r.campaign_id) || [],
            })
          }
        } else {
          const errorText = await metricsResponse.text()
          console.error('[summary] SparkPost Metrics API error:', {
            campaignId,
            sparkpostCampaignId,
            status: metricsResponse.status,
            statusText: metricsResponse.statusText,
            error: errorText,
          })
        }
      } catch (error) {
        console.error('[summary] Failed to fetch SparkPost metrics:', {
          campaignId,
          sparkpostCampaignId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
      }
    } else {
      if (!SPARKPOST_API_KEY) {
        console.log('[summary] Skipping SparkPost metrics - API key not configured')
      } else if (sent === 0) {
        console.log('[summary] Skipping SparkPost metrics - no sent emails yet', { campaignId })
      }
    }

    return NextResponse.json({
      success: true,
      counts: {
        sent,
        failed,
        queued,
        processing,
        staged,
        total: sent + failed + queued + processing + staged,
      },
      lastSentAt: lastSentRow?.sent_at || null,
      nextScheduledFor: nextQueuedRow?.scheduled_for || null,
      sparkpostMetrics,
    })
  } catch (error) {
    console.error('GET /api/campaigns/:id/summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
