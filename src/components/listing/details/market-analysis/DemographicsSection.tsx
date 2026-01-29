'use client';

import React from 'react';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';
import { DemographicsSectionData } from '@/types/listing';

const DemographicsSection: React.FC<{ data: DemographicsSectionData; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  
  if (data.layout === 'matrix' && data.matrix) {
    const basePath = `details.marketAnalysis.sections[${sectionIndex}].data.matrix`;
    const matrix = (draftData ? getByPath(draftData, basePath) : null) ?? data.matrix;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Demographics Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Metric</th>
                {matrix.headers.map((header: string, idx: number) => (
                  <th key={idx} className="text-center py-3 text-gray-600 dark:text-gray-400 font-medium">
                    <Editable 
                      dataPath={`${basePath}.headers[${idx}]`}
                      value={header}
                      className="text-center"
                      as="span"
                      spacing="none"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row: any, rowIdx: number) => (
                <tr key={rowIdx} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  <td className="py-4 font-medium text-gray-900 dark:text-gray-100">
                    <Editable 
                      dataPath={`${basePath}.rows[${rowIdx}].label`}
                      value={row.label}
                      className="font-medium"
                      as="span"
                      spacing="none"
                    />
                  </td>
                  {row.values.map((val: string, valIdx: number) => (
                    <td key={valIdx} className="py-4 text-center text-gray-700 dark:text-gray-300">
                      <Editable 
                        dataPath={`${basePath}.rows[${rowIdx}].values[${valIdx}]`}
                        value={val}
                        className="text-center"
                        as="span"
                        spacing="none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

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