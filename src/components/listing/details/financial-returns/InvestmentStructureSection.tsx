'use client';

import React from 'react';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

const InvestmentStructureSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  const basePath = `details.financialReturns.sections[${sectionIndex}].data.structure`;
  const items = (draftData ? getByPath(draftData, basePath) : null) ?? data.structure ?? [];

  const handleAdd = () => {
    const newItem = { label: 'Label', value: 'Value' };
    updateField(basePath, [...items, newItem]);
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_: any, i: number) => i !== idx);
    updateField(basePath, updated);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300">Investment Structure</h3>
        {isEditing && (
          <button onClick={handleAdd} className="px-2 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700">+ Add</button>
        )}
      </div>
      <div className="space-y-4">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-emerald-400">
              <Editable 
                dataPath={`details.financialReturns.sections[${sectionIndex}].data.structure[${idx}].label`}
                
                className="text-gray-600 dark:text-emerald-400"
              />
            </span>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 dark:text-emerald-300">
                <Editable 
                  dataPath={`details.financialReturns.sections[${sectionIndex}].data.structure[${idx}].value`}
                  
                  className="font-semibold text-gray-900 dark:text-emerald-300"
                />
              </span>
              {isEditing && (
                <button onClick={() => handleRemove(idx)} className="px-2 py-1 text-sm rounded border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">-</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentStructureSection; 