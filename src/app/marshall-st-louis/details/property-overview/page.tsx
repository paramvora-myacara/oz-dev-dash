'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Building, Waves, Dumbbell, Laptop, Coffee, Building2, Users, Utensils, Car, MapPin, Bus, Plane } from "lucide-react";
import BackgroundSlideshow from '../../../../components/BackgroundSlideshow';
import { getRandomImages } from '../../../../utils/supabaseImages';
import FloorplanSitemapSection from '../../../../components/FloorplanSitemapSection';

export const metadata = {
  title: "Property Overview – The Marshall St. Louis",
};

export default function PropertyOverviewPage() {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        console.log('[PropertyOverview] Starting to load background images...');
        // Get random 7 images for background slideshow
        const images = await getRandomImages('marshall-st-louis-001', 'general', 7);
        console.log('[PropertyOverview] Loaded images:', images);
        setBackgroundImages(images);
      } catch (error) {
        console.error('[PropertyOverview] Error loading background images:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBackgroundImages();
  }, []);

  const amenities = [
    { name: "Professional Fitness Center", icon: <Dumbbell className="w-6 h-6" /> },
    { name: "Expansive Hot-Tub Complex", icon: <Waves className="w-6 h-6" /> },
    { name: "Collaborative Study Spaces", icon: <Laptop className="w-6 h-6" /> },
    { name: "Individual Study Pods", icon: <Users className="w-6 h-6" /> },
    { name: "Entertainment Room", icon: <Building2 className="w-6 h-6" /> },
    { name: "Café with Seating", icon: <Coffee className="w-6 h-6" /> },
    { name: "Grilling Stations", icon: <Utensils className="w-6 h-6" /> },
    { name: "Sauna & Wellness", icon: <Waves className="w-6 h-6" /> }
  ];

  const unitMix = [
    { type: "Studio", count: 18, sqft: "420-520", rent: "$1,376/bed" },
    { type: "1 Bedroom", count: 15, sqft: "680-780", rent: "$1,545/bed" },
    { type: "2 Bedroom", count: 40, sqft: "950-1,150", rent: "$1,177/bed" },
    { type: "3 Bedroom", count: 30, sqft: "1,200-1,400", rent: "$1,121/bed" },
    { type: "4 Bedroom", count: 60, sqft: "1,450-1,650", rent: "$960/bed" },
    { type: "Townhouse", count: 14, sqft: "1,800-2,200", rent: "$1,129/bed" }
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/marshall-st-louis#investment-cards" 
          className="inline-flex items-center text-indigo-300 hover:text-indigo-100 mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-5xl"><Building className="w-12 h-12 text-indigo-400" /></div>
          <div>
            <h1 className="text-5xl font-semibold text-indigo-300 tracking-tight">
              The Marshall St. Louis
            </h1>
            <p className="text-xl text-indigo-200 mt-2">
              Premium student housing development adjacent to St. Louis University
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
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/marshall-st-louis#investment-cards" 
              className="inline-flex items-center text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 mb-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </Link>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl"><Building className="w-12 h-12 text-indigo-600 dark:text-indigo-400" /></div>
              <div>
                <h1 className="text-5xl font-semibold text-indigo-900 dark:text-indigo-300 tracking-tight">
                  The Marshall St. Louis
                </h1>
                <p className="text-xl text-indigo-700 dark:text-indigo-400 mt-2">
                  Premium student housing development adjacent to St. Louis University
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
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/marshall-st-louis#investment-cards" 
              className="inline-flex items-center text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 mb-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </Link>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl"><Building className="w-12 h-12 text-indigo-600 dark:text-indigo-400" /></div>
              <div>
                <h1 className="text-5xl font-semibold text-indigo-900 dark:text-indigo-300 tracking-tight">
                  The Marshall St. Louis
                </h1>
                <p className="text-xl text-indigo-700 dark:text-indigo-400 mt-2">
                  Premium student housing development adjacent to St. Louis University
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Floorplan & Sitemap Section - Only shows if images are available */}
      <FloorplanSitemapSection projectId="marshall-st-louis-001" />

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Property Facts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Total Units</h3>
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">177</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">Student housing units</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Total Bedrooms</h3>
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">508</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">Individual bedrooms</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Total SF</h3>
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">368K</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">Gross square feet</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Stories</h3>
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">5</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">Over 2-level parking podium</p>
            </div>
          </div>

          {/* Location & Accessibility */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Location & Transportation</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><MapPin className="w-6 h-6 text-red-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">St. Louis University Campus</h4>
                    <p className="text-gray-600 dark:text-gray-400">600 feet from main campus (15,200 students)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Building2 className="w-6 h-6 text-blue-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Cortex Innovation District</h4>
                    <p className="text-gray-600 dark:text-gray-400">0.5 miles from 200-acre tech hub</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Bus className="w-6 h-6 text-green-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Medical Campus Access</h4>
                    <p className="text-gray-600 dark:text-gray-400">0.6 miles from BJC/WashU Medical Campus</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Utensils className="w-6 h-6 text-purple-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">City Foundry</h4>
                    <p className="text-gray-600 dark:text-gray-400">Adjacent to $300M mixed-use development</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Timeline</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Groundbreaking</h4>
                    <p className="text-gray-600 dark:text-gray-400">Q1 2023 - Completed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Construction Progress</h4>
                    <p className="text-gray-600 dark:text-gray-400">99% Complete - Interior in progress</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Expected Delivery</h4>
                    <p className="text-gray-600 dark:text-gray-400">April 2025</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Occupancy Start</h4>
                    <p className="text-gray-600 dark:text-gray-400">May 2025 ({">"}60% pre-leased)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Premium Amenities (15,847 SF)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                  <div className="text-indigo-600 dark:text-indigo-400">{amenity.icon}</div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unit Mix */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Unit Mix & Pricing</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Unit Type</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Count</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Square Feet</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Rate per Bed</th>
                  </tr>
                </thead>
                <tbody>
                  {unitMix.map((unit, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{unit.type}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{unit.count}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{unit.sqft}</td>
                      <td className="py-3 font-semibold text-indigo-600 dark:text-indigo-400">{unit.rent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Special Features</h4>
              <p className="text-gray-600 dark:text-gray-400">
                "Townhouse in the Sky" units on top floors featuring two-story layouts. All units include granite countertops, 
                manufactured wood floors, stainless steel appliances, in-unit washer/dryer, and come fully furnished.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}