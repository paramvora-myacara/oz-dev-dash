'use client';

import React from 'react';
import { Star, Briefcase } from "lucide-react";
import { FundSponsorEntitiesSectionData, SponsorEntity, TeamMember } from '@/types/listing';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

interface FundSponsorProfileSectionProps {
  data: FundSponsorEntitiesSectionData;
  sectionIndex: number;
  projectId: string;
  isEditMode?: boolean;
  listingSlug?: string;
}

const FundSponsorProfileSection: React.FC<FundSponsorProfileSectionProps> = ({ 
  data, 
  sectionIndex, 
  projectId,
  isEditMode = false,
  listingSlug = ''
}) => {
  const { updateField, isEditing, draftData } = useListingDraftStore();
  const basePath = `details.sponsorProfile.sections[${sectionIndex}].data.entities`;
  const entities = (draftData ? getByPath(draftData, basePath) : null) ?? data.entities ?? [];
  
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
    const newMember: TeamMember = {
      name: "New Member",
      title: "Title",
      roleDetail: "Role Detail",
      image: "",
      experience: "Experience",
      background: "Background"
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
    return entityIndex === 0 ? <Star className="w-8 h-8 text-orange-500" /> : <Briefcase className="w-8 h-8 text-orange-500" />;
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
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
                      className="text-2xl font-bold text-orange-900 dark:text-orange-300"
                      as="div"
                    />
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.entities[${entityIdx}].role`}
                      value={entity.role}
                      className="text-lg font-semibold text-orange-700 dark:text-orange-400"
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
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
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
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
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
                
                <div className={`grid gap-x-6 gap-y-8 text-center ${entityIdx === 0 ? 'grid-cols-3' : 'grid-cols-3'}`}>
                  {entity.team.map((member: TeamMember, memberIdx: number) => (
                    <div key={memberIdx}>
                      {/* Remove Team Member Button */}
                      {isEditing && (
                        <button 
                          onClick={() => handleRemoveTeamMember(entityIdx, memberIdx)}
                          className="mb-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                      
                      <div className={`${entityIdx === 0 ? 'w-24 h-24' : 'w-16 h-16'} rounded-full mx-auto mb-3 overflow-hidden bg-gray-200`}>
                        <Editable 
                          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.entities[${entityIdx}].team[${memberIdx}].image`}
                          value={member.image}
                          className="w-full h-full object-cover scale-110"
                          inputType="text"
                        />
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FundSponsorProfileSection;
