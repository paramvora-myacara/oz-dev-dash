'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

export default function Lightbox({
  images,
  startIndex = 0,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onClose();
  };
  
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      {/* Main image */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
         <Image
            src={images[currentIndex]}
            alt={`Lightbox image ${currentIndex + 1}`}
            width={1920}
            height={1080}
            className="object-contain w-auto h-auto max-w-full max-h-full"
            quality={100}
            priority
            unoptimized
          />
      </div>

      {/* Controls */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={showPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={showNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black/50 px-2 py-1 rounded-md">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
} 