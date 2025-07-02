'use client';

import Link from "next/link";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

export default function MarketAnalysisPage() {
  const populationGrowthData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Phoenix Metro Population (M)',
        data: [4.85, 4.95, 5.12, 5.28, 5.45, 5.62],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const employmentData = {
    labels: ['Tech', 'Healthcare', 'Education', 'Government', 'Manufacturing', 'Hospitality'],
    datasets: [
      {
        label: 'Employment Growth (%)',
        data: [15.2, 8.4, 6.1, 4.3, 7.8, 12.6],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderRadius: 8
      }
    ]
  };

  const rentGrowthData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Average Rent ($)',
        data: [1850, 1920, 2180, 2420, 2650, 2850],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: '#6b7280' }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: '#6b7280' }
      }
    }
  };

  const demographics = [
    { metric: "Median Age", value: "35.8 years", comparison: "vs 38.1 national" },
    { metric: "College Educated", value: "32%", comparison: "vs 33% national" },
    { metric: "Median Income", value: "$65,400", comparison: "vs $62,843 national" },
    { metric: "Tech Workers", value: "12%", comparison: "vs 8% national" }
  ];

  const marketDrivers = [
    {
      title: "Growing Tech Sector",
      icon: "💻",
      description: "Major companies including Intel, Apple, and GoDaddy expanding operations in Phoenix Metro",
      impact: "High"
    },
    {
      title: "Arizona State University",
      icon: "🎓", 
      description: "80,000+ students creating consistent rental demand in surrounding areas",
      impact: "High"
    },
    {
      title: "Tax-Friendly Environment",
      icon: "💰",
      description: "Arizona's business-friendly tax structure attracting companies and residents",
      impact: "Medium"
    },
    {
      title: "Year-Round Climate",
      icon: "☀️",
      description: "Desert climate and outdoor lifestyle attracting retirees and young professionals",
      impact: "Medium"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link href="/" className="inline-flex items-center text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 mb-8">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-5xl">🎯</div>
            <div>
              <h1 className="text-5xl font-semibold text-purple-900 dark:text-purple-300 tracking-tight">
                Market Analysis
              </h1>
              <p className="text-xl text-purple-700 dark:text-purple-400 mt-2">
                Comprehensive Phoenix/Mesa multifamily market intelligence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Market Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">Current Occupancy</h3>
              <p className="text-4xl font-bold text-purple-900 dark:text-purple-300">96.2%</p>
              <p className="text-sm text-purple-700 dark:text-purple-400 mt-2">Phoenix Metro Class A</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">Annual Rent Growth</h3>
              <p className="text-4xl font-bold text-purple-900 dark:text-purple-300">+8.4%</p>
              <p className="text-sm text-purple-700 dark:text-purple-400 mt-2">12-month trailing</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">Job Growth</h3>
              <p className="text-4xl font-bold text-purple-900 dark:text-purple-300">+12.1%</p>
              <p className="text-sm text-purple-700 dark:text-purple-400 mt-2">Phoenix Metro YoY</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Population Growth</h3>
              <div style={{ height: '300px' }}>
                <Line data={populationGrowthData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Employment by Sector</h3>
              <div style={{ height: '300px' }}>
                <Bar data={employmentData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Rent Growth Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Average Rent Growth Trend</h3>
            <div style={{ height: '300px' }}>
              <Line data={rentGrowthData} options={chartOptions} />
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Phoenix/Mesa Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {demographics.map((demo, idx) => (
                <div key={idx} className="text-center">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{demo.metric}</h4>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mb-1">{demo.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{demo.comparison}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Drivers */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Market Drivers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketDrivers.map((driver, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-3xl">{driver.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{driver.title}</h4>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        driver.impact === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {driver.impact} Impact
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{driver.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 