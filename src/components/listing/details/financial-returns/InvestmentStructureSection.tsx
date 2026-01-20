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
        <h3 className="text-xl font-semibold text-gray-900 dark:text-blue-300">Investment Structure</h3>
        {isEditing && (
          <button onClick={handleAdd} className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">+ Add</button>
        )}
      </div>
      <div className="space-y-4">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-blue-400">
              <Editable 
                dataPath={`details.financialReturns.sections[${sectionIndex}].data.structure[${idx}].label`}
                value={item.label}
                className="text-gray-600 dark:text-blue-400"
              />
            </span>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 dark:text-blue-300">
                <Editable 
                  dataPath={`details.financialReturns.sections[${sectionIndex}].data.structure[${idx}].value`}
                  value={item.value}
                  className="font-semibold text-gray-900 dark:text-blue-300"
                />
              </span>
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

export default InvestmentStructureSection; 