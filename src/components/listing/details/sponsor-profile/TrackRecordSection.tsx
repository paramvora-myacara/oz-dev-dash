import React from 'react';
import { Editable } from '@/components/Editable';

const TrackRecordSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${Math.min(data.metrics.length, 4)} gap-6 mb-12`}>
    {data.metrics.map((record: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        {record.label && (
          <Editable 
            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.metrics[${idx}].label`}
            value={record.label}
            className="text-lg font-semibold text-orange-900 dark:text-orange-300"
            as="p"
            spacing="small"
          />
        )}
        <Editable 
          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.metrics[${idx}].value`}
          value={record.value}
          className="text-4xl font-bold text-orange-900 dark:text-orange-300"
          as="p"
          spacing="medium"
        />
        <Editable 
          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.metrics[${idx}].description`}
          value={record.description}
          inputType="multiline"
          className="text-sm text-orange-700 dark:text-orange-400"
          as="p"
          spacing="none"
        />
      </div>
    ))}
  </div>
);

export default TrackRecordSection; 