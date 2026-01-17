import React from 'react';
import { Editable } from '@/components/Editable';

const KeyFactsSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    {data.facts.map((fact: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <Editable 
          dataPath={`details.propertyOverview.sections[${sectionIndex}].data.facts[${idx}].label`}
          value={fact.label}
          className="text-lg font-semibold text-blue-900 dark:text-blue-300"
          as="p"
          spacing="small"
        />
        <Editable 
          dataPath={`details.propertyOverview.sections[${sectionIndex}].data.facts[${idx}].value`}
          value={fact.value}
          className="text-4xl font-bold text-blue-900 dark:text-blue-300"
          as="p"
          spacing="medium"
        />
        <Editable 
          dataPath={`details.propertyOverview.sections[${sectionIndex}].data.facts[${idx}].description`}
          value={fact.description}
          inputType="multiline"
          className="text-sm text-blue-700 dark:text-blue-400"
          as="p"
          spacing="none"
        />
      </div>
    ))}
  </div>
);

export default KeyFactsSection; 