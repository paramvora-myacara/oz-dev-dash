// src/components/listing/details/market-analysis/MarketContextImagesSection.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, ChevronLeft, ChevronRight, ZoomIn, Download, Plus } from 'lucide-react';
import { getAvailableImages } from '@/utils/supabaseImages';
import Lightbox from '@/components/Lightbox';
import ImageManager from '@/components/editor/ImageManager';
import { getProjectIdFromSlug } from '@/utils/listing';

interface MarketContextImagesSectionProps {
  isEditMode?: boolean;
  listingSlug?: string;
}

export default function MarketContextImagesSection({ 
  isEditMode = false,
  listingSlug = ''
}: MarketContextImagesSectionProps) {
  const projectId = getProjectIdFromSlug(listingSlug);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    images: string[];
    startIndex: number;
  }>({
    isOpen: false,
    images: [],
    startIndex: 0,
  });
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  const loadImages = useCallback(async () => {
    if (!projectId) return;
    try {
      const marketImages = await getAvailableImages(projectId, 'details/market-analysis/market-context-images');
      setImages(marketImages);
    } catch (error) {
      console.error('Error loading market context images:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const openLightbox = (index: number) => {
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

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setImageLoading(true);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageLoading(true);
  };

  const handleImagesChange = async () => {
    await loadImages();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 w-48 mx-auto"></div>
          <div className="aspect-[21/9] bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (images.length === 0 && !isEditMode) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Market Context
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Visual overview of the surrounding market and local environment.
        </p>
      </div>

      <div className={`relative group bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
        images.length === 0 && isEditMode ? 'border-dashed cursor-pointer hover:border-blue-400' : ''
      }`}
      onClick={images.length === 0 && isEditMode ? () => setIsImageManagerOpen(true) : undefined}>
        
        <div className="absolute top-8 left-8 z-10 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          {images.length > 1 && (
            <div className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {currentIndex + 1}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mx-1">/</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {images.length}
              </span>
            </div>
          )}
        </div>

        {images.length > 0 ? (
          <div 
            className="relative aspect-[21/9] bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden cursor-zoom-in"
            onClick={() => openLightbox(currentIndex)}
          >
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
            <Image
              src={images[currentIndex]}
              alt={`Market context view ${currentIndex + 1}`}
              fill
              className={`object-contain transition-opacity duration-500 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              unoptimized
            />

            {/* Controls */}
            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); openLightbox(currentIndex); }}
                className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
              >
                <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={(e) => downloadImage(e, images[currentIndex])}
                className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
              >
                <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-2xl hover:bg-white dark:hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-2xl hover:bg-white dark:hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                >
                  <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="aspect-[21/9] bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Plus size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">Add Market Context Images</p>
          </div>
        )}

        {isEditMode && listingSlug && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsImageManagerOpen(true);
            }}
            className="absolute bottom-8 right-8 p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-500/20 z-10 flex items-center gap-2 font-bold"
          >
            <Plus size={20} />
            Manage Images
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox.isOpen && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          onClose={closeLightbox}
        />
      )}

      {/* Image Manager */}
      {isEditMode && listingSlug && (
        <ImageManager
          listingSlug={listingSlug}
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          onImagesChange={handleImagesChange}
          defaultCategory="details/market-analysis/market-context-images"
        />
      )}
    </div>
  );
}
