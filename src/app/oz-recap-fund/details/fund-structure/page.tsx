
'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { BarChart3, TrendingUp, DollarSign, Calendar, Users, Target, Building } from "lucide-react";
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import { getAvailableImages } from '@/utils/supabaseImages';

export default function FundStructurePage() {
  useEffect(() => {
    document.title = "Fund Structure – OZ Recap Fund";
  }, []);

  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        const images = await getAvailableImages('oz-recap-fund-001', 'general');
        setBackgroundImages(images.slice(0, 7)); // Take the first 7 images
      } catch (error) {
        console.error('Error loading background images:', error);
      }
    }

    loadBackgroundImages();
  }, []);

  const fundDetails = [
    { label: "Target Total Capital Raise", value: "$40M", description: "To be invested in 3 multifamily assets." },
    { label: "Investment Period / Fund Life", value: "10+ years", description: "To enable full OZ basis step-up." },
    { label: "Target Net IRR", value: "15%", description: "Projected post-tax returns for investors." },
    { label: "Targeted Equity Multiple", value: "2.5x+", description: "Significant upside potential." },
    { label: "Deal Level Promote", value: "30% Promote to GP above 8% Pref", description: "Investor-favorable structure." },
    { label: "Fund Management Fee", value: "2% / 0% carried interest", description: "Annual fee on invested capital." }
  ];

  const timeline = [
    { year: "180 Days", phase: "Deploy Gains", distribution: "From Realization", description: "Investors have 180 days from capital gains realization to subscribe to the QOF." },
    { year: "6-18 Months", phase: "First Distribution", distribution: "Post-Investment", description: "Distributions anticipated within 6-18 months post-investment." },
    { year: "Stabilized", phase: "Annual Cash Yield", distribution: "5-8%", description: "Projected 5-8% stabilized annual cash yield once recapitalizations are completed." },
    { year: "Year 10+", phase: "Exit", distribution: "Full OZ Benefits", description: "Primary exit via sale or refinance at Year 10+ to capture full tax-free appreciation on gains." }
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/oz-recap-fund#investment-cards" 
          className="inline-flex items-center text-emerald-300 hover:text-emerald-100 mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-5xl"><BarChart3 className="w-12 h-12 text-emerald-400" /></div>
          <div>
            <h1 className="text-5xl font-semibold text-emerald-300 tracking-tight">
              Fund Structure
            </h1>
            <p className="text-xl text-emerald-200 mt-2">
              OZ RECAP FUND, LLC - Investment Details
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      <BackgroundSlideshow 
          images={backgroundImages}
          className="py-16"
          intervalMs={6000}
        >
        <HeaderContent />
      </BackgroundSlideshow>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {fundDetails.map((detail, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">{detail.label}</h3>
                <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300 mb-4">{detail.value}</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{detail.description}</p>
              </div>
            ))}
          </div>

          {/* Investment Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Fund Timeline & Distributions</h3>
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
        </div>
      </section>
    </div>
  );
}
