'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Target, TrendingUp, Users, Building } from "lucide-react";
import BackgroundSlideshow from '../../../../components/BackgroundSlideshow';
import { getRandomImages } from '../../../../utils/supabaseImages';

export const metadata = {
  title: "Market Analysis – The Marshall St. Louis",
};

export default function MarketAnalysisPage() {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        console.log('[MarketAnalysis] Starting to load background images...');
        // Get random 7 images for background slideshow
        const images = await getRandomImages('marshall-st-louis-001', 'general', 7);
        console.log('[MarketAnalysis] Loaded images:', images);
        setBackgroundImages(images);
      } catch (error) {
        console.error('[MarketAnalysis] Error loading background images:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBackgroundImages();
  }, []);

  const marketMetrics = [
    { label: "SLU Enrollment Growth", value: "25%", description: "Increase since 2020, with record highs in 2023-24" },
    { label: "Current Students", value: "15,200+", description: "Total enrollment with continued growth targets" },
    { label: "Pre-Lease Rate", value: ">60%", description: "Strong pre-leasing before construction completion" },
    { label: "Housing Shortage", value: "Critical", description: "No new dorms since 2017, only 162 PBSH beds added" },
    { label: "Rent Growth", value: "18-37%", description: "Annual rent increases for comparable properties" },
    { label: "Occupancy Rates", value: "96-100%", description: "High occupancy at competitive properties" }
  ];

  const competitorData = [
    {
      name: "Verve St Louis",
      built: "2021",
      beds: "162",
      rent: "$1,115",
      occupancy: "100%",
      rentGrowth: "18.4%"
    },
    {
      name: "The Standard St Louis", 
      built: "2015",
      beds: "465",
      rent: "$1,222",
      occupancy: "96%",
      rentGrowth: "37.1%"
    },
    {
      name: "City Lofts at Laclede",
      built: "2006", 
      beds: "408",
      rent: "$989",
      occupancy: "100%",
      rentGrowth: "30.3%"
    }
  ];

  const marketDrivers = [
    {
      title: "Record University Growth",
      description: "St. Louis University achieved back-to-back record enrollment in 2023 and 2024, driven by strategic growth initiatives focusing on international and graduate programs.",
      impact: "High",
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Cortex Innovation District",
      description: "$2.3B in development creating 13,000+ jobs in a 200-acre tech and biotech hub, generating demand for quality housing.",
      impact: "High", 
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "BJC/WashU Medical Expansion",
      description: "$1B redevelopment of the medical campus enhancing the area's economic growth and employment opportunities.",
      impact: "Medium",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "City Foundry Development",
      description: "$300M mixed-use development with retail, dining, entertainment, and office space creating 800+ permanent jobs.",
      impact: "Medium",
      color: "text-blue-600 dark:text-blue-400"
    }
  ];

  const majorEmployers = [
    { company: "St. Louis University", employees: "15,200", sector: "Education", distance: "0.1 mi" },
    { company: "BJC Healthcare", employees: "8,500+", sector: "Healthcare", distance: "0.6 mi" },
    { company: "Washington University", employees: "6,200+", sector: "Education/Medical", distance: "0.6 mi" },
    { company: "Cortex Companies", employees: "5,700+", sector: "Tech/Biotech", distance: "0.5 mi" },
    { company: "City Foundry Tenants", employees: "800+", sector: "Mixed", distance: "0.1 mi" }
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/marshall-st-louis#investment-cards" 
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
              The Marshall St. Louis - St. Louis University Market Overview
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header with Background Slideshow */}
      {loading ? (
        <section className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/marshall-st-louis#investment-cards" 
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
                  The Marshall St. Louis - St. Louis University Market Overview
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : backgroundImages.length > 0 ? (
        <BackgroundSlideshow 
          images={backgroundImages}
          className="py-16"
          intervalMs={6000}
        >
          <HeaderContent />
        </BackgroundSlideshow>
      ) : (
        <section className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/marshall-st-louis#investment-cards" 
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
                  The Marshall St. Louis - St. Louis University Market Overview
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Major Employers Within 1 Mile</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Employer</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Employees</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Sector</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {majorEmployers.map((employer, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{employer.company}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.employees}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.sector}</td>
                      <td className="py-3 text-purple-600 dark:text-purple-400 font-medium">{employer.distance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitive Analysis */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Competitive Student Housing Market</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Property</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Year Built</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Beds</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Avg Rate/Bed</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Occupancy</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Rent Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorData.map((property, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{property.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{property.built}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{property.beds}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{property.rent}</td>
                      <td className="py-3 text-green-600 dark:text-green-400 font-semibold">{property.occupancy}</td>
                      <td className="py-3 text-purple-600 dark:text-purple-400 font-semibold">+{property.rentGrowth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Market Summary:</strong> Limited supply with only 162 PBSH beds delivered since 2017, 
                while SLU enrollment has grown 25%. Strong rent growth and occupancy rates demonstrate robust demand.
              </p>
            </div>
          </div>

          {/* Market Drivers */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Market Drivers</h3>
            <div className="space-y-6">
              {marketDrivers.map((driver, idx) => (
                <div key={idx} className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{driver.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${driver.color} bg-current/10`}>
                      {driver.impact} Impact
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{driver.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}