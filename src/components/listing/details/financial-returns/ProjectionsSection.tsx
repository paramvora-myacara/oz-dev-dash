import React from 'react';
import { Editable } from '@/components/Editable';

const ProjectionsSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {data.projections.map((projection: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        {/* Label */}
        <Editable 
          dataPath={`details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].label`}
          value={projection.label}
          className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2"
        />
        
        {/* Value with inline suffix */}
        <div className="mb-4">
          <div className="flex items-baseline">
            <Editable 
              dataPath={`details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].value`}
              value={projection.value}
              className="text-4xl font-bold text-emerald-900 dark:text-emerald-300"
            />
            <Editable 
              dataPath={`details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].suffix`}
              value={projection.suffix || ''}
              className="text-sm font-medium text-emerald-900 dark:text-emerald-300 ml-2"
            />
          </div>
        </div>
        
        {/* Description */}
        <Editable 
          dataPath={`details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].description`}
          value={projection.description}
          inputType="multiline"
          className="text-sm text-gray-600 dark:text-gray-400"
        />
      </div>
    ))}
  </div>
);

export default ProjectionsSection; 