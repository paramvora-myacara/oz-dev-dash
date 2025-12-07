'use client'

interface CampaignStatusData {
  status: 'sending' | 'completed' | 'paused'
  total: number
  queued: number
  sent: number
  failed: number
  lastUpdated?: string
}

interface CampaignStatusProps {
  data: CampaignStatusData | null
  onRefresh: () => void
  isLoading?: boolean
}

export default function CampaignStatus({ data, onRefresh, isLoading = false }: CampaignStatusProps) {
  if (!data) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <p className="text-gray-500 text-center">No active campaign. Upload a CSV to get started.</p>
      </div>
    )
  }

  const { status, total, queued, sent, failed, lastUpdated } = data
  const sentPercentage = total > 0 ? Math.round((sent / total) * 100) : 0

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
              🔄 Refresh Stats
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Queued */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            Queued
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {queued.toLocaleString()}
          </div>
        </div>

        {/* Sent */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-700 uppercase tracking-wider mb-1">
            Sent
          </div>
          <div className="text-2xl font-bold text-green-600">
            {sent.toLocaleString()}
          </div>
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

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  )
}



