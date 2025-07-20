'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Building, Waves, Dumbbell, Laptop, Coffee, Building2, Users, Utensils, Car, MapPin, Bus, Plane } from "lucide-react";
import BackgroundSlideshow from '../../../../components/BackgroundSlideshow';
import { getRandomImages } from '../../../../utils/supabaseImages';

export default function PropertyOverviewPage() {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        console.log('[PropertyOverview] Starting to load background images...');
        // Get random 7 images for background slideshow
        const images = await getRandomImages('sogood-dallas-001', 'general', 7);
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
    { name: "Innovation Center", icon: <Laptop className="w-6 h-6" /> },
    { name: "Retail & Dining Spaces", icon: <Building2 className="w-6 h-6" /> },
    { name: "Green Recreation Areas", icon: <Waves className="w-6 h-6" /> },
    { name: "Community Fitness Center", icon: <Dumbbell className="w-6 h-6" /> },
    { name: "Pet-Friendly Amenities", icon: <Coffee className="w-6 h-6" /> },
    { name: "Concierge Services", icon: <Users className="w-6 h-6" /> },
    { name: "Electric Vehicle Charging", icon: <Car className="w-6 h-6" /> },
    { name: "Package Management", icon: <Utensils className="w-6 h-6" /> }
  ];

  const projectPhases = [
    { 
      phase: "Phase I - The Hub at SoGood", 
      units: 116, 
      sqft: "123,777 SF", 
      features: "Innovation Center (35,264 SF) + Retail (42,794 SF)",
      timeline: "July 2025 - August 2027"
    },
    { 
      phase: "Phase II - MKT Residences", 
      units: 272, 
      sqft: "206,118 SF", 
      features: "Retail Space (6,798 SF) + Farmers Commons",
      timeline: "July 2025 - August 2027"
    }
  ];

  const locationHighlights = [
    {
      category: "Transit & Connectivity",
      features: [
        "Adjacent to future IH-30 deck park",
        "Near Dallas Farmers Market",
        "Close to Deep Ellum entertainment district",
        "Walking distance to Fair Park"
      ],
      icon: <Bus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
    },
    {
      category: "Urban Amenities",
      features: [
        "$3.7B Kay Bailey Hutchison Convention Center expansion",
        "The Cedars historic district",
        "Dallas Farmers Market dining & shopping",
        "Multiple cultural venues nearby"
      ],
      icon: <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
    },
    {
      category: "Economic Drivers",
      features: [
        "Innovation center pre-leased to GSV Ventures",
        "Property tax abatement through PFC",
        "Adaptive reuse of former industrial property",
        "Master-planned community catalyst"
      ],
      icon: <Building className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
    }
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/sogood-dallas#investment-cards" 
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
              SoGood Dallas
            </h1>
            <p className="text-xl text-indigo-200 mt-2">
              Master-planned innovation district in Dallas' southern sector
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
              href="/sogood-dallas#investment-cards" 
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
                  SoGood Dallas
                </h1>
                <p className="text-xl text-indigo-700 dark:text-indigo-400 mt-2">
                  Master-planned innovation district in Dallas' southern sector
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
              href="/sogood-dallas#investment-cards" 
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
                  SoGood Dallas
                </h1>
                <p className="text-xl text-indigo-700 dark:text-indigo-400 mt-2">
                  Master-planned innovation district in Dallas' southern sector
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Project Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">388</h4>
                <p className="text-gray-600 dark:text-gray-400">Total Units</p>
              </div>
              <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">14</h4>
                <p className="text-gray-600 dark:text-gray-400">Site Acres</p>
              </div>
              <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">84,856</h4>
                <p className="text-gray-600 dark:text-gray-400">Total Commercial SF</p>
              </div>
              <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">2027</h4>
                <p className="text-gray-600 dark:text-gray-400">Expected Delivery</p>
              </div>
            </div>
          </div>

          {/* Development Phases */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Phases</h3>
            <div className="space-y-6">
              {projectPhases.map((phase, idx) => (
                <div key={idx} className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{phase.phase}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{phase.timeline}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{phase.units}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Units</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{phase.sqft}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rentable SF</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{phase.features}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Community Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg">
                  <div className="text-indigo-600 dark:text-indigo-400">
                    {amenity.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {amenity.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {locationHighlights.map((highlight, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-3 mb-6">
                  {highlight.icon}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{highlight.category}</h3>
                </div>
                <ul className="space-y-3">
                  {highlight.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}