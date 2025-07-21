'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { TrendingUp, DollarSign, Calendar, Users, Target, Building } from "lucide-react";
import BackgroundSlideshow from '../../../../components/BackgroundSlideshow';
import { getRandomImages } from '../../../../utils/supabaseImages';

export const metadata = {
  title: "Financial Returns – The Marshall St. Louis",
};

export default function FinancialReturnsPage() {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        console.log('[FinancialReturns] Starting to load background images...');
        // Get random 7 images for background slideshow
        const images = await getRandomImages('marshall-st-louis-001', 'general', 7);
        console.log('[FinancialReturns] Loaded images:', images);
        setBackgroundImages(images);
      } catch (error) {
        console.error('[FinancialReturns] Error loading background images:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBackgroundImages();
  }, []);

  const projections = [
    { label: "10-Year Equity Multiple", value: "4.29x", description: "Projected returns for investors over full hold period" },
    { label: "Target IRR", value: "17.7%", description: "Internal rate of return over 10-year investment cycle" },
    { label: "Preferred Return", value: "8.0%", description: "8% compounded preferred return to investors" },
    { label: "Total Capital Required", value: "$30.1M", description: "New equity investment for recapitalization" },
    { label: "Year 1 Cash Flow", value: "$1.26M", description: "Projected first year distribution" },
    { label: "Tax Benefits", value: "100%", description: "Federal tax exemption on appreciation after 10 years" }
  ];

  const timeline = [
    { year: "Q2 2025", phase: "Occupancy Begins", distribution: "Initial", description: "Student move-in and stabilization" },
    { year: "Q1 2026", phase: "First Distribution", distribution: "Annual CF", description: "Projected first cash flow distribution" },
    { year: "2026-2030", phase: "Annual CF Distributions", distribution: "6-12%", description: "Cash flow distributions through operation period" },
    { year: "2035", phase: "Projected Sale", distribution: "Full OZ Benefits", description: "Exit with 100% tax-free appreciation" }
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/marshall-st-louis#investment-cards" 
          className="inline-flex items-center text-emerald-300 hover:text-emerald-100 mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-5xl"><TrendingUp className="w-12 h-12 text-emerald-400" /></div>
          <div>
            <h1 className="text-5xl font-semibold text-emerald-300 tracking-tight">
              Financial Returns
            </h1>
            <p className="text-xl text-emerald-200 mt-2">
              The Marshall St. Louis - Projected Investment Performance
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
        <section className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/marshall-st-louis#investment-cards" 
              className="inline-flex items-center text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 mb-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </Link>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl"><TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <h1 className="text-5xl font-semibold text-emerald-900 dark:text-emerald-300 tracking-tight">
                  Financial Returns
                </h1>
                <p className="text-xl text-emerald-700 dark:text-emerald-400 mt-2">
                  The Marshall St. Louis - Projected Investment Performance
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
        <section className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/marshall-st-louis#investment-cards" 
              className="inline-flex items-center text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 mb-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </Link>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl"><TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <h1 className="text-5xl font-semibold text-emerald-900 dark:text-emerald-300 tracking-tight">
                  Financial Returns
                </h1>
                <p className="text-xl text-emerald-700 dark:text-emerald-400 mt-2">
                  The Marshall St. Louis - Projected Investment Performance
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {projections.map((projection, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">{projection.label}</h3>
                <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300 mb-4">{projection.value}</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{projection.description}</p>
              </div>
            ))}
          </div>

          {/* Investment Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Distribution Timeline</h3>
            <div className="space-y-6">
              {timeline.map((phase, idx) => (
                <div key={idx} className="flex items-start space-x-6 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{phase.phase}</h4>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{phase.year}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{phase.description}</p>
                    <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-medium">
                      {phase.distribution}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Benefits & Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Opportunity Zone Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 rounded-full">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Tax Deferral</h4>
                    <p className="text-gray-600 dark:text-gray-400">Defer capital gains taxes until 2026 or property sale</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 rounded-full">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Tax-Free Appreciation</h4>
                    <p className="text-gray-600 dark:text-gray-400">100% federal tax exemption on all appreciation after 10 years</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 rounded-full">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Depreciation Benefits</h4>
                    <p className="text-gray-600 dark:text-gray-400">Accelerated depreciation and cost segregation benefits</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Investment Structure</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Minimum Investment</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">$250,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Preferred Return</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">8.0% Annual</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Target Hold Period</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">10 Years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Distribution Frequency</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Annual</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fund Structure</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Aptitude St. Louis LLC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Management Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">2.0% Annual</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}