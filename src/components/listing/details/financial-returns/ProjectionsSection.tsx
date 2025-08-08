import React from 'react';
import { Editable } from '@/components/Editable';

const ProjectionsSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {data.projections.map((projection: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <Editable 
          dataPath={`details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].label`}
          className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2"
        />
        <Editable 
          dataPath={`details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].value`}
          className="text-4xl font-bold text-emerald-900 dark:text-emerald-300 mb-4"
        />
        <Editable 
          dataPath={`details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].description`}
          inputType="multiline"
          className="text-sm text-emerald-700 dark:text-emerald-400"
        />
      </div>
    ))}
  </div>
);

export default ProjectionsSection; 