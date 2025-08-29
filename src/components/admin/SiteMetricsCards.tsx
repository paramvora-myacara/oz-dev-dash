'use client'

interface SiteMetrics {
  netChangeUsers: number
  currentAuthedUsers: number
  userGrowthRate: string
}

interface SiteMetricsCardsProps {
  metrics: SiteMetrics | null
}

export default function SiteMetricsCards({ metrics }: SiteMetricsCardsProps) {
  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Net Change in Authed Users */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Net Change (This Week)
          </p>
          <p className={`text-3xl font-bold ${metrics.netChangeUsers >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {metrics.netChangeUsers >= 0 ? '+' : ''}{metrics.netChangeUsers}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            New user signups vs. last week
          </p>
        </div>
      </div>

      {/* Current Authed Users */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Total Authed Users
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.currentAuthedUsers.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Users with activity on the site
          </p>
        </div>
      </div>

      {/* User Growth Rate */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Growth Rate
          </p>
          <p className={`text-3xl font-bold ${parseFloat(metrics.userGrowthRate) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {parseFloat(metrics.userGrowthRate) >= 0 ? '+' : ''}{metrics.userGrowthRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Week-over-week user growth
          </p>
        </div>
      </div>
    </div>
  )
} 