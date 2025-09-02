'use client'

interface SiteMetrics {
  thisWeekSignups: number
  lastWeekSignups: number
  netChangeUsers: number
  currentAuthedUsers: number
  userGrowthRate: string
  currentWeekStart?: string
  currentWeekEnd?: string
}

interface SiteMetricsCardsProps {
  metrics: SiteMetrics | null
}

export default function SiteMetricsCards({ metrics }: SiteMetricsCardsProps) {
  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* New User Signups */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
            New User Signups
          </p>
          <p className={`text-3xl font-bold ${metrics.thisWeekSignups > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {metrics.thisWeekSignups.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {metrics.currentWeekStart && metrics.currentWeekEnd ? 
              `This week - ${new Date(metrics.currentWeekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${new Date(metrics.currentWeekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` :
              'This week'
            }
          </p>
        </div>
      </div>

      {/* Percentage Increase */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Weekly Growth
          </p>
          <p className={`text-3xl font-bold ${parseFloat(metrics.userGrowthRate) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {parseFloat(metrics.userGrowthRate) >= 0 ? '+' : ''}{metrics.userGrowthRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Signup change from last week
          </p>
        </div>
      </div>

      {/* Total Users */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Total Users
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.currentAuthedUsers.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            All registered users on the platform
          </p>
        </div>
      </div>
    </div>
  )
} 