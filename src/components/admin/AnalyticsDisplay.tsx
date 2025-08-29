'use client'

import { useEffect, useRef } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

interface AnalyticsData {
  eventType: string
  lastWeek: number
  thisWeek: number
  change: number
}

interface AnalyticsDisplayProps {
  data: AnalyticsData[]
  isLoading: boolean
}

export default function AnalyticsDisplay({ data, isLoading }: AnalyticsDisplayProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare chart data
    const labels = data.map(item => item.eventType)
    const lastWeekData = data.map(item => item.lastWeek)
    const thisWeekData = data.map(item => item.thisWeek)

    const chartConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Last Week',
            data: lastWeekData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
          {
            label: 'This Week',
            data: thisWeekData,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false,
          },
        },
        scales: {
          x: {
            stacked: false,
          },
          y: {
            stacked: false,
            beginAtZero: true,
          },
        },
      },
    }

    // Create new chart
    chartInstance.current = new Chart(chartRef.current, chartConfig)

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No analytics data available for the selected time period.</div>
      </div>
    )
  }

  const formatPercentage = (change: number) => {
    const percentage = (change * 100).toFixed(1)
    return change >= 0 ? `+${percentage}%` : `${percentage}%`
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Visual Comparison</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Bar chart showing week-over-week event counts
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="h-80">
            <canvas ref={chartRef} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Event Analytics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Week-over-week comparison of user events
          </p>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.lastWeek.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.thisWeek.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.change >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.change >= 0 ? '▲' : '▼'} {formatPercentage(item.change)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 