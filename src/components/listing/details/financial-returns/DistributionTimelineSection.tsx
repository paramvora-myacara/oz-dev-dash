'use client';

import React from 'react';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

const DistributionTimelineSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  const basePath = `details.financialReturns.sections[${sectionIndex}].data.timeline`;
  const items = (draftData ? getByPath(draftData, basePath) : null) ?? data.timeline ?? [];

  const handleAdd = () => {
    const newItem = { year: 'Year', phase: 'Phase', distribution: '0%', description: 'Description' };
    updateField(basePath, [...items, newItem]);
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_: any, i: number) => i !== idx);
    updateField(basePath, updated);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300">Distribution Timeline</h3>
        {isEditing && (
          <button onClick={handleAdd} className="px-2 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700">+ Add</button>
        )}
      </div>
      <div className="space-y-6">
        {items.map((phase: any, idx: number) => (
          <div key={idx} className="flex items-start space-x-6 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-bold flex-shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-emerald-300">
                    <Editable 
                      dataPath={`details.financialReturns.sections[${sectionIndex}].data.timeline[${idx}].year`}
                      value={phase.year}
                      className="font-semibold text-gray-900 dark:text-emerald-300"
                    />
                  </h4>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    <Editable 
                      dataPath={`details.financialReturns.sections[${sectionIndex}].data.timeline[${idx}].phase`}
                      value={phase.phase}
                      className="text-emerald-600 dark:text-emerald-400 font-medium"
                    />
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    <Editable 
                      dataPath={`details.financialReturns.sections[${sectionIndex}].data.timeline[${idx}].distribution`}
                      value={phase.distribution}
                      className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-emerald-400">Distribution Rate</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-emerald-400">
                    <Editable 
                      dataPath={`details.financialReturns.sections[${sectionIndex}].data.timeline[${idx}].description`}
                      value={phase.description}
                      inputType="multiline"
                      className="text-sm text-gray-600 dark:text-emerald-400"
                    />
                  </p>
                </div>
                {isEditing && (
                  <div className="md:col-span-4 flex justify-end">
                    <button onClick={() => handleRemove(idx)} className="px-2 py-1 text-sm rounded border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">- Remove</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionTimelineSection; 