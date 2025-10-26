
'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Building, MapPin, Users, TrendingUp } from "lucide-react";
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import ImageCarousel from '@/components/ImageCarousel';
import Lightbox from '@/components/Lightbox';
import { getAvailableImages } from '@/utils/supabaseImages';

export default function PortfolioProjectsPage() {
  useEffect(() => {
    document.title = "Portfolio Projects – OZ Recap Fund";
  }, []);

  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [projectImages, setProjectImages] = useState<{ [key: string]: string[] }>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const projects = [
    {
      name: "Avian",
      location: "Colorado Springs, CO",
      units: 169,
      status: "Completed / In-Stabilization",
      rentableSqFt: "133,406",
      stabilizedNOI: "$3,543,383",
      capRate: "5.25%",
      imageFolder: 'avian'
    },
    {
      name: "Solace at Cimarron Hills",
      location: "Colorado Springs, CO",
      units: 234,
      status: "Completed / In-Stabilization",
      rentableSqFt: "240,030",
      stabilizedNOI: "$3,629,459",
      capRate: "5.75%",
      imageFolder: 'cimarron-hills'
    },
    {
      name: "Solace at Ballpark Village",
      location: "Goodyear, AZ",
      units: 211,
      status: "Completed / In-Stabilization",
      rentableSqFt: "212,395",
      stabilizedNOI: "$3,140,367",
      capRate: "5.75%",
      imageFolder: 'ballpark-village'
    }
  ];

  useEffect(() => {
    async function loadAllImages() {
      // Load background images
      try {
        const bgImages = await getAvailableImages('oz-recap-fund-001', 'general');
        setBackgroundImages(bgImages.slice(0, 7));
      } catch (error) {
        console.error('Error loading background images:', error);
      }

      // Load images for each project
      const images: { [key: string]: string[] } = {};
      for (const project of projects) {
        try {
          const fetchedImages = await getAvailableImages('oz-recap-fund-001', project.imageFolder);
          images[project.name] = fetchedImages;
        } catch (error) {
          console.error(`Error loading images for ${project.name}:`, error);
        }
      }
      setProjectImages(images);
    }

    loadAllImages();
  }, []);

  const handleImageClick = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/oz-recap-fund#investment-cards" 
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
              Portfolio Projects
            </h1>
            <p className="text-xl text-indigo-200 mt-2">
              Newly Built, Stabilized Class-A Multifamily Assets
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
          <div className="grid grid-cols-1 gap-12">
            {projects.map((project, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row overflow-hidden">
                <div className="lg:w-1/2 p-8 flex flex-col">
                  <h3 className="text-3xl font-bold text-indigo-900 dark:text-indigo-300 mb-6">{project.name}</h3>
                  <div className="space-y-4 flex-grow mb-6">
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center"><MapPin className="w-5 h-5 mr-2" />Location</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{project.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center"><Users className="w-5 h-5 mr-2" />Units</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{project.units}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center"><TrendingUp className="w-5 h-5 mr-2" />Cap Rate</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{project.capRate}</span>
                    </div>
                     <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Rentable SF</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{project.rentableSqFt}</span>
                    </div>
                     <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Stabilized NOI</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{project.stabilizedNOI}</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded-full font-medium">
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="lg:w-1/2 h-64 lg:h-auto">
                  {projectImages[project.name] && projectImages[project.name].length > 0 ? (
                    <ImageCarousel
                      images={projectImages[project.name]}
                      className="h-full"
                      autoplay={true}
                      onImageClick={(index) => handleImageClick(projectImages[project.name], index)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {isLightboxOpen && (
        <Lightbox
          images={lightboxImages}
          startIndex={lightboxStartIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}
