'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, Briefcase, Plus, User } from "lucide-react";
import Image from 'next/image';
import { FundSponsorEntitiesSectionData, SponsorEntity, SponsorTeamMember } from '@/types/listing';
import { Editable } from '@/components/Editable';
import ImageManager from '@/components/editor/ImageManager';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { slugify } from '@/utils/slugify';
import { getByPath } from '@/utils/objectPath';
import { getAvailableImages } from '@/utils/supabaseImages';
import { getProjectIdFromSlug } from '@/utils/listing';

interface FundSponsorProfileSectionProps {
  data: FundSponsorEntitiesSectionData;
  sectionIndex: number;
  isEditMode?: boolean;
  listingSlug?: string;
}

const FundSponsorProfileSection: React.FC<FundSponsorProfileSectionProps> = ({ 
  data, 
  sectionIndex, 
  isEditMode = false,
  listingSlug = ''
}) => {
  const [openImageManagerFor, setOpenImageManagerFor] = useState<{ entityIdx: number, memberIdx: number } | null>(null);
  const [memberImages, setMemberImages] = useState<{ [key: string]: string[] }>({});
  const { updateField, isEditing, draftData } = useListingDraftStore();
  const projectId = getProjectIdFromSlug(listingSlug);
  
  const basePath = `details.sponsorProfile.sections[${sectionIndex}].data.entities`;
  const entities = (draftData ? getByPath(draftData, basePath) : null) ?? data.entities ?? [];

  const loadMemberImages = useCallback(async () => {
    if (!listingSlug || !entities) return;
    
    const imageMap: { [key: string]: string[] } = {};
    const promises: Promise<void>[] = [];

    entities.forEach((entity: SponsorEntity, entityIdx: number) => {
      entity.team.forEach((member: SponsorTeamMember, memberIdx: number) => {
        promises.push(
          (async () => {
            try {
              const images = await getAvailableImages(
                projectId, 
                `details/sponsor-profile/leadership/${slugify(member.name)}`
              );
              imageMap[`${entityIdx}-${memberIdx}`] = images;
            } catch (error) {
              console.error(`Error loading images for ${member.name}:`, error);
              imageMap[`${entityIdx}-${memberIdx}`] = [];
            }
          })()
        );
      });
    });

    await Promise.all(promises);
    setMemberImages(imageMap);
  }, [projectId, listingSlug, entities]);

  useEffect(() => {
    loadMemberImages();
  }, [loadMemberImages]);
  
  const handleAddEntity = () => {
    const newEntity: SponsorEntity = {
      name: "New Entity",
      role: "Role",
      descriptionPoints: ["Description point 1", "Description point 2"],
      team: []
    };
    updateField(basePath, [...entities, newEntity]);
  };

  const handleRemoveEntity = (index: number) => {
    const updatedEntities = entities.filter((_: SponsorEntity, i: number) => i !== index);
    updateField(basePath, updatedEntities);
  };

  const handleAddDescriptionPoint = (entityIndex: number) => {
    const updatedEntities = entities.map((entity: SponsorEntity, idx: number) => {
      if (idx === entityIndex) {
        return {
          ...entity,
          descriptionPoints: [...entity.descriptionPoints, "New description point"]
        };
      }
      return entity;
    });
    updateField(basePath, updatedEntities);
  };

  const handleRemoveDescriptionPoint = (entityIndex: number, pointIndex: number) => {
    const updatedEntities = entities.map((entity: SponsorEntity, idx: number) => {
      if (idx === entityIndex) {
        return {
          ...entity,
          descriptionPoints: entity.descriptionPoints.filter((_: any, i: number) => i !== pointIndex)
        };
      }
      return entity;
    });
    updateField(basePath, updatedEntities);
  };

  const handleAddTeamMember = (entityIndex: number) => {
    const newMember: SponsorTeamMember = {
      name: "New Member",
      title: "Title",
      roleDetail: "Role Detail",
    };
    const updatedEntities = entities.map((entity: SponsorEntity, idx: number) => {
      if (idx === entityIndex) {
        return {
          ...entity,
          team: [...entity.team, newMember]
        };
      }
      return entity;
    });
    updateField(basePath, updatedEntities);
  };

  const handleRemoveTeamMember = (entityIndex: number, memberIndex: number) => {
    const updatedEntities = entities.map((entity: SponsorEntity, idx: number) => {
      if (idx === entityIndex) {
        return {
          ...entity,
          team: entity.team.filter((_: any, i: number) => i !== memberIndex)
        };
      }
      return entity;
    });
    updateField(basePath, updatedEntities);
  };

  const getIconComponent = (entityIndex: number) => {
    return entityIndex === 0 ? <Star className="w-8 h-8 text-blue-500" /> : <Briefcase className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Edit Mode Controls */}
      {isEditing && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sponsor Entities Management
            </h3>
            <button 
              onClick={handleAddEntity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Entity
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {entities.map((entity: SponsorEntity, entityIdx: number) => (
          <div key={entityIdx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            {/* Remove Entity Button */}
            {isEditing && (
              <div className="mb-4 flex justify-end">
                <button 
                  onClick={() => handleRemoveEntity(entityIdx)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Remove Entity
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left side: Description */}
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  {getIconComponent(entityIdx)}
                  <div>
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.entities[${entityIdx}].name`}
                      value={entity.name}
                      className="text-2xl font-bold text-blue-900 dark:text-blue-300"
                      as="div"
                    />
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.entities[${entityIdx}].role`}
                      value={entity.role}
                      className="text-lg font-semibold text-blue-700 dark:text-blue-400"
                      as="div"
                    />
                  </div>
                </div>
                
                {/* Add Description Point Button */}
                {isEditing && (
                  <button 
                    onClick={() => handleAddDescriptionPoint(entityIdx)}
                    className="mb-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add Description Point
                  </button>
                )}
                
                <ul className="space-y-3">
                  {entity.descriptionPoints.map((point: string, pIdx: number) => (
                    <li key={pIdx} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                      <div className="flex-1">
                        <Editable 
                          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.entities[${entityIdx}].descriptionPoints[${pIdx}]`}
                          value={point}
                          inputType="multiline"
                          className="text-lg text-gray-600 dark:text-gray-400"
                        />
                      </div>
                      {isEditing && (
                        <button 
                          onClick={() => handleRemoveDescriptionPoint(entityIdx, pIdx)}
                          className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Right side: Team grid */}
              <div>
                {/* Add Team Member Button */}
                {isEditing && (
                  <div className="mb-4 flex justify-end">
                    <button 
                      onClick={() => handleAddTeamMember(entityIdx)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Add Team Member
                    </button>
                  </div>
                )}
                
                <div className={`grid gap-x-6 gap-y-8 text-center grid-cols-3`}>
                  {entity.team.map((member: SponsorTeamMember, memberIdx: number) => {
                    const displayImage = memberImages[`${entityIdx}-${memberIdx}`]?.length > 0 
                      ? memberImages[`${entityIdx}-${memberIdx}`][0] 
                      : null;

                    return (
                      <div key={memberIdx}>
                        {/* Remove Team Member Button */}
                        {isEditing && (
                          <button 
                            onClick={() => handleRemoveTeamMember(entityIdx, memberIdx)}
                            className="mb-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            ×
                          </button>
                        )}
                        
                        <div className={`${entityIdx === 0 ? 'w-24 h-24' : 'w-16 h-16'} rounded-full mx-auto mb-3 overflow-hidden bg-gray-200 flex items-center justify-center relative group`}>
                          {displayImage ? (
                            <Image 
                              src={displayImage} 
                              alt={member.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <User size={entityIdx === 0 ? 32 : 24} />
                            </div>
                          )}

                          {isEditing && (
                            <button
                              onClick={() => setOpenImageManagerFor({ entityIdx, memberIdx })}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Manage Images"
                            >
                              <Plus size={entityIdx === 0 ? 20 : 16} className="text-white" />
                            </button>
                          )}
                        </div>
                        <Editable 
                          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.entities[${entityIdx}].team[${memberIdx}].name`}
                          value={member.name}
                          className={`font-bold text-gray-800 dark:text-gray-200 ${entityIdx === 0 ? 'text-sm' : 'text-xs'}`}
                          as="div"
                        />
                        <Editable 
                          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.entities[${entityIdx}].team[${memberIdx}].title`}
                          value={member.title}
                          className={`text-gray-500 dark:text-gray-400 ${entityIdx === 0 ? 'text-sm' : 'text-xs'}`}
                          as="div"
                        />
                        {member.roleDetail && (
                          <Editable 
                            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.entities[${entityIdx}].team[${memberIdx}].roleDetail`}
                            value={member.roleDetail}
                            className={`text-gray-500 dark:text-gray-400 mt-1 ${entityIdx === 0 ? 'text-xs' : 'text-xs'}`}
                            as="div"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Manager Modal */}
      {isEditing && listingSlug && openImageManagerFor !== null && (
        <ImageManager
          listingSlug={listingSlug}
          isOpen={openImageManagerFor !== null}
          onClose={() => setOpenImageManagerFor(null)}
          onImagesChange={loadMemberImages}
          defaultCategory={`details/sponsor-profile/leadership/${slugify(entities[openImageManagerFor.entityIdx].team[openImageManagerFor.memberIdx].name)}`}
        />
      )}
    </div>
  );
};

export default FundSponsorProfileSection;
