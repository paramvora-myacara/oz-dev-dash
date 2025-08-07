import React from 'react';
import { Editable } from '@/components/Editable';

const DemographicsSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Demographics</h3>
    <div className="space-y-6">
      {data.demographics.map((demo: any, idx: number) => (
        <div key={idx} className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
          <div>
            <Editable 
              dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.demographics[${idx}].category`}
              value={demo.category}
              className="font-semibold text-gray-900 dark:text-gray-100"
            />
            <Editable 
              dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.demographics[${idx}].description`}
              value={demo.description}
              inputType="multiline"
              className="text-sm text-gray-600 dark:text-gray-400"
            />
          </div>
          <Editable 
            dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.demographics[${idx}].value`}
            value={demo.value}
            className="text-2xl font-bold text-purple-600 dark:text-purple-400"
          />
        </div>
      ))}
    </div>
  </div>
);

export default DemographicsSection; 