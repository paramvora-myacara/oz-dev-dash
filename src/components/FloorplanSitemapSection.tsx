// src/components/FloorplanSitemapSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Map, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAvailableImages, type ProjectId, type ImageCategory } from '../utils/supabaseImages';

interface FloorplanSitemapSectionProps {
  projectId: ProjectId;
}

export default function FloorplanSitemapSection({ projectId }: FloorplanSitemapSectionProps) {
  const [floorplanImages, setFloorplanImages] = useState<string[]>([]);
  const [sitemapImages, setSitemapImages] = useState<string[]>([]);
  const [floorplanIndex, setFloorplanIndex] = useState(0);
  const [sitemapIndex, setSitemapIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      try {
        const [floorplans, sitemaps] = await Promise.all([
          getAvailableImages(projectId, 'floorplan'),
          getAvailableImages(projectId, 'sitemap')
        ]);
        
        setFloorplanImages(floorplans);
        setSitemapImages(sitemaps);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [projectId]);

  const nextFloorplan = () => {
    setFloorplanIndex((prev) => (prev + 1) % floorplanImages.length);
  };

  const prevFloorplan = () => {
    setFloorplanIndex((prev) => (prev - 1 + floorplanImages.length) % floorplanImages.length);
  };

  const nextSitemap = () => {
    setSitemapIndex((prev) => (prev + 1) % sitemapImages.length);
  };

  const prevSitemap = () => {
    setSitemapIndex((prev) => (prev - 1 + sitemapImages.length) % sitemapImages.length);
  };

  // Don't render if no images are available
  if (loading) {
    return null; // Or a loading skeleton
  }

  if (floorplanImages.length === 0 && sitemapImages.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 md:px-8 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Floorplans */}
          {floorplanImages.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Floor Plans
                </h3>
                {floorplanImages.length > 1 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {floorplanIndex + 1} of {floorplanImages.length}
                  </span>
                )}
              </div>
              
              <div className="relative aspect-[4/3] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={floorplanImages[floorplanIndex]}
                  alt={`Floor plan ${floorplanIndex + 1}`}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {floorplanImages.length > 1 && (
                  <>
                    <button
                      onClick={prevFloorplan}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextFloorplan}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              
              {floorplanImages.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {floorplanImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFloorplanIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === floorplanIndex 
                          ? 'bg-indigo-600 dark:bg-indigo-400' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sitemaps */}
          {sitemapImages.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Map className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Site Map
                </h3>
                {sitemapImages.length > 1 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {sitemapIndex + 1} of {sitemapImages.length}
                  </span>
                )}
              </div>
              
              <div className="relative aspect-[4/3] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={sitemapImages[sitemapIndex]}
                  alt={`Site map ${sitemapIndex + 1}`}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {sitemapImages.length > 1 && (
                  <>
                    <button
                      onClick={prevSitemap}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextSitemap}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              
              {sitemapImages.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {sitemapImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSitemapIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === sitemapIndex 
                          ? 'bg-emerald-600 dark:bg-emerald-400' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}