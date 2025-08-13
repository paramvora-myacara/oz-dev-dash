'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { MapPin, DollarSign, Briefcase } from "lucide-react";
import ImageCarousel from '@/components/ImageCarousel';
import Lightbox from '@/components/Lightbox';
import { getRandomImages } from '@/utils/supabaseImages';
import { HeroSectionData } from '@/types/listing';

const HeroSection: React.FC<{ data: HeroSectionData; projectId: string; sectionIndex: number }> = ({ data, projectId, sectionIndex }) => {
    const [heroImages, setHeroImages] = useState<string[]>([]);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

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
    }, [projectId]);

    const handleImageClick = (index: number) => {
        setLightboxStartIndex(index);
        setIsLightboxOpen(true);
    };

    return (
        <>
            <header className="relative z-30 p-4 md:p-8 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white tracking-tight mb-6">
                        {data.listingName}
                    </h1>
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm">
                            <MapPin className="w-4 h-4" />
                            {data.location}
                        </span>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <DollarSign className="w-4 h-4" />
                            ${data.minInvestment / 1000}K Minimum Investment
                        </span>
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
                </div>
                {isLightboxOpen && (
                    <Lightbox
                        images={heroImages}
                        startIndex={lightboxStartIndex}
                        onClose={() => setIsLightboxOpen(false)}
                    />
                )}
            </section>
        </>
    );
};

export default HeroSection; 