'use client';

import React from 'react';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

const UnitMixSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  const basePath = `details.propertyOverview.sections[${sectionIndex}].data.unitMix`;
  const items = (draftData ? getByPath(draftData, basePath) : null) ?? data.unitMix ?? [];

  const handleAdd = () => {
    const newItem = { type: 'Type', count: 0, sqft: 0, rent: '$0' };
    updateField(basePath, [...items, newItem]);
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_: any, i: number) => i !== idx);
    updateField(basePath, updated);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Unit Mix</h3>
        {isEditing && (
          <button onClick={handleAdd} className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">+ Add</button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 text-gray-600 dark:text-gray-400">Unit Type</th>
              <th className="text-center py-3 text-gray-600 dark:text-gray-400">Count</th>
              <th className="text-center py-3 text-gray-600 dark:text-gray-400">Square Feet</th>
              <th className="text-right py-3 text-gray-600 dark:text-gray-400">Projected Rent</th>
              {isEditing && <th className="py-3" />}
            </tr>
          </thead>
          <tbody>
            {items.map((unit: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                <td className="py-4 font-medium text-gray-900 dark:text-gray-100">
                  <Editable 
                    dataPath={`details.propertyOverview.sections[${sectionIndex}].data.unitMix[${idx}].type`}
                    value={unit.type}
                    className="font-medium text-gray-900 dark:text-gray-100"
                    as="span"
                    spacing="none"
                  />
                </td>
                <td className="py-4 text-center text-gray-700 dark:text-gray-300">
                  <Editable 
                    dataPath={`details.propertyOverview.sections[${sectionIndex}].data.unitMix[${idx}].count`}
                    value={unit.count}
                    inputType="number"
                    className="text-center text-gray-700 dark:text-gray-300"
                    as="span"
                    spacing="none"
                  />
                </td>
                <td className="py-4 text-center text-gray-700 dark:text-gray-300">
                  <Editable 
                    dataPath={`details.propertyOverview.sections[${sectionIndex}].data.unitMix[${idx}].sqft`}
                    value={unit.sqft}
                    className="text-center text-gray-700 dark:text-gray-300"
                    as="span"
                    spacing="none"
                  />
                </td>
                <td className="py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                  <Editable 
                    dataPath={`details.propertyOverview.sections[${sectionIndex}].data.unitMix[${idx}].rent`}
                    value={unit.rent}
                    className="text-right font-semibold text-gray-900 dark:text-gray-100"
                    as="span"
                    spacing="none"
                  />
                </td>
                {isEditing && (
                  <td className="py-4 text-right">
                    <button onClick={() => handleRemove(idx)} className="px-2 py-1 text-sm rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">-</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.specialFeatures && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
          <Editable 
            dataPath={`details.propertyOverview.sections[${sectionIndex}].data.specialFeatures.title`}
            value={data.specialFeatures.title}
            className="font-semibold text-gray-900 dark:text-gray-100"
            as="p"
            spacing="small"
          />
          <Editable 
            dataPath={`details.propertyOverview.sections[${sectionIndex}].data.specialFeatures.description`}
            value={data.specialFeatures.description}
            inputType="multiline"
            className="text-gray-600 dark:text-gray-400"
            as="p"
            spacing="none"
          />
        </div>
      )}
    </div>
  );
};

export default UnitMixSection; 