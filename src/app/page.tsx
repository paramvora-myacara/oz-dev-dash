'use client';

import Link from "next/link";
import { Building, MapPin, DollarSign, Briefcase } from "lucide-react";
import { useEffect } from 'react';

export default function PortfolioPage() {
  useEffect(() => {
    document.title = "ACARA Opportunity Zone Portfolio";
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="relative z-30 p-4 md:p-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white tracking-tight mb-6">
              ACARA Opportunity Zone Portfolio
            </h1>
            <p className="text-lg md:text-xl text-black/70 dark:text-white/70 font-light max-w-3xl mx-auto mb-8">
              Premium multifamily developments in Arizona's most promising opportunity zones
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm">
                <MapPin className="w-4 h-4" />
                Phoenix-Mesa MSA
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm">
                <DollarSign className="w-4 h-4" />
                $250K Minimum Investment
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm">
                <Briefcase className="w-4 h-4" />
                ACARA OZ Fund I LLC
              </span>
            </div>
          </div>
        </header>

        {/* Property Portfolio Grid */}
        <section className="py-16 md:py-24 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black dark:text-white mb-4">
                Investment Portfolio
              </h2>
              <p className="text-lg md:text-xl text-black/70 dark:text-white/70 font-light">
                Explore our premium opportunity zone developments
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* The Edge on Main */}
              <Link
                href="/the-edge-on-main"
                className="group bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-[1.02]"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">The Edge on Main</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Mesa, AZ • 439 Units</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Transit-oriented development adjacent to light rail station</p>
                  <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">Explore Property →</span>
                </div>
              </Link>

              {/* The Meridian District */}
                <Link
                href="/marshall-st-louis"
                className="group bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-[1.02]"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                    <Building className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">The Marshall St. Louis</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">St. Louis, MO • 177 Units</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Student housing adjacent to St. Louis University campus</p>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">Explore Property →</span>
                </div>
              </Link>

              {/* Phoenix Gateway Plaza */}
              <Link
                href="/sogood-dallas"
                className="group bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-[1.02]"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Building className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">SoGood Dallas</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Dallas, TX • 388 Units</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Innovation district with mixed-use development</p>
                  <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:underline">Explore Property →</span>
                </div>
                </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 md:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-black dark:text-white mb-6">
              Ready to Invest?
            </h2>
            <p className="text-lg text-black/70 dark:text-white/70 mb-8">
              Contact our team to learn more about these exclusive opportunity zone investments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                onClick={() => window.location.href = 'mailto:deals@acaracap.com?subject=Investment Inquiry - ACARA OZ Portfolio'}
              >
                Contact Investment Team
              </button>
            <button
                className="px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-lg"
                onClick={() => window.location.href = 'mailto:vault-access@acaracap.com?subject=Request Vault Access'}
            >
              Request Vault Access
            </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
