'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { ChevronDown, ChevronUp } from 'lucide-react'

// Register Chart.js components
Chart.register(...registerables)

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

interface AnalyticsDisplayProps {
  data: AnalyticsData[]
  isLoading: boolean
}

function EventAccordion({ item }: { item: AnalyticsData }) {
  const [isOpen, setIsOpen] = useState(false)

  const formatPercentage = (change: number) => {
    const percentage = (change * 100).toFixed(1)
    return change >= 0 ? `+${percentage}%` : `${percentage}%`
  }

  const formattedEventType = item.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 flex-1">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{formattedEventType}</div>
            </div>
            <div className="text-sm text-gray-900 w-24">
              {item.lastWeek.toLocaleString()}
            </div>
            <div className="text-sm text-gray-900 w-24">
              {item.thisWeek.toLocaleString()}
            </div>
            <div className="w-32">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.change >= 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {item.change >= 0 ? '▲' : '▼'} {formatPercentage(item.change)}
              </span>
            </div>
            <div className="text-sm text-gray-500 w-32">
              {item.emails.length} {item.emails.length === 1 ? 'email' : 'emails'}
            </div>
          </div>
          <div className="ml-4">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Emails ({item.emails.length})
          </div>
          {item.emails.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {item.emails.map((emailStat, idx) => (
                <div key={idx} className="px-6 py-3 bg-white">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex-1 truncate pl-6 text-gray-900">
                      {emailStat.email}
                    </div>
                    <div className="w-24 text-sm text-gray-900">
                      {emailStat.lastWeek.toLocaleString()}
                    </div>
                    <div className="w-24 text-sm text-gray-900">
                      {emailStat.thisWeek.toLocaleString()}
                    </div>
                    <div className="w-32 text-sm text-gray-500 text-center">
                      —
                    </div>
                    <div className="w-32 text-sm text-gray-500 text-right">
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-6 pb-4 text-sm text-gray-500 italic">
              No emails available for this event type
            </p>
          )}
        </div>
      )}
    </div>
  )
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

      {/* Event Analytics with Accordions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Event Analytics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Week-over-week comparison of user events with email listings
          </p>
        </div>
        <div className="border-t border-gray-200">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </div>
              <div className="w-24 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Week
              </div>
              <div className="w-24 text-xs font-medium text-gray-500 uppercase tracking-wider">
                This Week
              </div>
              <div className="w-32 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </div>
              <div className="w-32 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emails
              </div>
              <div className="w-8"></div>
            </div>
          </div>
          {/* Accordion Items */}
          <div className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <EventAccordion key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 