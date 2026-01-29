import React, { useState, useEffect, useCallback } from 'react';
import { Editable } from '@/components/Editable';
import Image from 'next/image';
import { Plus, User } from 'lucide-react';
import ImageManager from '@/components/editor/ImageManager';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { slugify } from '@/utils/slugify';
import { getByPath } from '@/utils/objectPath';
import { getAvailableImages } from '@/utils/supabaseImages';
import { getProjectIdFromSlug } from '@/utils/listing';

interface LeadershipTeamSectionProps {
  data: any;
  sectionIndex: number;
  isEditMode?: boolean;
  listingSlug?: string;
}

const LeadershipTeamSection: React.FC<LeadershipTeamSectionProps> = ({ 
  data: initialData, 
  sectionIndex,
  isEditMode = false,
  listingSlug = ''
}) => {
  const [openImageManagerFor, setOpenImageManagerFor] = useState<number | null>(null);
  const [memberImages, setMemberImages] = useState<{ [key: number]: string[] }>({});
  const { draftData } = useListingDraftStore();
  const projectId = getProjectIdFromSlug(listingSlug);

  const basePath = `details.sponsorProfile.sections[${sectionIndex}].data`;
  const data = (draftData ? getByPath(draftData, basePath) : null) ?? initialData;

  const loadMemberImages = useCallback(async () => {
    if (!listingSlug || !data?.teamMembers) return;
    
    const imageMap: { [key: number]: string[] } = {};
    await Promise.all(
      data.teamMembers.map(async (member: any, idx: number) => {
        try {
          const images = await getAvailableImages(
            projectId, 
            `details/sponsor-profile/leadership/${slugify(member.name)}`
          );
          imageMap[idx] = images;
        } catch (error) {
          console.error(`Error loading images for ${member.name}:`, error);
          imageMap[idx] = [];
        }
      })
    );
    setMemberImages(imageMap);
  }, [projectId, listingSlug, data?.teamMembers]);

  useEffect(() => {
    loadMemberImages();
  }, [loadMemberImages]);

  if (!data?.teamMembers) {
    return <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <p className="text-gray-500 dark:text-gray-400">Leadership team data is loading...</p>
    </div>;
  }

  // Check if any team member has an image in their folder
  const anyMemberHasFolderImage = Object.values(memberImages).some(images => images.length > 0);
  const showImageRow = anyMemberHasFolderImage || isEditMode;

  const handleImagesChange = () => {
    // Re-scan folders after changes
    loadMemberImages();
  };

  return (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Leadership Team</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.teamMembers.map((member: any, idx: number) => {
        const displayImage = memberImages[idx]?.length > 0 ? memberImages[idx][0] : null;
        
        return (
          <div key={idx} className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex flex-col">
            {/* Optional Image Row */}
            {showImageRow && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white dark:bg-gray-800 mb-4 mx-auto group border border-blue-100 dark:border-blue-900/20 shadow-sm">
                {displayImage ? (
                  <Image 
                    src={displayImage} 
                    alt={member.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={32} />
                  </div>
                )}
                
                {isEditMode && (
                  <button
                    onClick={() => setOpenImageManagerFor(idx)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Manage Images"
                  >
                    <Plus size={20} className="text-white" />
                  </button>
                )}
              </div>
            )}

            <Editable 
              dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.teamMembers[${idx}].name`}
              value={member.name}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center"
              as="p"
              spacing="small"
            />
            <Editable 
              dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.teamMembers[${idx}].title`}
              value={member.title}
              className="text-blue-600 dark:text-blue-400 font-medium text-center"
              as="p"
              spacing="small"
            />
            {(member.experience || isEditMode) && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                <Editable 
                  dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.teamMembers[${idx}].experience`}
                  value={member.experience}
                  className="text-sm text-gray-600 dark:text-gray-400"
                  as="span"
                  spacing="none"
                  placeholder="Add experience..."
                />
                {member.experience && <span> experience</span>}
              </div>
            )}
            <Editable 
              dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.teamMembers[${idx}].background`}
              value={member.background}
              inputType="multiline"
              className="text-sm text-gray-600 dark:text-gray-400"
              as="p"
              spacing="none"
            />
          </div>
        );
      })}
    </div>

    {/* Image Manager Modal */}
    {isEditMode && listingSlug && openImageManagerFor !== null && (
      <ImageManager
        listingSlug={listingSlug}
        isOpen={openImageManagerFor !== null}
        onClose={() => setOpenImageManagerFor(null)}
        onImagesChange={handleImagesChange}
        defaultCategory={`details/sponsor-profile/leadership/${slugify(data.teamMembers[openImageManagerFor].name)}`}
      />
    )}
  </div>
    );
};

export default LeadershipTeamSection; 
