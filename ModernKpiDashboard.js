// src/components/ModernKpiDashboard.js

'use client';
import { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Building, BarChart3, Users, Target, MapPin, CheckCircle, Home } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement);

export default function ModernKpiDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    
    const kpis = [
      {
        title: "Total Investment",
        value: "$110B+",
        change: "+10%",
        trend: "up",
        icon: <TrendingUp className="w-6 h-6" />
      },
      {
        title: "Active QOFs",
        value: "14,000+",
        change: "+12%",
        trend: "up",
        icon: <Building className="w-6 h-6" />
      },
      {
        title: "Zones with Investment",
        value: "68%",
        change: "+3%",
        trend: "up",
        icon: <MapPin className="w-6 h-6" />
      },
      {
        title: "New Housing Units",
        value: "313,000+",
        change: "+8%",
        trend: "up",
        icon: <Home className="w-6 h-6" />
      }
    ];

    // Chart Data for Overview
    const investmentGrowthData = {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        {
          label: 'Total Investment ($B)',
          data: [4.0, 28.0, 48.0, 65.0, 89.0, 100.0, 110.0],
          borderColor: '#0071e3',
          backgroundColor: 'rgba(0, 113, 227, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const sectorAllocationData = {
      labels: ['Residential', 'Commercial RE', 'Mixed Use', 'Operating Business', 'Infrastructure', 'Other'],
      datasets: [{
        data: [68.2, 21.1, 7.7, 2.0, 0.9, 0.1],
        backgroundColor: [
          'rgba(0, 113, 227, 0.8)',
          'rgba(48, 209, 88, 0.8)',
          'rgba(191, 90, 242, 0.8)',
          'rgba(255, 159, 10, 0.8)',
          'rgba(255, 59, 48, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderWidth: 0
      }]
    };

    // QOF Performance Data
    const qofPerformanceData = {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        {
          label: 'Number of QOFs',
          data: [1300, 5800, 7800, 9500, 11000, 12500, 14000],
          borderColor: '#0071e3',
          backgroundColor: 'rgba(0, 113, 227, 0.1)',
          fill: false,
          yAxisID: 'y'
        },
        {
          label: 'Average QOF Size ($M)',
          data: [3.1, 4.8, 6.2, 6.8, 8.1, 8.0, 7.9],
          borderColor: '#30d158',
          backgroundColor: 'rgba(48, 209, 88, 0.1)',
          fill: false,
          yAxisID: 'y1'
        }
      ]
    };

    // Geographic Distribution Data
    const geographicData = {
      labels: ['CA', 'FL', 'TX', 'NY', 'CO', 'OR', 'AZ', 'UT', 'NC', 'GA'],
      datasets: [
        {
          label: 'Investment ($B)',
          data: [25.2, 18.5, 15.8, 12.3, 8.7, 6.9, 6.2, 5.8, 4.9, 4.3],
          backgroundColor: 'rgba(0, 113, 227, 0.6)',
          borderRadius: 8
        }
      ]
    };

    // Social Impact Comparison Data
    const socialImpactData = {
      labels: ['Poverty Rate', 'Median Income', 'Minority Share', 'No High School', 'Bachelor\'s Degree', 'Not Working'],
      datasets: [
        {
          label: 'Opportunity Zones',
          data: [26.4, 49.9, 56.9, 20.5, 18.6, 30.0],
          backgroundColor: 'rgba(255, 59, 48, 0.6)',
          borderRadius: 4
        },
        {
          label: 'National Average',
          data: [13.4, 77.3, 39.3, 12.0, 32.1, 21.5],
          backgroundColor: 'rgba(0, 113, 227, 0.6)',
          borderRadius: 4
        }
      ]
    };

    // Compliance Data
    const complianceData = {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        {
          label: 'Compliance Rate (%)',
          data: [94.2, 93.8, 94.5, 95.1, 94.7, 95.3],
          borderColor: '#30d158',
          backgroundColor: 'rgba(48, 209, 88, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Market Intelligence Data  
    const propertyTrendsData = {
      labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
      datasets: [
        {
          label: 'OZ Median Home Value ($K)',
          data: [195, 198, 201, 205, 210, 215, 218, 220],
          backgroundColor: 'rgba(0, 113, 227, 0.6)',
          borderRadius: 8
        },
        {
          label: 'National Median ($K)',
          data: [350, 355, 358, 360, 365, 370, 372, 375],
          backgroundColor: 'rgba(191, 90, 242, 0.6)',
          borderRadius: 8
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgb(229, 231, 235)' 
              : 'rgb(75, 85, 99)',
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        title: { display: false }
      },
      scales: {
        x: {
          grid: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgb(156, 163, 175)' 
              : 'rgb(75, 85, 99)'
          }
        },
        y: {
          grid: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgb(156, 163, 175)' 
              : 'rgb(75, 85, 99)'
          }
        }
      }
    };

    const dualAxisOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgb(229, 231, 235)' 
              : 'rgb(75, 85, 99)',
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgb(156, 163, 175)' 
              : 'rgb(75, 85, 99)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgb(156, 163, 175)' 
              : 'rgb(75, 85, 99)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
              ? 'rgb(156, 163, 175)' 
              : 'rgb(75, 85, 99)'
          }
        }
      }
    };

    const tabs = [
      { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
      { id: 'qof-performance', label: 'QOF Performance', icon: <TrendingUp className="w-5 h-5" /> },
      { id: 'geographic', label: 'Geographic Analysis', icon: <MapPin className="w-5 h-5" /> },
      { id: 'social-impact', label: 'Social Impact', icon: <Users className="w-5 h-5" /> },
      { id: 'compliance', label: 'Compliance', icon: <CheckCircle className="w-5 h-5" /> },
      { id: 'market-intelligence', label: 'Market Intelligence', icon: <Target className="w-5 h-5" /> }
    ];

    return (
      <div className="min-h-screen bg-white dark:bg-black px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 animate-fadeIn">
            <h2 className="text-5xl font-semibold text-black dark:text-white tracking-tight mb-2">Market Overview</h2>
            <p className="text-xl text-black/60 dark:text-white/60 font-light">Comprehensive view of the $110+ billion Opportunity Zone marketplace</p>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 animate-fadeIn bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{kpi.icon}</div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-[#30d158]' : 'text-[#ff375f]'
                  }`}>
                    <span>{kpi.change}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {kpi.trend === 'up' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
                      )}
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-black dark:text-white/60 mb-1">{kpi.title}</h3>
                <p className="text-3xl font-semibold text-black dark:text-white mb-1">{kpi.value}</p>
                <p className="text-xs text-black/40 dark:text-white/40">{kpi.description}</p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'glass-card text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="glass-card rounded-3xl p-6 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10" style={{ minHeight: '320px' }}>
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">Investment Overview</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Total Investment</h4>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">$110B+</p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">Since 2018</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Active QOFs</h4>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">14,000+</p>
                      <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">Nationwide</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Investment Growth</h4>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">+15%</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">YoY Growth</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div style={{ height: '280px' }}>
                      <h4 className="text-lg font-medium text-black dark:text-white mb-3">Investment Growth Trend</h4>
                      <Line data={investmentGrowthData} options={chartOptions} />
                    </div>
                    <div style={{ height: '280px' }}>
                      <h4 className="text-lg font-medium text-black dark:text-white mb-3">Sector Allocation</h4>
                      <Doughnut data={sectorAllocationData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { 
                            position: 'right',
                            labels: {
                              color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                                ? 'rgb(229, 231, 235)' 
                                : 'rgb(75, 85, 99)'
                            }
                          }
                        }
                      }} />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'qof-performance' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">QOF Performance Intelligence Center</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Average Fund Size</h4>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">$7.9M</p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">+15% vs 2023</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Investment Velocity</h4>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">$1.2B</p>
                      <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">Monthly Average</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Fund Formation Rate</h4>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">125</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">New QOFs/Month</p>
                    </div>
                  </div>

                  <div style={{ height: '280px' }}>
                    <h4 className="text-lg font-medium text-black dark:text-white mb-3">QOF Growth & Formation Trends</h4>
                    <Line data={qofPerformanceData} options={dualAxisOptions} />
                  </div>
                </div>
              )}
              
              {activeTab === 'geographic' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">Geographic Investment Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Leading State</h4>
                      <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">California</p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">$25.2B invested</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Highest Per-Zone</h4>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">Utah</p>
                      <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">$126.1M average</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Rural vs Urban</h4>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">35% / 65%</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">Investment split</p>
                    </div>
                  </div>

                  <div style={{ height: '280px' }}>
                    <h4 className="text-lg font-medium text-black dark:text-white mb-3">Top 10 States by Investment Volume</h4>
                    <Bar data={geographicData} options={chartOptions} />
                  </div>
                </div>
              )}

              {activeTab === 'social-impact' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">Social Impact</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Poverty Reduction</h4>
                      <p className="text-3xl font-bold text-red-900 dark:text-red-300">-2.3%</p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">Since program start</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Employment Growth</h4>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">+145K</p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">New jobs created</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Business Formation</h4>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">+18%</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">New businesses</p>
                    </div>
                  </div>

                  <div style={{ height: '280px' }}>
                    <h4 className="text-lg font-medium text-black dark:text-white mb-3">Socioeconomic Comparison</h4>
                    <Bar data={socialImpactData} options={chartOptions} />
                  </div>
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">Regulatory Compliance Dashboard</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Overall Compliance Rate</h4>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">95.3%</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">Excellent</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Form 8996 Filings</h4>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">13,200</p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">2024 filings</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">Penalty Calculations</h4>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">621</p>
                      <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">Monitor</p>
                    </div>
                  </div>

                  <div style={{ height: '280px' }}>
                    <h4 className="text-lg font-medium text-black dark:text-white mb-3">Compliance Rate Trends</h4>
                    <Line data={complianceData} options={chartOptions} />
                  </div>
                </div>
              )}

              {activeTab === 'market-intelligence' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">Market Intelligence</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Median OZ Home Value</h4>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">$220,000</p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">+9.1% YoY</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">National Comparison</h4>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">41% discount</p>
                      <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">vs $375K national</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Price Appreciation</h4>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">61%</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">of zones increasing</p>
                    </div>
                  </div>

                  <div style={{ height: '280px' }}>
                    <h4 className="text-lg font-medium text-black dark:text-white mb-3">Property Value Trends</h4>
                    <Bar data={propertyTrendsData} options={chartOptions} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}