// src/components/ImageCarousel.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  className?: string;
  intervalMs?: number;
  fadeTransition?: boolean;
  autoplay?: boolean;
  onImageClick?: (index: number) => void;
}

export default function ImageCarousel({ 
  images, 
  className = '',
  intervalMs = 4000,
  fadeTransition = true,
  autoplay = true,
  onImageClick
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!autoplay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [images.length, intervalMs, autoplay]);

  useEffect(() => {
    // Preload the first image
    if (images.length > 0) {
      const img = new window.Image();
      img.onload = () => setIsLoading(false);
      img.src = images[0];
    }
  }, [images]);

  if (images.length === 0) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">No images available</div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className} ${
        onImageClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onImageClick && onImageClick(currentIndex)}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`Gallery image ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            priority={index === 0}
            unoptimized
          />
        </div>
      ))}
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}