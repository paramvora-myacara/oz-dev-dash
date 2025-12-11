'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Eye, Mail, RefreshCw, Calendar } from 'lucide-react'
import { getCampaigns, deleteCampaign } from '@/lib/api/campaigns'
import { getStatusLabel, getStatusColor } from '@/lib/utils/status-labels'
import type { Campaign } from '@/types/email-editor'

interface WeekDay {
  date: string
  dayLabel: string
  dayOfWeek: string
  queued: number
  sent: number
  capacity: number
  remaining: number
  remainingHours?: number
  isToday: boolean
}

interface CampaignStatusData {
  status: 'sending' | 'completed' | 'paused'
  total: number
  queued: number
  sent: number
  failed: number
  weekSchedule?: WeekDay[]
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatusData | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadCampaigns()
    fetchCampaignStatus()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const data = await getCampaigns()
      setCampaigns(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaignStatus = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/campaigns/status')
      if (response.ok) {
        const data = await response.json()
        setCampaignStatus(data)
      }
    } catch (error) {
      console.error('Error fetching campaign status:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This will also delete all associated emails.')) {
      return
    }

    try {
      setDeletingId(id)
      await deleteCampaign(id)
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      alert('Failed to delete campaign: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const getCapacityColor = (used: number, capacity: number) => {
    const percentage = capacity > 0 ? (used / capacity) * 100 : 0
    if (percentage >= 90) return 'bg-red-100 border-red-300 text-red-800'
    if (percentage >= 70) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    return 'bg-green-100 border-green-300 text-green-800'
  }

  const getCapacityPercentage = (used: number, capacity: number) => {
    return capacity > 0 ? Math.round((used / capacity) * 100) : 0
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading campaigns...</div>
      </div>
    )
  }

  const weekSchedule = campaignStatus?.weekSchedule || []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Campaigns</h1>
        <Link
          href="/admin/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Campaign
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Campaigns */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail size={48} className="mx-auto mb-4 opacity-50" />
              <p>No campaigns yet. Create your first campaign to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.slice(0, 10).map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/admin/campaigns/${campaign.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {getStatusLabel(campaign.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {campaign.totalRecipients}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/campaigns/${campaign.id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="View/Edit"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                            disabled={deletingId === campaign.id}
                            aria-label="Delete campaign"
                          >
                            <Trash2 size={16} className={deletingId === campaign.id ? 'animate-pulse' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Days Scheduled */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">7-Day Schedule</h2>
            </div>
            <button
              onClick={fetchCampaignStatus}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="p-6">
            {weekSchedule.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {weekSchedule.map((day) => {
                  const usedCapacity = day.isToday ? day.sent + day.queued : day.queued
                  const percentage = getCapacityPercentage(usedCapacity, day.capacity)

                  return (
                    <div
                      key={day.date}
                      className={`rounded-lg p-3 border ${day.isToday
                          ? getCapacityColor(usedCapacity, day.capacity)
                          : day.queued > 0
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="text-xs font-medium uppercase tracking-wider mb-1 opacity-75">
                        {day.dayLabel}
                      </div>
                      <div className="text-lg font-bold">
                        {day.queued.toLocaleString()}
                      </div>
                      <div className="text-xs opacity-75">
                        queued
                      </div>
                      {day.isToday && day.sent > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          {day.sent} sent
                        </div>
                      )}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${percentage >= 90
                              ? 'bg-red-500'
                              : percentage >= 70
                                ? 'bg-yellow-500'
                                : day.queued > 0
                                  ? 'bg-indigo-500'
                                  : 'bg-gray-300'
                            }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs opacity-60 mt-1">
                        {usedCapacity}/{day.capacity}
                      </div>
                      {day.isToday && day.remainingHours !== undefined && day.remainingHours > 0 && (
                        <div className="text-xs opacity-60">
                          {day.remainingHours}h left
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No scheduled emails. Upload a CSV in the email campaigns section to get started.</p>
              </div>
            )}

            {/* Summary Stats */}
            {campaignStatus && (
              <div className="mt-6 grid grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Total</div>
                  <div className="text-lg font-bold text-gray-900">{campaignStatus.total.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Queued</div>
                  <div className="text-lg font-bold text-gray-900">{campaignStatus.queued.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                  <div className="text-xs font-medium text-green-700 uppercase mb-1">Sent</div>
                  <div className="text-lg font-bold text-green-600">{campaignStatus.sent.toLocaleString()}</div>
                </div>
                <div className={`rounded-lg p-3 border text-center ${campaignStatus.failed > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-xs font-medium uppercase mb-1 ${campaignStatus.failed > 0 ? 'text-red-700' : 'text-gray-500'}`}>Failed</div>
                  <div className={`text-lg font-bold ${campaignStatus.failed > 0 ? 'text-red-600' : 'text-gray-900'}`}>{campaignStatus.failed.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
