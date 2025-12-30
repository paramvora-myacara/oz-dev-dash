'use client';

import Link from "next/link";
import { useEffect } from 'react';
import { Suspense } from 'react'


function PortfolioPageContent() {

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="relative z-30 p-4 md:p-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white tracking-tight mb-6">
              OZListings Portfolio
            </h1>
            <p className="text-lg md:text-xl text-black/70 dark:text-white/70 font-light max-w-3xl mx-auto mb-8">
              Welcome to the OZListings management dashboard. For browsing available properties, visit our public listings page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://OZListings.com/listings"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
              >
                See listings
              </Link>
            </div>
          </div>
        </header>

      </div>
    </div>
  );
}

export default function PortfolioPage() {
   useEffect(() => {
    document.title = "OZListings Portfolio";
  }, []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PortfolioPageContent />
    </Suspense>
  )
}
