'use client';

import React from 'react';
import { UserCheck, FileText, Clock } from "lucide-react";
import { ParticipationStepsSectionData, FundDetailsSectionData } from '@/types/listing';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

interface ParticipationStepsSectionProps {
  data: ParticipationStepsSectionData;
  sectionIndex: number;
}

const ParticipationStepsSection: React.FC<ParticipationStepsSectionProps> = ({ data, sectionIndex }) => {
  const { updateField, isEditing, draftData } = useListingDraftStore();
  const basePath = `details.howInvestorsParticipate.sections[${sectionIndex}].data.steps`;
  const steps = (draftData ? getByPath(draftData, basePath) : null) ?? data.steps ?? [];
  
  const handleAddStep = () => {
    const newStep = {
      title: "New Step",
      icon: "UserCheck",
      points: ["Point 1", "Point 2"]
    };
    updateField(basePath, [...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = steps.filter((_: any, i: number) => i !== index);
    updateField(basePath, updatedSteps);
  };

  const handleAddPoint = (stepIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].points.push("New point");
    updateField(basePath, updatedSteps);
  };

  const handleRemovePoint = (stepIndex: number, pointIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].points = updatedSteps[stepIndex].points.filter((_: any, i: number) => i !== pointIndex);
    updateField(basePath, updatedSteps);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'UserCheck': return <UserCheck className="w-8 h-8" />;
      case 'FileText': return <FileText className="w-8 h-8" />;
      case 'Clock': return <Clock className="w-8 h-8" />;
      default: return <UserCheck className="w-8 h-8" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Edit Mode Controls */}
      {isEditing && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Participation Steps Management
            </h3>
            <button 
              onClick={handleAddStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Step
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {steps.map((step: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex items-start space-x-6">
            {/* Remove Step Button */}
            {isEditing && (
              <div className="flex-shrink-0">
                <button 
                  onClick={() => handleRemoveStep(idx)}
                  className="mb-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Remove
                </button>
              </div>
            )}
            
            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
              {getIconComponent(step.icon)}
            </div>
            
            <div className="flex-1">
              <Editable 
                dataPath={`details.howInvestorsParticipate.sections[${sectionIndex}].data.steps[${idx}].title`}
                value={step.title}
                className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4"
              />
              
              {/* Add Point Button */}
              {isEditing && (
                <button 
                  onClick={() => handleAddPoint(idx)}
                  className="mb-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add Point
                </button>
              )}
              
              <ul className="space-y-3">
                {step.points.map((point: any, pIdx: number) => (
                  <li key={pIdx} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <div className="flex-1">
                      <Editable 
                        dataPath={`details.howInvestorsParticipate.sections[${sectionIndex}].data.steps[${idx}].points[${pIdx}]`}
                        value={point}
                        inputType="multiline"
                        className="text-lg text-gray-600 dark:text-gray-400"
                      />
                    </div>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemovePoint(idx, pIdx)}
                        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface FundDetailsSectionProps {
  data: FundDetailsSectionData;
  sectionIndex: number;
}

const FundDetailsSection: React.FC<FundDetailsSectionProps> = ({ data, sectionIndex }) => {
  const { updateField, isEditing, draftData } = useListingDraftStore();
  const basePath = `details.howInvestorsParticipate.sections[${sectionIndex}].data.details`;
  const details = (draftData ? getByPath(draftData, basePath) : null) ?? data.details ?? [];
  
  const handleAddDetail = () => {
    const newDetail = { label: "Label", value: "Value" };
    updateField(basePath, [...details, newDetail]);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_: any, i: number) => i !== index);
    updateField(basePath, updatedDetails);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Edit Mode Controls */}
      {isEditing && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Fund Details Management
            </h3>
            <button 
              onClick={handleAddDetail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Detail
            </button>
          </div>
        </div>
      )}

      {/* Fund Details Heading */}
      <h2 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-8 text-center mt-16">Fund Details</h2>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {details.map((item: any, idx: number) => (
            <div key={idx} className="space-y-1">
              {isEditing && (
                <button 
                  onClick={() => handleRemoveDetail(idx)}
                  className="mb-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  ×
                </button>
              )}
              <Editable 
                dataPath={`details.howInvestorsParticipate.sections[${sectionIndex}].data.details[${idx}].label`}
                value={item.label}
                className="font-semibold text-lg text-blue-900 dark:text-blue-300"
                as="div"
              />
              <Editable 
                dataPath={`details.howInvestorsParticipate.sections[${sectionIndex}].data.details[${idx}].value`}
                value={item.value}
                inputType="multiline"
                className="text-gray-600 dark:text-gray-400"
                as="div"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// Main section renderer
interface HowInvestorsParticipateSectionProps {
  data: ParticipationStepsSectionData | FundDetailsSectionData;
  sectionIndex: number;
  sectionType: 'participationSteps' | 'fundDetails';
}

const HowInvestorsParticipateSection: React.FC<HowInvestorsParticipateSectionProps> = ({ 
  data, 
  sectionIndex, 
  sectionType 
}) => {
  switch (sectionType) {
    case 'participationSteps':
      return <ParticipationStepsSection data={data as ParticipationStepsSectionData} sectionIndex={sectionIndex} />;
    case 'fundDetails':
      return <FundDetailsSection data={data as FundDetailsSectionData} sectionIndex={sectionIndex} />;
    default:
      return null;
  }
};

export default HowInvestorsParticipateSection;
