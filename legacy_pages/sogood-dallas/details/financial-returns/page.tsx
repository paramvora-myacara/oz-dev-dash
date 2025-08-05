'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { TrendingUp, DollarSign, Calendar, Users, Target, Building } from "lucide-react";
import BackgroundSlideshow from '../../../../components/BackgroundSlideshow';
import { getRandomImages } from '../../../../utils/supabaseImages';

export default function FinancialReturnsPage() {
  useEffect(() => {
    document.title = "Financial Returns – SoGood Dallas";
  }, []);

  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        console.log('[FinancialReturns] Starting to load background images...');
        // Get random 7 images for background slideshow
        const images = await getRandomImages('sogood-dallas-001', 'general', 7);
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
    { label: "10-Year Equity Multiple", value: "2.88x", description: "Projected returns for investors over full hold period" },
    { label: "5-Year Equity Multiple", value: "2.5x", description: "Returns for stabilization period" },
    { label: "Preferred Return", value: "9.0%", description: "Annual preferred return until stabilization" },
    { label: "IRR Target (5-Year)", value: "20-21%", description: "Internal rate of return for mid-term hold" },
    { label: "IRR Target (10-Year)", value: "19-20%", description: "Internal rate of return over full cycle" },
    { label: "Unlevered Yield", value: "7.2%", description: "Yield on cost through conservative underwriting" }
  ];

  const timeline = [
    { year: "Year 1-2", phase: "Development", distribution: "0%", description: "Construction and innovation center lease-up" },
    { year: "Year 3-4", phase: "Stabilization", distribution: "9%", description: "Property reaches stabilized occupancy" },
    { year: "Year 5-7", phase: "Value Creation", distribution: "9%+", description: "NOI growth and rent appreciation" },
    { year: "Year 8-10", phase: "Exit Preparation", distribution: "9%+", description: "Optimization for sale or refinance" }
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/sogood-dallas#investment-cards" 
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
              SoGood Dallas - Projected Investment Performance
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
              href="/sogood-dallas#investment-cards" 
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
                  SoGood Dallas - Projected Investment Performance
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
              href="/sogood-dallas#investment-cards" 
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
                  SoGood Dallas - Projected Investment Performance
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
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{phase.year}</h4>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{phase.distribution}</span>
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-2">{phase.phase}</p>
                    <p className="text-gray-600 dark:text-gray-400">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Opportunity Zone Benefits */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Opportunity Zone Tax Benefits</h3>
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Capital Gains Deferral</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Defer federal capital gains tax until 2026 or fund exit</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Basis Step-Up</h4>
                    <p className="text-gray-600 dark:text-gray-400">Partial forgiveness of deferred gains after 5+ years</p>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Tax-Free Appreciation</h4>
                    <p className="text-gray-600 dark:text-gray-400">100% federal tax exemption on all appreciation after 10 years</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Investment Structure</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Minimum Investment</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">$500,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Preferred Return</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">9.0% Annual</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Target Hold Period</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">10+ Years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Distribution Frequency</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Annual</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fund Structure</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Dallas OZ Fund I LLC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Management Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">2.0% Annual</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sponsor Promote</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">30% after pref</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}