// src/components/FloorplanSitemapSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Map, Home, ChevronLeft, ChevronRight, ZoomIn, Download, Plus } from 'lucide-react';
import { getAvailableImages, type ProjectId, type ImageCategory } from '../utils/supabaseImages';
import Lightbox from './Lightbox';
import ImageManager from './editor/ImageManager';
import { getProjectIdFromSlug } from '../utils/listing';

interface FloorplanSitemapSectionProps {
  isEditMode?: boolean;
  listingSlug?: string;
}

export default function FloorplanSitemapSection({ 
  isEditMode = false,
  listingSlug = ''
}: FloorplanSitemapSectionProps) {
  const projectId = getProjectIdFromSlug(listingSlug);
  const [floorplanImages, setFloorplanImages] = useState<string[]>([]);
  const [sitemapImages, setSitemapImages] = useState<string[]>([]);
  const [floorplanIndex, setFloorplanIndex] = useState(0);
  const [sitemapIndex, setSitemapIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({ floorplan: true, sitemap: true });
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    images: string[];
    startIndex: number;
  }>({
    isOpen: false,
    images: [],
    startIndex: 0,
  });
  const [imageManager, setImageManager] = useState<{
    isOpen: boolean;
    category: 'floorplan' | 'sitemap';
  }>({
    isOpen: false,
    category: 'floorplan'
  });

  useEffect(() => {
    async function loadImages() {
      try {
        const [floorplans, sitemaps] = await Promise.all([
          getAvailableImages(projectId, 'details/property-overview/floorplansitemapsection/floorplan'),
          getAvailableImages(projectId, 'details/property-overview/floorplansitemapsection/sitemap')
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

  const openLightbox = (images: string[], index: number) => {
    setLightbox({ isOpen: true, images, startIndex: index });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, images: [], startIndex: 0 });
  };
  
  const downloadImage = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('download', '');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextFloorplan = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFloorplanIndex((prev) => (prev + 1) % floorplanImages.length);
    setImageLoading(prev => ({ ...prev, floorplan: true }));
  };

  const prevFloorplan = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFloorplanIndex((prev) => (prev - 1 + floorplanImages.length) % floorplanImages.length);
    setImageLoading(prev => ({ ...prev, floorplan: true }));
  };

  const nextSitemap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSitemapIndex((prev) => (prev + 1) % sitemapImages.length);
    setImageLoading(prev => ({ ...prev, sitemap: true }));
  };

  const prevSitemap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSitemapIndex((prev) => (prev - 1 + sitemapImages.length) % sitemapImages.length);
    setImageLoading(prev => ({ ...prev, sitemap: true }));
  };

  const openImageManager = (category: 'floorplan' | 'sitemap') => {
    setImageManager({ isOpen: true, category });
  };

  const handleImagesChange = async () => {
    // Reload images after changes
    try {
      const [floorplans, sitemaps] = await Promise.all([
        getAvailableImages(projectId, 'details/property-overview/floorplansitemapsection/floorplan'),
        getAvailableImages(projectId, 'details/property-overview/floorplansitemapsection/sitemap')
      ]);

      setFloorplanImages(floorplans);
      setSitemapImages(sitemaps);
    } catch (error) {
      console.error('Error reloading images:', error);
    }
  };

  // Don't render if no images are available
  if (loading) {
    return (
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 w-48"></div>
              <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 w-48"></div>
              <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }


  // Determine if we should center the content (when only one section has images)
  const shouldCenter = (floorplanImages.length > 0 && sitemapImages.length === 0) || 
                      (floorplanImages.length === 0 && sitemapImages.length > 0);

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Property Plans & Layouts
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore detailed floor plans and site maps to understand the property layout and design
          </p>
        </div>

        <div className={`grid gap-12 ${
          shouldCenter 
            ? 'grid-cols-1 max-w-4xl mx-auto' 
            : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          
          {/* Floorplans */}
          {(floorplanImages.length > 0 || isEditMode) && (
            <div className="group h-full">
              <div className={`h-full flex flex-col bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border transition-all duration-300 transform hover:-translate-y-1 ${
                floorplanImages.length === 0 && isEditMode
                  ? 'border-gray-100 dark:border-gray-700 border-dashed cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600'
                  : 'border-gray-100 dark:border-gray-700 hover:shadow-2xl'
              }`}
              onClick={floorplanImages.length === 0 && isEditMode ? () => openImageManager('floorplan') : undefined}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${
                        floorplanImages.length === 0 && isEditMode
                          ? 'text-gray-500 dark:text-gray-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        Floor Plans
                      </h3>
                      <p className={`${
                        floorplanImages.length === 0 && isEditMode
                          ? 'text-gray-500 dark:text-gray-500'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>Detailed unit layouts</p>
                    </div>
                  </div>
                  {floorplanImages.length > 1 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                      <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        {floorplanIndex + 1}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">of</span>
                      <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        {floorplanImages.length}
                      </span>
                    </div>
                  )}
                </div>
                
                {floorplanImages.length > 0 ? (
                  <div
                    className="relative flex-grow min-h-[300px] lg:min-h-[50vh] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-inner cursor-zoom-in"
                    onClick={() => openLightbox(floorplanImages, floorplanIndex)}
                  >
                    {imageLoading.floorplan && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      </div>
                    )}
                    <Image
                      src={floorplanImages[floorplanIndex]}
                      alt={`Floor plan ${floorplanIndex + 1}`}
                      fill
                      className={`object-contain p-6 transition-opacity duration-300 ${
                        imageLoading.floorplan ? 'opacity-0' : 'opacity-100'
                      }`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onLoad={() => setImageLoading(prev => ({ ...prev, floorplan: false }))}
                      unoptimized
                    />

                    {/* Image Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); openLightbox(floorplanImages, floorplanIndex); }}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={(e) => downloadImage(e, floorplanImages[floorplanIndex])}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        aria-label="Download image"
                      >
                        <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>

                    {/* Edit Mode + Button - positioned over the image */}
                    {isEditMode && listingSlug && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageManager('floorplan');
                        }}
                        className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl z-10"
                        title="Manage Floorplan Images"
                      >
                        <Plus size={20} />
                      </button>
                    )}

                    {floorplanImages.length > 1 && (
                      <>
                        <button
                          onClick={prevFloorplan}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                          aria-label="Previous floorplan"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextFloorplan}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                          aria-label="Next floorplan"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  // Placeholder when no floorplan images
                  <div className="relative flex-grow min-h-[300px] lg:min-h-[50vh] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center opacity-60">
                    <div className="text-center">
                      <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Click to add floor plans</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center items-start pt-6 h-[36px]">
                  {floorplanImages.length > 1 && (
                    <div className="flex justify-center space-x-3">
                      {floorplanImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFloorplanIndex(index);
                            setImageLoading(prev => ({ ...prev, floorplan: true }));
                          }}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === floorplanIndex 
                              ? 'bg-indigo-600 dark:bg-indigo-400 scale-125' 
                              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                          aria-label={`Go to floorplan ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sitemaps */}
          {(sitemapImages.length > 0 || isEditMode) && (
            <div className="group h-full">
              <div className={`h-full flex flex-col bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border transition-all duration-300 transform hover:-translate-y-1 ${
                sitemapImages.length === 0 && isEditMode
                  ? 'border-gray-100 dark:border-gray-700 border-dashed cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-600'
                  : 'border-gray-100 dark:border-gray-700 hover:shadow-2xl'
              }`}
              onClick={sitemapImages.length === 0 && isEditMode ? () => openImageManager('sitemap') : undefined}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                      <Map className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${
                        sitemapImages.length === 0 && isEditMode
                          ? 'text-gray-500 dark:text-gray-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        Site Map
                      </h3>
                      <p className={`${
                        sitemapImages.length === 0 && isEditMode
                          ? 'text-gray-500 dark:text-gray-500'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>Property layout & location</p>
                    </div>
                  </div>
                  {sitemapImages.length > 1 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {sitemapIndex + 1}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">of</span>
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {sitemapImages.length}
                      </span>
                    </div>
                  )}
                </div>
                
                {sitemapImages.length > 0 ? (
                  <div
                    className="relative flex-grow min-h-[300px] lg:min-h-[50vh] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-inner cursor-zoom-in"
                    onClick={() => openLightbox(sitemapImages, sitemapIndex)}
                  >
                    {imageLoading.sitemap && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      </div>
                    )}
                    <Image
                      src={sitemapImages[sitemapIndex]}
                      alt={`Site map ${sitemapIndex + 1}`}
                      fill
                      className={`object-contain p-6 transition-opacity duration-300 ${
                        imageLoading.sitemap ? 'opacity-0' : 'opacity-100'
                      }`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onLoad={() => setImageLoading(prev => ({ ...prev, sitemap: false }))}
                      unoptimized
                    />

                    {/* Image Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); openLightbox(sitemapImages, sitemapIndex); }}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={(e) => downloadImage(e, sitemapImages[sitemapIndex])}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        aria-label="Download image"
                      >
                        <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>

                    {/* Edit Mode + Button - positioned over the image */}
                    {isEditMode && listingSlug && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageManager('sitemap');
                        }}
                        className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl z-10"
                        title="Manage Sitemap Images"
                      >
                        <Plus size={20} />
                      </button>
                    )}

                    {sitemapImages.length > 1 && (
                      <>
                        <button
                          onClick={prevSitemap}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                          aria-label="Previous sitemap"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextSitemap}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                          aria-label="Next sitemap"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  // Placeholder when no sitemap images
                  <div className="relative flex-grow min-h-[300px] lg:min-h-[50vh] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center opacity-60">
                    <div className="text-center">
                      <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Click to add site maps</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center items-start pt-6 h-[36px]">
                  {sitemapImages.length > 1 && (
                    <div className="flex justify-center space-x-3">
                      {sitemapImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSitemapIndex(index);
                            setImageLoading(prev => ({ ...prev, sitemap: true }));
                          }}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === sitemapIndex 
                              ? 'bg-emerald-600 dark:bg-emerald-400 scale-125' 
                              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                          aria-label={`Go to sitemap ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Lightbox */}
      {lightbox.isOpen && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          onClose={closeLightbox}
        />
      )}

      {/* Image Manager Modal */}
      {isEditMode && listingSlug && (
        <ImageManager
          listingSlug={listingSlug}
          isOpen={imageManager.isOpen}
          onClose={() => setImageManager({ isOpen: false, category: 'floorplan' })}
          onImagesChange={handleImagesChange}
          defaultCategory={
            imageManager.category === 'floorplan'
              ? 'details/property-overview/floorplansitemapsection/floorplan'
              : 'details/property-overview/floorplansitemapsection/sitemap'
          }
        />
      )}

    </section>
  );
}