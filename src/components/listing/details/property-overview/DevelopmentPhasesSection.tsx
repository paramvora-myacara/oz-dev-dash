import React from 'react';
import { Editable } from '@/components/Editable';

const DevelopmentPhasesSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Phases</h3>
    <div className="space-y-6">
      {data.phases.map((phase: any, idx: number) => (
        <div key={idx} className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Editable 
                dataPath={`details.propertyOverview.sections[${sectionIndex}].data.phases[${idx}].phase`}
                value={phase.phase}
                className="font-semibold text-gray-900 dark:text-gray-100"
                as="p"
                spacing="small"
              />
              <Editable 
                dataPath={`details.propertyOverview.sections[${sectionIndex}].data.phases[${idx}].timeline`}
                value={phase.timeline}
                className="text-sm text-gray-600 dark:text-gray-400"
                as="p"
                spacing="none"
              />
            </div>
            <div className="text-center">
              <Editable 
                dataPath={`details.propertyOverview.sections[${sectionIndex}].data.phases[${idx}].units`}
                value={phase.units}
                inputType="number"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                as="p"
                spacing="small"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">Units</p>
            </div>
            <div className="text-center">
              <Editable 
                dataPath={`details.propertyOverview.sections[${sectionIndex}].data.phases[${idx}].sqft`}
                value={phase.sqft}
                inputType="number"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                as="p"
                spacing="small"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">Sq Ft</p>
            </div>
            <div className="text-center">
              <Editable 
                dataPath={`details.propertyOverview.sections[${sectionIndex}].data.phases[${idx}].status`}
                value={phase.status}
                className="text-lg font-semibold text-blue-600 dark:text-blue-400"
                as="p"
                spacing="small"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DevelopmentPhasesSection; 