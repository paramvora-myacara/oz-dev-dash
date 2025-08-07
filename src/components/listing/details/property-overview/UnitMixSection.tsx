import React from 'react';
import { Editable } from '@/components/Editable';

const UnitMixSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Unit Mix</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 text-gray-600 dark:text-gray-400">Unit Type</th>
            <th className="text-center py-3 text-gray-600 dark:text-gray-400">Count</th>
            <th className="text-center py-3 text-gray-600 dark:text-gray-400">Square Feet</th>
            <th className="text-right py-3 text-gray-600 dark:text-gray-400">Projected Rent</th>
          </tr>
        </thead>
        <tbody>
          {data.unitMix.map((unit: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              <td className="py-4 font-medium text-gray-900 dark:text-gray-100">
                <Editable 
                  dataPath={`details.propertyOverview.sections[${sectionIndex}].data.unitMix[${idx}].type`}
                  value={unit.type}
                  className="font-medium text-gray-900 dark:text-gray-100"
                />
              </td>
              <td className="py-4 text-center text-gray-700 dark:text-gray-300">
                <Editable 
                  dataPath={`details.propertyOverview.sections[${sectionIndex}].data.unitMix[${idx}].count`}
                  value={unit.count}
                  inputType="number"
                  className="text-center text-gray-700 dark:text-gray-300"
                />
              </td>
              <td className="py-4 text-center text-gray-700 dark:text-gray-300">
                <Editable 
                  dataPath={`details.propertyOverview.sections[${sectionIndex}].data.unitMix[${idx}].sqft`}
                  value={unit.sqft}
                  className="text-center text-gray-700 dark:text-gray-300"
                />
              </td>
              <td className="py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                <Editable 
                  dataPath={`details.propertyOverview.sections[${sectionIndex}].data.unitMix[${idx}].rent`}
                  value={unit.rent}
                  className="text-right font-semibold text-gray-900 dark:text-gray-100"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.specialFeatures && (
      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
        <Editable 
          dataPath={`details.propertyOverview.sections[${sectionIndex}].data.specialFeatures.title`}
          value={data.specialFeatures.title}
          className="font-semibold text-gray-900 dark:text-gray-100 mb-2"
        />
        <Editable 
          dataPath={`details.propertyOverview.sections[${sectionIndex}].data.specialFeatures.description`}
          value={data.specialFeatures.description}
          inputType="multiline"
          className="text-gray-600 dark:text-gray-400"
        />
      </div>
    )}
  </div>
);

export default UnitMixSection; 