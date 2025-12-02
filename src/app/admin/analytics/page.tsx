'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AnalyticsDisplay from '@/components/admin/AnalyticsDisplay'
import SiteMetricsCards from '@/components/admin/SiteMetricsCards'

interface AdminUser {
  id: string
  email: string
  role: string
}

interface Listing {
  listing_slug: string
  hostname?: string
}

interface AdminData {
  user: AdminUser
  listings: Listing[]
}

interface EmailStat {
  email: string
  lastWeek: number
  thisWeek: number
}

interface AnalyticsData {
  eventType: string
  lastWeek: number
  thisWeek: number
  change: number
  emails: EmailStat[]
}

interface SiteMetrics {
  thisWeekSignups: number
  lastWeekSignups: number
  netChangeUsers: number
  currentAuthedUsers: number
  userGrowthRate: string
  currentWeekStart?: string
  currentWeekEnd?: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AdminData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [siteMetrics, setSiteMetrics] = useState<SiteMetrics | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/me')
        if (response.ok) {
          const adminData = await response.json()
          setData(adminData)
          
          // Set initial selectedSlug based on user role
          if (adminData.user.role === 'internal_admin') {
            setSelectedSlug(null) // Site-wide view
          } else if (adminData.listings.length === 1) {
            setSelectedSlug(adminData.listings[0].listing_slug)
          } else if (adminData.listings.length > 1) {
            setSelectedSlug(adminData.listings[0].listing_slug)
          }
        } else {
          if (response.status === 401) {
            router.push('/admin/login')
            return
          }
          setError('Failed to load admin data')
        }
      } catch (err) {
        setError('Network error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  useEffect(() => {
    if (!data || selectedSlug === undefined) return

    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true)
      try {
        const url = selectedSlug 
          ? `/api/analytics/summary?slug=${encodeURIComponent(selectedSlug)}`
          : '/api/analytics/summary'
        
        const response = await fetch(url)
        if (response.ok) {
          const analyticsResponse = await response.json()
          setAnalyticsData(analyticsResponse.analytics || [])
          setSiteMetrics(analyticsResponse.siteMetrics || null)
        } else {
          console.error('Failed to fetch analytics:', response.statusText)
          setAnalyticsData([])
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setAnalyticsData([])
      } finally {
        setIsLoadingAnalytics(false)
      }
    }

    fetchAnalytics()
  }, [data, selectedSlug])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const getPageTitle = () => {
    if (!selectedSlug) return 'Site-Wide Analytics'
    const listing = data?.listings.find(l => l.listing_slug === selectedSlug)
    return `Analytics for ${listing?.listing_slug || selectedSlug}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome, {data?.user.email}
              </p>
            </div>
            <div className="flex space-x-3">
              {/* <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Dashboard
              </a> */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* View Selection Dropdown */}
        {data && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <label htmlFor="view-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select View
                </label>
                <select
                  id="view-select"
                  value={selectedSlug || ''}
                  onChange={(e) => setSelectedSlug(e.target.value || null)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {data.user.role === 'internal_admin' && (
                    <option value="">Site-Wide Analytics</option>
                  )}
                  {data.listings.map((listing) => (
                    <option key={listing.listing_slug} value={listing.listing_slug}>
                      {listing.listing_slug}
                      {listing.hostname && ` (${listing.hostname})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Site Metrics Cards - Only show for site-wide analytics */}
        {!selectedSlug && siteMetrics && (
          <div className="px-4 py-6 sm:px-0">
            <SiteMetricsCards metrics={siteMetrics} />
          </div>
        )}

        {/* Analytics Display */}
        <div className="px-4 py-6 sm:px-0">
          <AnalyticsDisplay 
            data={analyticsData} 
            isLoading={isLoadingAnalytics} 
          />
        </div>
      </div>
    </div>
  )
} 