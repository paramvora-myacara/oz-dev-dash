'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Mail, RefreshCw, Calendar, Users } from 'lucide-react'
import { getCampaigns, deleteCampaign, getGlobalStatus } from '@/lib/api/campaigns-backend'
import { getStatusLabel, getStatusColor } from '@/lib/utils/status-labels'
import { Button } from '@/components/ui/button'
import type { Campaign } from '@/types/email-editor'

interface WeekDay {
    date: string
    dayLabel: string
    dayOfWeek: string
    queued: number
    projected?: number
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

export function CampaignsTab() {
    const router = useRouter()
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
            const data = await getGlobalStatus()
            // Transform backend response to match expected format
            setCampaignStatus({
                status: 'sending',
                total: Object.values(data.emails || {}).reduce((sum: number, count: any) => sum + (count || 0), 0),
                queued: data.emails?.queued || 0,
                sent: data.emails?.sent || 0,
                failed: data.emails?.failed || 0,
                weekSchedule: data.weekSchedule || [],
            })
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
            await fetchCampaignStatus()
        } catch (err: any) {
            alert('Failed to delete campaign: ' + err.message)
        } finally {
            setDeletingId(null)
        }
    }

    const getCapacityPercentage = (used: number, capacity: number) => {
        return capacity > 0 ? Math.round((used / capacity) * 100) : 0
    }

    if (loading && !isRefreshing) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium text-gray-500">Loading campaigns…</p>
                </div>
            </div>
        )
    }

    const weekSchedule = campaignStatus?.weekSchedule || []

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg text-gray-900">Campaign Management</h3>
                </div>
                <div className="flex gap-2">
                    <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 font-medium rounded-md">
                        <Link href="/admin/campaigns/new">
                            <Plus className="w-4 h-4 mr-2" />
                            New Campaign
                        </Link>
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Recent Campaigns */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-xs">Recent Campaigns</h2>
                        <Button variant="ghost" size="sm" onClick={loadCampaigns} className="h-8 w-8 p-0">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    {campaigns.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
                            <Mail className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium text-sm text-gray-500">No campaigns found</p>
                            <Button variant="link" size="sm" asChild className="mt-2">
                                <Link href="/admin/campaigns/new">Create your first campaign</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-slate-50/30 border-b">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Size</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {campaigns.slice(0, 10).map((campaign) => (
                                        <tr
                                            key={campaign.id}
                                            className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                                            onClick={(e) => {
                                                if ((e.target as HTMLElement).closest('button')) return
                                                router.push(`/admin/campaigns/${campaign.id}`)
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {campaign.name}
                                                    </span>
                                                    {campaign.entryStepId && (
                                                        <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-purple-50 text-purple-700 rounded border border-purple-100">
                                                            Sequence
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getStatusColor(campaign.status).includes('bg-green') ? 'bg-green-50 text-green-700 border-green-100' : getStatusColor(campaign.status).includes('bg-blue') ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {getStatusLabel(campaign.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                                                {campaign.totalRecipients.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(campaign.id)
                                                    }}
                                                    className="h-8 w-8 p-0 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg group-hover:opacity-100"
                                                    disabled={deletingId === campaign.id}
                                                >
                                                    <Trash2 size={14} className={deletingId === campaign.id ? 'animate-pulse' : ''} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right: Days Scheduled */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-xs">7-Day Schedule</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchCampaignStatus}
                            disabled={isRefreshing}
                            className="h-8 text-xs font-medium uppercase tracking-wide text-gray-500"
                        >
                            <RefreshCw size={12} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    <div className="p-6 flex-1">
                        {weekSchedule.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {weekSchedule.map((day) => {
                                    const usedCapacity = day.isToday
                                        ? day.sent + day.queued + (day.projected || 0)
                                        : day.queued + (day.projected || 0)
                                    const percentage = getCapacityPercentage(usedCapacity, day.capacity)
                                    const isWeekend = (day.dayOfWeek || '').toLowerCase().startsWith('sat') || (day.dayOfWeek || '').toLowerCase().startsWith('sun')

                                    return (
                                        <div
                                            key={day.date}
                                            className={`rounded-xl p-3 border transition-all ${isWeekend
                                                ? 'bg-slate-50/50 border-slate-100 opacity-60'
                                                : day.isToday
                                                    ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-100'
                                                    : day.queued > 0
                                                        ? 'bg-indigo-50/30 border-indigo-100'
                                                        : 'bg-white border-slate-100'
                                                }`}
                                        >
                                            <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-gray-400">
                                                {day.dayLabel}
                                            </div>
                                            <div className="text-xl font-bold text-gray-900 leading-none">
                                                {day.queued.toLocaleString()}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-1">
                                                queued
                                            </div>

                                            {day.isToday && day.sent > 0 && (
                                                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mt-1">
                                                    {day.sent} sent
                                                </div>
                                            )}

                                            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${isWeekend
                                                        ? 'bg-slate-300'
                                                        : percentage >= 90
                                                            ? 'bg-red-500'
                                                            : percentage >= 70
                                                                ? 'bg-yellow-500'
                                                                : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                                                        }`}
                                                    style={{ width: `${Math.min(100, percentage)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center mt-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                                                <span>{percentage}% cap</span>
                                                <span>{usedCapacity}/{day.capacity}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                                <Calendar size={32} className="opacity-20 mb-3" />
                                <p className="text-xs font-medium text-gray-400 text-center">No emails scheduled</p>
                            </div>
                        )}

                        {/* Summary Stats */}
                        {campaignStatus && (
                            <div className="mt-8 grid grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Weekly Vol</div>
                                    <div className="text-xl font-bold text-gray-900">{campaignStatus.total.toLocaleString()}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Queued</div>
                                    <div className="text-xl font-bold text-gray-900">{campaignStatus.queued.toLocaleString()}</div>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-center">
                                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">Sent</div>
                                    <div className="text-xl font-bold text-emerald-700">{campaignStatus.sent.toLocaleString()}</div>
                                </div>
                                <div className={`rounded-lg p-4 border text-center ${campaignStatus.failed > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${campaignStatus.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>Failed</div>
                                    <div className={`text-xl font-bold ${campaignStatus.failed > 0 ? 'text-red-700' : 'text-gray-900'}`}>{campaignStatus.failed.toLocaleString()}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
