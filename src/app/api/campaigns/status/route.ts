import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'

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

    return NextResponse.json({
      status: campaignStatus,
      total: totalCount || 0,
      queued,
      sent,
      failed,
      processing,
      lastUpdated,
    })

  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

