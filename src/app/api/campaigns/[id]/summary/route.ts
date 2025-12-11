import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'

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

    const { data: nextQueuedRow } = await supabase
      .from('email_queue')
      .select('scheduled_for')
      .eq('campaign_id', campaignId)
      .eq('status', 'queued')
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .single()

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
    })
  } catch (error) {
    console.error('GET /api/campaigns/:id/summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
