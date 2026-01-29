'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { MapPin, DollarSign, Briefcase, Plus, ShieldCheck } from "lucide-react";
import ImageCarousel from '@/components/ImageCarousel';
import Lightbox from '@/components/Lightbox';
import { getRandomImages } from '@/utils/supabaseImages';
import { HeroSectionData } from '@/types/listing';
import ImageManager from '@/components/editor/ImageManager';
import { getProjectIdFromSlug } from '@/utils/listing';

interface HeroSectionProps {
  data: HeroSectionData;
  listingSlug: string;
  sectionIndex: number;
  isEditMode?: boolean;
  executiveSummary?: string | null;
  isVerifiedOzProject?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  data, 
  listingSlug, 
  sectionIndex, 
  isEditMode = false,
  executiveSummary = null,
  isVerifiedOzProject = false
}) => {
    const projectId = getProjectIdFromSlug(listingSlug);
    const [heroImages, setHeroImages] = useState<string[]>([]);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
    const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

    useEffect(() => {
        async function loadHeroImages() {
          try {
            const images = await getRandomImages(projectId, 'general', 5);
            setHeroImages(images);
          } catch (error) {
            console.error('Error loading hero images:', error);
          }
        }
        loadHeroImages();
    }, [listingSlug, projectId]);

    const handleImageClick = (index: number) => {
        setLightboxStartIndex(index);
        setIsLightboxOpen(true);
    };

    const handleImagesChange = (newImages: string[]) => {
        setHeroImages(newImages);
    };

    return (
        <>
            <header className="relative z-30 p-4 md:p-8 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white tracking-tight mb-6">
                        {data.listingName}
                    </h1>
                    {executiveSummary && (
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                            {executiveSummary}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                        {isVerifiedOzProject && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                <ShieldCheck className="w-4 h-4" />
                                Verified OZ Project
                            </span>
                        )}
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm">
                            <MapPin className="w-4 h-4" />
                            {data.location}
                        </span>
                        {data.minInvestment && data.minInvestment > 0 && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                <DollarSign className="w-4 h-4" />
                                {data.minInvestment / 1000}K Minimum Investment
                            </span>
                        )}
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <Briefcase className="w-4 h-4" />
                            {data.fundName}
                        </span>
                    </div>
                </div>
            </header>
            <section className="h-[30vh] sm:h-[40vh] md:h-[50vh] relative overflow-hidden px-4 md:px-8">
                <div className="absolute inset-0">
                    {heroImages.length > 0 ? (
                        <ImageCarousel
                            images={heroImages}
                            className="h-full rounded-3xl"
                            intervalMs={4000}
                            autoplay={true}
                            onImageClick={handleImageClick}
                        />
                    ) : (
                        <Image
                            src="/property-hero.jpg"
                            alt={`${data.listingName} property image`}
                            fill
                            className="object-cover rounded-3xl"
                            priority
                            unoptimized
                        />
                    )}
                    
                    {/* Manage Images Button - positioned over the hero image */}
                    {isEditMode && (
                        <button
                            onClick={() => setIsImageManagerOpen(true)}
                            className="absolute top-4 right-4 z-10 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                            title="Manage Images"
                        >
                            <Plus size={24} />
                        </button>
                    )}
                </div>
                {isLightboxOpen && (
                    <Lightbox
                        images={heroImages}
                        startIndex={lightboxStartIndex}
                        onClose={() => setIsLightboxOpen(false)}
                    />
                )}
            </section>

            {/* Image Manager Modal */}
            {isEditMode && (
                <ImageManager
                    listingSlug={listingSlug}
                    isOpen={isImageManagerOpen}
                    onClose={() => setIsImageManagerOpen(false)}
                    onImagesChange={handleImagesChange}
                />
            )}
        </>
    );
};

export default HeroSection; 