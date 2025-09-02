import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request: NextRequest) {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const supabase = createAdminClient()

  // Get user's listings for authorization
  const { data: userListings, error: listingsError } = await supabase
    .from('admin_user_listings')
    .select('listing_slug')
    .eq('user_id', user.id)

  if (listingsError) {
    return NextResponse.json({ error: 'Failed to load user listings' }, { status: 500 })
  }

  const userListingSlugs = (userListings || []).map((r: any) => r.listing_slug)

  // Authorization logic
  if (!slug) {
    // Site-wide analytics - only internal admins can access
    if (user.role !== 'internal_admin') {
      return NextResponse.json({ error: 'Forbidden: Site-wide analytics require internal admin access' }, { status: 403 })
    }
  } else {
    // Listing-specific analytics - customers can only access their own listings
    if (user.role === 'customer' && !userListingSlugs.includes(slug)) {
      return NextResponse.json({ error: 'Forbidden: You can only access analytics for your own listings' }, { status: 403 })
    }
  }

  // Calculate time windows
  const now = new Date()
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastWeekEnd = new Date(thisWeekStart.getTime())

  // For site-wide analytics, get additional metrics
  let siteMetrics = null
  if (!slug && user.role === 'internal_admin') {
    // Helper function to get Monday-Sunday week boundaries in PST
    const getWeekBoundaries = (date: Date, offset: number = 0) => {
      // Get current time in PST
      const pstOffset = -8 * 60 * 60 * 1000 // PST is UTC-8 (simplified, doesn't handle DST)
      const pstTime = date.getTime() + pstOffset
      const pstDate = new Date(pstTime)
      
      // Calculate Monday of the week
      const day = pstDate.getUTCDay()
      const diff = pstDate.getUTCDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      
      const monday = new Date(pstDate.getUTCFullYear(), pstDate.getUTCMonth(), diff)
      monday.setUTCDate(monday.getUTCDate() + (offset * 7)) // Offset weeks
      
      const sunday = new Date(monday)
      sunday.setUTCDate(monday.getUTCDate() + 6)
      
      // Convert to UTC timestamps for database queries
      return {
        start: monday.toISOString(),
        end: sunday.toISOString()
      }
    }

    // Get current week (Monday-Sunday) and last week boundaries
    const currentWeek = getWeekBoundaries(now, 0)
    const lastWeek = getWeekBoundaries(now, -1)
    
    console.log('Current week boundaries:', currentWeek)
    console.log('Last week boundaries:', lastWeek)
    
    // Get users created in current week
    const { data: currentWeekUsers, error: currentWeekError } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', currentWeek.start)
      .lte('created_at', currentWeek.end)

    // Get users created in last week
    const { data: lastWeekUsers, error: lastWeekError } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', lastWeek.start)
      .lte('created_at', lastWeek.end)

    console.log('Current week users:', currentWeekUsers?.length || 0)
    console.log('Last week users:', lastWeekUsers?.length || 0)

    if (!currentWeekError && !lastWeekError) {
      const thisWeekSignups = currentWeekUsers?.length || 0
      const lastWeekSignups = lastWeekUsers?.length || 0
      
      console.log('Calculated signups - This week:', thisWeekSignups, 'Last week:', lastWeekSignups)
      
      // Get current total authed users from public.users table
      const { data: publicUsers, error: usersError } = await supabase
        .from('users')
        .select('id, created_at')

      if (!usersError && publicUsers) {
        const totalAuthUsers = publicUsers.length
        
        // Debug: Show some sample user creation dates
        if (publicUsers.length > 0) {
          const sampleDates = publicUsers.slice(0, 5).map(u => u.created_at)
          console.log('Sample user creation dates:', sampleDates)
        }
        
        siteMetrics = {
          thisWeekSignups,
          lastWeekSignups,
          netChangeUsers: thisWeekSignups - lastWeekSignups,
          currentAuthedUsers: totalAuthUsers,
          userGrowthRate: lastWeekSignups > 0 ? ((thisWeekSignups - lastWeekSignups) / lastWeekSignups * 100).toFixed(1) : thisWeekSignups > 0 ? '100' : '0',
          currentWeekStart: currentWeek.start,
          currentWeekEnd: currentWeek.end
        }
        
        console.log('Final siteMetrics:', siteMetrics)
      }
    }
  }

  // Build the query
  let query = supabase
    .from('user_events')
    .select('event_type, created_at')

  // Add listing filter if slug is provided
  if (slug) {
    query = query.eq('metadata->>propertyId', slug)
  }

  const { data: events, error: eventsError } = await query
    .gte('created_at', lastWeekStart.toISOString())
    .lte('created_at', now.toISOString())

  if (eventsError) {
    return NextResponse.json({ error: 'Failed to load analytics data' }, { status: 500 })
  }

  // Process the data
  const eventCounts: { [key: string]: { thisWeek: number; lastWeek: number } } = {}

  events?.forEach((event) => {
    const eventType = event.event_type
    const eventDate = new Date(event.created_at)
    
    if (!eventCounts[eventType]) {
      eventCounts[eventType] = { thisWeek: 0, lastWeek: 0 }
    }

    if (eventDate >= thisWeekStart) {
      eventCounts[eventType].thisWeek++
    } else if (eventDate >= lastWeekStart && eventDate < lastWeekEnd) {
      eventCounts[eventType].lastWeek++
    }
  })

  // Calculate analytics with percentage changes
  const analytics = Object.entries(eventCounts).map(([eventType, counts]) => {
    const { thisWeek, lastWeek } = counts
    const change = lastWeek === 0 ? (thisWeek > 0 ? 1 : 0) : (thisWeek - lastWeek) / lastWeek

    return {
      eventType,
      lastWeek,
      thisWeek,
      change: Math.round(change * 1000) / 1000 // Round to 3 decimal places
    }
  })

  return NextResponse.json({ analytics, siteMetrics })
} 