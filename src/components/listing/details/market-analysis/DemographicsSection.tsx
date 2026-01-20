'use client';

import React from 'react';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

const DemographicsSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  const basePath = `details.marketAnalysis.sections[${sectionIndex}].data.demographics`;
  const items = (draftData ? getByPath(draftData, basePath) : null) ?? data.demographics ?? [];

  const handleAdd = () => {
    const newItem = { category: 'Category', description: 'Description', value: '0%' };
    updateField(basePath, [...items, newItem]);
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_: any, i: number) => i !== idx);
    updateField(basePath, updated);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Demographics</h3>
        {isEditing && (
          <button onClick={handleAdd} className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">+ Add</button>
        )}
      </div>
      <div className="space-y-6">
        {items.map((demo: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
            <div>
              <Editable 
                dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.demographics[${idx}].category`}
                value={demo.category}
                className="font-semibold text-gray-900 dark:text-gray-100"
                as="p"
                spacing="small"
              />
              <Editable 
                dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.demographics[${idx}].description`}
                value={demo.description}
                inputType="multiline"
                className="text-sm text-gray-600 dark:text-gray-400"
                as="p"
                spacing="none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Editable 
                dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.demographics[${idx}].value`}
                value={demo.value}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                as="span"
                spacing="none"
              />
              {isEditing && (
                <button onClick={() => handleRemove(idx)} className="px-2 py-1 text-sm rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">-</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemographicsSection; 