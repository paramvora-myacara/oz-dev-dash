'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Target, TrendingUp, Users, Home, Building, Factory } from "lucide-react";
import BackgroundSlideshow from '../../../../components/BackgroundSlideshow';
import { getRandomImages } from '../../../../utils/supabaseImages';

export default function MarketAnalysisPage() {
  useEffect(() => {
    document.title = "Market Analysis – The Edge on Main";
  }, []);

  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        console.log('[MarketAnalysis] Starting to load background images...');
        // Get random 7 images for background slideshow
        const images = await getRandomImages('edge-on-main-mesa-001', 'general', 7);
        console.log('[MarketAnalysis] Loaded images:', images);
        setBackgroundImages(images);
      } catch (error) {
        console.error('[MarketAnalysis] Error loading background images:', error);
      }
    }

    loadBackgroundImages();
  }, []);

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/the-edge-on-main#investment-cards" 
          className="inline-flex items-center text-purple-300 hover:text-purple-100 mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-5xl"><Target className="w-12 h-12 text-purple-400" /></div>
          <div>
            <h1 className="text-5xl font-semibold text-purple-300 tracking-tight">
              Market Analysis
            </h1>
            <p className="text-xl text-purple-200 mt-2">
              The Edge on Main - Phoenix-Mesa Market Overview
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const marketMetrics = [
    { label: "Population Growth (2020-2030)", value: "+18.5%", description: "Phoenix-Mesa MSA projected growth" },
    { label: "Median Household Income", value: "$68,400", description: "Mesa city median (2023)" },
    { label: "Job Growth Rate", value: "+3.2%", description: "Annual employment growth" },
    { label: "Housing Shortage", value: "56,000+", description: "Units needed to meet demand" },
    { label: "Rent Growth (5-year)", value: "+42%", description: "Class A multifamily rent appreciation" },
    { label: "Occupancy Rate", value: "96.2%", description: "Current market occupancy" }
  ];

  const employers = [
    { name: "Banner Health", employees: "32,000+", industry: "Healthcare", distance: "8 mi" },
    { name: "Boeing", employees: "15,000+", industry: "Aerospace", distance: "12 mi" },
    { name: "Arizona State University", employees: "12,000+", industry: "Education", distance: "15 mi" },
    { name: "Salt River Project", employees: "7,500+", industry: "Utilities", distance: "10 mi" },
    { name: "City of Phoenix", employees: "14,000+", industry: "Government", distance: "18 mi" },
    { name: "Intel", employees: "12,000+", industry: "Technology", distance: "20 mi" }
  ];

  const demographics = [
    { category: "Age 25-34", percentage: "22%", description: "Prime renting demographic" },
    { category: "Age 35-44", percentage: "18%", description: "Family formation years" },
    { category: "College Educated", percentage: "34%", description: "Bachelor's degree or higher" },
    { category: "Median Age", percentage: "36.8", description: "Years old" }
  ];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header with Background Slideshow */}
      {backgroundImages.length > 0 ? (
        <BackgroundSlideshow 
          images={backgroundImages}
          className="py-16"
          intervalMs={6000}
        >
          <HeaderContent />
        </BackgroundSlideshow>
      ) : (
        <section className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/the-edge-on-main#investment-cards" 
              className="inline-flex items-center text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 mb-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </Link>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl"><Target className="w-12 h-12 text-purple-600 dark:text-purple-400" /></div>
              <div>
                <h1 className="text-5xl font-semibold text-purple-900 dark:text-purple-300 tracking-tight">
                  Market Analysis
                </h1>
                <p className="text-xl text-purple-700 dark:text-purple-400 mt-2">
                  The Edge on Main - Phoenix-Mesa Market Overview
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Market Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {marketMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">{metric.label}</h3>
                <p className="text-4xl font-bold text-purple-900 dark:text-purple-300 mb-4">{metric.value}</p>
                <p className="text-sm text-purple-700 dark:text-purple-400">{metric.description}</p>
              </div>
            ))}
          </div>

          {/* Major Employers */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Major Employers Within 20 Miles</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Company</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Employees</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Industry</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((employer, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{employer.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.employees}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.industry}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.distance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Demographics & Supply/Demand */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Demographics</h3>
              <div className="space-y-6">
                {demographics.map((demo, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{demo.category}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{demo.description}</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{demo.percentage}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Supply & Demand Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Home className="w-6 h-6 text-red-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Housing Deficit</h4>
                    <p className="text-gray-600 dark:text-gray-400">Arizona needs 56,000+ additional housing units to meet current demand</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><TrendingUp className="w-6 h-6 text-green-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Population Growth</h4>
                    <p className="text-gray-600 dark:text-gray-400">Phoenix-Mesa MSA adding 80,000+ new residents annually</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Building className="w-6 h-6 text-blue-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Limited New Supply</h4>
                    <p className="text-gray-600 dark:text-gray-400">Construction constraints limit new multifamily development</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Factory className="w-6 h-6 text-purple-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Job Creation</h4>
                    <p className="text-gray-600 dark:text-gray-400">Major employers continuing expansion in Phoenix metro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Drivers */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Market Drivers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Migration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net in-migration of 120,000+ annually to Arizona</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Building className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Development</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transit-oriented development prioritized by Mesa</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Factory className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Industries</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Healthcare, aerospace, and tech driving job growth</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Rent Growth</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Strong rent appreciation across all asset classes</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 