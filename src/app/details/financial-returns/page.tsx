'use client';

import Link from "next/link";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

export default function FinancialReturnsPage() {
  const equityMultipleData = {
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    datasets: [
      {
        label: 'Projected Equity Multiple (x)',
        data: [1.0, 1.1, 1.4, 2.1, 2.25, 2.4, 2.55, 2.7, 2.8, 2.9, 3.0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const cashFlow_data = {
    labels: ['Year 1', 'Year 2', 'Year 3'],
    datasets: [
      {
        label: 'Projected Distributions to LPs ($M)',
        data: [0, 12, 60],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8
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

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link href="/" className="inline-flex items-center text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 mb-8">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-5xl">📈</div>
            <div>
              <h1 className="text-5xl font-semibold text-emerald-900 dark:text-emerald-300 tracking-tight">
                Financial Returns
              </h1>
              <p className="text-xl text-emerald-700 dark:text-emerald-400 mt-2">
                Comprehensive investment return analysis and projections
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">10-Year Equity Multiple</h3>
              <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300">2.8–3.2x</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">Hold-period projection</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">3-Year Equity Multiple</h3>
              <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300">2.1x</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">At stabilization & recap</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Preferred Return</h3>
              <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300">7%</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">Cumulative, non-compounding</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">IRR Progression</h3>
              <div style={{ height: '300px' }}>
                <Line data={equityMultipleData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Annual Cash Flow</h3>
              <div style={{ height: '300px' }}>
                <Bar data={cashFlow_data} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Investment Structure & Returns</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Key Investment Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Acquisition Price</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">$89.5M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Project Cost</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">$96.2M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Target Equity</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">$28.8M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Debt Financing</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">$67.4M (70% LTV)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Return Drivers</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rent Growth (Annual)</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">4.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Occupancy Stabilization</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">96.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Exit Cap Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">4.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Property Appreciation</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">3.2% annually</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 