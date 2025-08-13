// src/components/BackgroundSlideshow.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BackgroundSlideshowProps {
  images: string[];
  children: React.ReactNode;
  className?: string;
  intervalMs?: number;
  overlay?: boolean;
}

export default function BackgroundSlideshow({ 
  images, 
  children,
  className = '',
  intervalMs = 5000,
  overlay = true
}: BackgroundSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [images.length, intervalMs]);

  if (images.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800" />
        {overlay && <div className="absolute inset-0 bg-black/60" />}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Background Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-2000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`Background ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            priority={index === 0}
            unoptimized
          />
        </div>
      ))}
      
      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}