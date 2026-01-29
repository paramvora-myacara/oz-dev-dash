import React, { useState, useEffect, useCallback } from 'react';
import { iconMap } from '../shared/iconMap';
import { Editable } from '@/components/Editable';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import ImageManager from '@/components/editor/ImageManager';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';
import { getAvailableImages } from '@/utils/supabaseImages';
import { getProjectIdFromSlug } from '@/utils/listing';

interface SponsorIntroSectionProps {
  data: any;
  sectionIndex: number;
  developerWebsite?: string | null;
  isEditMode?: boolean;
  listingSlug?: string;
}

const SponsorIntroSection: React.FC<SponsorIntroSectionProps> = ({ 
  data: initialData, 
  sectionIndex, 
  developerWebsite,
  isEditMode = false,
  listingSlug = ''
}) => {
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [folderImages, setFolderImages] = useState<string[]>([]);
  const { draftData } = useListingDraftStore();
  const projectId = getProjectIdFromSlug(listingSlug);

  const basePath = `details.sponsorProfile.sections[${sectionIndex}].data`;
  const data = (draftData ? getByPath(draftData, basePath) : null) ?? initialData;

  const loadImages = useCallback(async () => {
    if (!listingSlug) return;
    try {
      const images = await getAvailableImages(projectId, 'details/sponsor-profile/about');
      setFolderImages(images);
    } catch (error) {
      console.error('Error loading sponsor intro images:', error);
    }
  }, [projectId, listingSlug]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const renderHighlightIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6 text-blue-500" /> : null;
  };

  const handleImagesChange = () => {
    // Re-scan folder after changes
    loadImages();
  };

  if (!data) {
    return <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
      <p className="text-gray-500 dark:text-gray-400">Sponsor intro data is loading...</p>
    </div>;
  }

  // Use the first image from the folder if it exists
  const displayImage = folderImages.length > 0 ? folderImages[0] : null;
  const hasImage = !!displayImage;

  return (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
    <Editable 
      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.sponsorName`}
      value={data.sponsorName}
      className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
      as="p"
      spacing="large"
    />
    
    <div className={`grid grid-cols-1 ${hasImage ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
      {/* Text Columns */}
      <div className={hasImage ? 'lg:col-span-1' : ''}>
        {data.content?.paragraphs?.map((p: string, i: number) => (
          <Editable 
            key={i}
            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.content.paragraphs[${i}]`}
            value={p}
            inputType="multiline"
            className="text-lg text-gray-600 dark:text-gray-400"
            as="p"
            spacing="medium"
          />
        ))}
      </div>
      <div>
        {data.highlights?.map((highlight: any, i: number) => (
          <div key={i} className="flex items-start space-x-3 mb-4">
            {renderHighlightIcon(highlight.icon)}
            <div>
              <Editable 
                dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.highlights[${i}].title`}
                value={highlight.title}
                className="font-semibold text-gray-900 dark:text-gray-100"
                as="p"
                spacing="small"
              />
              <Editable 
                dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.highlights[${i}].description`}
                value={highlight.description}
                inputType="multiline"
                className="text-gray-600 dark:text-gray-400"
                as="p"
                spacing="none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Optional Image Section - Moved to the RIGHT */}
      {hasImage && (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white dark:bg-gray-800 group border border-gray-100 dark:border-gray-700 shadow-sm">
          <Image 
            src={displayImage} 
            alt={data.sponsorName}
            fill
            className="object-contain p-4"
            unoptimized
          />
          {isEditMode && (
            <button
              onClick={() => setIsImageManagerOpen(true)}
              className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Manage Images"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      )}

      {/* If no image and in edit mode, show upload button at the end */}
      {!hasImage && isEditMode && (
        <div className="flex items-center justify-center">
          <button
            onClick={() => setIsImageManagerOpen(true)}
            className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all bg-gray-50/50 dark:bg-gray-800/50"
          >
            <Plus size={32} className="mb-2" />
            <span>Add Sponsor Image</span>
          </button>
        </div>
      )}
    </div>

    {developerWebsite && (
      <div className="mt-6">
        <a
          href={developerWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 hover:underline font-semibold"
        >
          Visit Website
        </a>
      </div>
    )}

    {/* Image Manager Modal */}
    {isEditMode && listingSlug && isImageManagerOpen && (
      <ImageManager
        listingSlug={listingSlug}
        isOpen={isImageManagerOpen}
        onClose={() => setIsImageManagerOpen(false)}
        onImagesChange={handleImagesChange}
        defaultCategory="details/sponsor-profile/about"
      />
    )}
  </div>
  );
};

export default SponsorIntroSection; 
