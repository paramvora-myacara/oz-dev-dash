import React from 'react';
import { Editable } from '@/components/Editable';

const DevelopmentTimelineSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Timeline</h3>
    <div className="space-y-6">
      {data.timeline.map((item: any, idx: number) => (
        <div key={idx} className="flex items-center space-x-4">
          <div className={`w-4 h-4 rounded-full ${item.status === 'completed' ? 'bg-blue-500' : 'bg-blue-500'}`}></div>
          <div>
            <Editable 
              dataPath={`details.propertyOverview.sections[${sectionIndex}].data.timeline[${idx}].title`}
              value={item.title}
              className="font-semibold text-gray-900 dark:text-gray-100"
              as="p"
              spacing="small"
            />
            <Editable 
              dataPath={`details.propertyOverview.sections[${sectionIndex}].data.timeline[${idx}].description`}
              value={item.description}
              inputType="multiline"
              className="text-gray-600 dark:text-gray-400"
              as="p"
              spacing="none"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DevelopmentTimelineSection; 