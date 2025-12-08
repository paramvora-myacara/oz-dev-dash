'use client'

interface RecentActivity {
  id: number
  to_email: string
  sent_at?: string
  status?: string
  error_message?: string
}

interface RecentFailure {
  id: number
  to_email: string
  error_message?: string
  created_at?: string
}

interface NextScheduled {
  id: number
  to_email: string
  scheduled_for: string
  scheduled_for_display?: string
  timezone?: string
  domain_index: number
}

interface DayCapacity {
  queued: number
  sent?: number
  capacity: number
  remaining: number
  remainingMinutes?: number
  remainingHours?: number
}

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
  processing?: number
  lastUpdated?: string
  recentActivity?: RecentActivity[]
  recentFailures?: RecentFailure[]
  nextScheduled?: NextScheduled[]
  sendingRate?: {
    lastHour: number
    perMinute: number
  }
  domainDistribution?: Record<number, number>
  today?: DayCapacity
  tomorrow?: DayCapacity
  weekSchedule?: WeekDay[]
}

interface CampaignStatusProps {
  data: CampaignStatusData | null
  onRefresh: () => void
  isLoading?: boolean
}

export default function CampaignStatus({ 
  data, 
  onRefresh, 
  isLoading = false
}: CampaignStatusProps) {

  if (!data) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <p className="text-gray-500 text-center">No active campaign. Upload a CSV to get started.</p>
      </div>
    )
  }

  const { 
    status, 
    total, 
    queued, 
    sent, 
    failed, 
    processing = 0,
    lastUpdated,
    recentActivity = [],
    recentFailures = [],
    nextScheduled = [],
    sendingRate,
    domainDistribution = {},
    today,
    tomorrow,
    weekSchedule = []
  } = data
  const sentPercentage = total > 0 ? Math.round((sent / total) * 100) : 0

  const getCapacityColor = (used: number, capacity: number) => {
    const percentage = capacity > 0 ? (used / capacity) * 100 : 0
    if (percentage >= 90) return 'bg-red-100 border-red-300 text-red-800'
    if (percentage >= 70) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    return 'bg-green-100 border-green-300 text-green-800'
  }

  const getCapacityPercentage = (used: number, capacity: number) => {
    return capacity > 0 ? Math.round((used / capacity) * 100) : 0
  }

  const getStatusBadge = () => {
    const statusConfig = {
      sending: { label: 'Sending', color: 'bg-green-100 text-green-800', icon: '🟢' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
      paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', icon: '⏸️' },
    }
    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span className="mr-2">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Campaign Status</h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              🔄 Refresh
            </>
          )}
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        {getStatusBadge()}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{sent} of {total} sent ({sentPercentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${sentPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Week Schedule */}
      {weekSchedule.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">7-Day Schedule (9am-5pm)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {weekSchedule.map((day) => {
              const usedCapacity = day.isToday ? day.sent + day.queued : day.queued
              const percentage = getCapacityPercentage(usedCapacity, day.capacity)
              
              return (
                <div
                  key={day.date}
                  className={`rounded-lg p-3 border ${
                    day.isToday 
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
                      className={`h-1.5 rounded-full transition-all ${
                        percentage >= 90
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
        </div>
      )}

      {/* Fallback: Today & Tomorrow Cards (if weekSchedule not available) */}
      {weekSchedule.length === 0 && (today || tomorrow) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {today && (
            <div className={`rounded-lg p-4 border ${getCapacityColor((today.sent || 0) + today.queued, today.capacity)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-medium uppercase tracking-wider mb-1">Today</div>
                  <div className="text-2xl font-bold">{today.queued.toLocaleString()} queued</div>
                  {today.sent !== undefined && <div className="text-sm mt-1">{today.sent.toLocaleString()} sent</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75 mb-1">Capacity</div>
                  <div className="text-lg font-bold">{((today.sent || 0) + today.queued).toLocaleString()} / {today.capacity.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
          {tomorrow && (
            <div className={`rounded-lg p-4 border ${getCapacityColor(tomorrow.queued, tomorrow.capacity)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-medium uppercase tracking-wider mb-1">Tomorrow</div>
                  <div className="text-2xl font-bold">{tomorrow.queued.toLocaleString()} queued</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75 mb-1">Capacity</div>
                  <div className="text-lg font-bold">{tomorrow.queued.toLocaleString()} / {tomorrow.capacity.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Queued */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            Queued
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {queued.toLocaleString()}
          </div>
        </div>

        {/* Processing */}
        {processing > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm font-medium text-blue-700 uppercase tracking-wider mb-1">
              Processing
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {processing.toLocaleString()}
            </div>
          </div>
        )}

        {/* Sent */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-700 uppercase tracking-wider mb-1">
            Sent
          </div>
          <div className="text-2xl font-bold text-green-600">
            {sent.toLocaleString()}
          </div>
          {sendingRate && sendingRate.lastHour > 0 && (
            <div className="text-xs text-green-600 mt-1">
              {sendingRate.lastHour} in last hour ({sendingRate.perMinute}/min)
            </div>
          )}
        </div>

        {/* Failed */}
        <div className={`rounded-lg p-4 border ${failed > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`text-sm font-medium uppercase tracking-wider mb-1 ${failed > 0 ? 'text-red-700' : 'text-gray-500'}`}>
            Failed
          </div>
          <div className={`text-2xl font-bold ${failed > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {failed.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Domain Distribution */}
      {Object.keys(domainDistribution).length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Queued by Domain</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(domainDistribution).map(([domainIndex, count]) => (
              <span key={domainIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Domain {domainIndex}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next Scheduled Emails */}
      {nextScheduled.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Next Scheduled (Upcoming)</h3>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-h-32 overflow-y-auto">
            <div className="space-y-1">
              {nextScheduled.map((item) => (
                <div key={item.id} className="text-xs text-gray-600 flex justify-between">
                  <span className="truncate flex-1">{item.to_email}</span>
                  <span className="ml-2 text-gray-500">
                    {item.scheduled_for_display || new Date(item.scheduled_for).toLocaleTimeString()}
                    {item.timezone ? ` (${item.timezone.split('/').pop()})` : ''} (D{item.domain_index})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity (Last 10 Sent)</h3>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200 max-h-40 overflow-y-auto">
            <div className="space-y-1">
              {recentActivity.map((item) => (
                <div key={item.id} className="text-xs text-gray-700 flex justify-between items-center">
                  <span className="truncate flex-1">{item.to_email}</span>
                  <span className="ml-2 text-green-600">
                    {item.sent_at ? new Date(item.sent_at).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Failures */}
      {recentFailures.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-red-700 mb-2">Recent Failures</h3>
          <div className="bg-red-50 rounded-lg p-3 border border-red-200 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {recentFailures.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="text-red-700 font-medium">{item.to_email}</div>
                  {item.error_message && (
                    <div className="text-red-600 mt-0.5 truncate">{item.error_message}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  )
}



