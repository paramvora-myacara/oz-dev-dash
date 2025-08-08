import React from 'react';
import { Editable } from '@/components/Editable';

const KeyFactsSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    {data.facts.map((fact: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <Editable 
          dataPath={`details.propertyOverview.sections[${sectionIndex}].data.facts[${idx}].label`}
          className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2"
        />
        <Editable 
          dataPath={`details.propertyOverview.sections[${sectionIndex}].data.facts[${idx}].value`}
          className="text-4xl font-bold text-indigo-900 dark:text-indigo-300"
        />
        <Editable 
          dataPath={`details.propertyOverview.sections[${sectionIndex}].data.facts[${idx}].description`}
          inputType="multiline"
          className="text-sm text-indigo-700 dark:text-indigo-400 mt-2"
        />
      </div>
    ))}
  </div>
);

export default KeyFactsSection; 