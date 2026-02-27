'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Users,
  BarChart3,
  Mail,
  Linkedin,
  LogOut,
  TrendingUp,
  UserPlus,
  PhoneCall
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  role: string
}

interface AdminData {
  user: AdminUser
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

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [siteMetrics, setSiteMetrics] = useState<SiteMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/me')
        if (response.ok) {
          const adminData = await response.json()
          setData(adminData)
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

    fetchAdminData()
  }, [router])

  useEffect(() => {
    if (!data) return

    const fetchMetrics = async () => {
      setIsLoadingMetrics(true)
      try {
        const response = await fetch('/api/analytics/summary')
        if (response.ok) {
          const result = await response.json()
          setSiteMetrics(result.siteMetrics || null)
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err)
      } finally {
        setIsLoadingMetrics(false)
      }
    }

    fetchMetrics()
  }, [data])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-[250px]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-red-500 font-medium">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-slate-900 border-zinc-200 dark:text-slate-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Admin Dashboard</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Welcome back, {data?.user.email} <span className="opacity-60 text-sm ml-2 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800">{data?.user.role}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900/50" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Top-Level Stats / Metrics */}
        {data?.user.role === 'internal_admin' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingMetrics ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{siteMetrics?.currentAuthedUsers.toLocaleString() ?? 0}</div>
                      <p className="text-xs text-zinc-500 mt-1">
                        All registered users on platform
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">New Signups</CardTitle>
                  <UserPlus className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingMetrics ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${siteMetrics && siteMetrics.thisWeekSignups > 0 ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {siteMetrics?.thisWeekSignups.toLocaleString() ?? 0}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {siteMetrics?.currentWeekStart && siteMetrics?.currentWeekEnd ?
                          `This week (${new Date(siteMetrics.currentWeekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(siteMetrics.currentWeekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` :
                          'This week'
                        }
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Weekly Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingMetrics ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${(siteMetrics?.userGrowthRate && parseFloat(siteMetrics.userGrowthRate) >= 0) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {siteMetrics?.userGrowthRate && parseFloat(siteMetrics.userGrowthRate) >= 0 ? '+' : ''}
                        {siteMetrics?.userGrowthRate ?? '0'}%
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Signup change from last week
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* Navigation & Tools */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Applications & Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Link href="/admin/linkedin" className="block focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl transition-transform hover:-translate-y-1">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                    <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">LinkedIn Outreach</CardTitle>
                  <CardDescription>Manage daily batches, family offices, and automated queuing.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/campaigns" className="block focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded-xl transition-transform hover:-translate-y-1">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Email Campaigns</CardTitle>
                  <CardDescription>Send, track, and analyze bulk email campaigns.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/prospects" className="block focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded-xl transition-transform hover:-translate-y-1">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-violet-500">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-2">
                    <PhoneCall className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <CardTitle className="text-lg">Call Log</CardTitle>
                  <CardDescription>View, call, and manage developer prospects systematically.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/analytics" className="block focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-xl transition-transform hover:-translate-y-1">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-amber-500">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                    <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-lg">Detailed Analytics</CardTitle>
                  <CardDescription>Dive deep into pageviews, interactions, and conversion stats.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

          </div>
        </div>

      </div>
    </div>
  )
}