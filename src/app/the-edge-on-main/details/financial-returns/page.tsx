// src/app/the-edge-on-main/details/financial-returns/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { TrendingUp, DollarSign, Calendar, Users, Target, Building } from "lucide-react";
import BackgroundSlideshow from '../../../../components/BackgroundSlideshow';
import { getRandomImages } from '../../../../utils/supabaseImages';

export default function FinancialReturnsPage() {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        console.log('[FinancialReturns] Starting to load background images...');
        // Get random 7 images for background slideshow
        const images = await getRandomImages('edge-on-main-mesa-001', 'general', 7);
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
    { label: "10-Year Equity Multiple", value: "2.8–3.2x", description: "Projected returns for investors over full hold period" },
    { label: "3-Year Equity Multiple", value: "2.1x", description: "Early returns for stabilization period" },
    { label: "Preferred Return", value: "7.0%", description: "Guaranteed minimum annual return" },
    { label: "IRR Target", value: "18-22%", description: "Internal rate of return over full cycle" },
    { label: "Cash-on-Cash", value: "9-12%", description: "Annual cash distributions to investors" },
    { label: "Tax Benefits", value: "100%", description: "Federal tax exemption on appreciation" }
  ];

  const timeline = [
    { year: "Year 1-2", phase: "Development", distribution: "0%", description: "Construction and lease-up phase" },
    { year: "Year 3-5", phase: "Stabilization", distribution: "8-10%", description: "Property reaches full occupancy" },
    { year: "Year 6-8", phase: "Value Creation", distribution: "10-12%", description: "Rent growth and NOI expansion" },
    { year: "Year 9-10", phase: "Exit Preparation", distribution: "12%+", description: "Optimization for sale or refinance" }
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/the-edge-on-main#investment-cards" 
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
              The Edge on Main - Projected Investment Performance
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
              href="/the-edge-on-main#investment-cards" 
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
                  The Edge on Main - Projected Investment Performance
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
              href="/the-edge-on-main#investment-cards" 
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
                  The Edge on Main - Projected Investment Performance
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Distribution Timeline</h3>
            <div className="space-y-6">
              {timeline.map((phase, idx) => (
                <div key={idx} className="flex items-start space-x-6 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-emerald-300">{phase.year}</h4>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium">{phase.phase}</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{phase.distribution}</p>
                        <p className="text-sm text-gray-600 dark:text-emerald-400">Distribution Rate</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 dark:text-emerald-400">{phase.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Opportunity Zone Benefits</h3>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-emerald-300">Capital Gains Deferral</h4>
                  <p className="text-gray-600 dark:text-emerald-400">Defer existing capital gains taxes until 2026</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-emerald-300">Basis Step-Up</h4>
                  <p className="text-gray-600 dark:text-emerald-400">10% reduction in deferred gains after 5 years, 15% after 7 years</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-emerald-300">Tax-Free Appreciation</h4>
                  <p className="text-gray-600 dark:text-emerald-400">100% federal tax exemption on all appreciation after 10 years</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Investment Structure</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-emerald-400">Minimum Investment</span>
                  <span className="font-semibold text-gray-900 dark:text-emerald-300">$250,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-emerald-400">Preferred Return</span>
                  <span className="font-semibold text-gray-900 dark:text-emerald-300">7.0% Annual</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-emerald-400">Target Hold Period</span>
                  <span className="font-semibold text-gray-900 dark:text-emerald-300">10 Years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-emerald-400">Distribution Frequency</span>
                  <span className="font-semibold text-gray-900 dark:text-emerald-300">Quarterly</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-emerald-400">Fund Structure</span>
                  <span className="font-semibold text-gray-900 dark:text-emerald-300">Delaware LLC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}