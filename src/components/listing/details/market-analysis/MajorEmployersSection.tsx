'use client';

import React from 'react';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

const MajorEmployersSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  const basePath = `details.marketAnalysis.sections[${sectionIndex}].data.employers`;
  const items = (draftData ? getByPath(draftData, basePath) : null) ?? data.employers ?? [];

  const handleAdd = () => {
    const newItem = { name: 'Company', employees: '0', industry: 'Industry', distance: '0 mi' };
    updateField(basePath, [...items, newItem]);
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_: any, i: number) => i !== idx);
    updateField(basePath, updated);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Major Employers</h3>
        {isEditing && (
          <button onClick={handleAdd} className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">+ Add</button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 text-gray-900 dark:text-gray-100">Company</th>
              <th className="text-left py-3 text-gray-900 dark:text-gray-100">Employees</th>
              <th className="text-left py-3 text-gray-900 dark:text-gray-100">Industry</th>
              <th className="text-left py-3 text-gray-900 dark:text-gray-100">Distance</th>
              {isEditing && <th className="py-3" />}
            </tr>
          </thead>
          <tbody>
            {items.map((employer: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">
                  <Editable 
                    dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.employers[${idx}].name`}
                    value={employer.name}
                    className="font-semibold text-gray-900 dark:text-gray-100"
                    as="span"
                    spacing="none"
                  />
                </td>
                <td className="py-3 text-gray-600 dark:text-gray-400">
                  <Editable 
                    dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.employers[${idx}].employees`}
                    value={employer.employees}
                    className="text-gray-600 dark:text-gray-400"
                    as="span"
                    spacing="none"
                  />
                </td>
                <td className="py-3 text-gray-600 dark:text-gray-400">
                  <Editable 
                    dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.employers[${idx}].industry`}
                    value={employer.industry}
                    className="text-gray-600 dark:text-gray-400"
                    as="span"
                    spacing="none"
                  />
                </td>
                <td className="py-3 text-gray-600 dark:text-gray-400">
                  <Editable 
                    dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.employers[${idx}].distance`}
                    value={employer.distance}
                    className="text-gray-600 dark:text-gray-400"
                    as="span"
                    spacing="none"
                  />
                </td>
                {isEditing && (
                  <td className="py-3 text-right">
                    <button onClick={() => handleRemove(idx)} className="px-2 py-1 text-sm rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">-</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MajorEmployersSection; 