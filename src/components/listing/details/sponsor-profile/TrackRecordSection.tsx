import React from 'react';
import { Editable } from '@/components/Editable';

const TrackRecordSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  if (!data?.metrics) {
    return <div className="mb-12">
      <p className="text-gray-500 dark:text-gray-400">Track record data is loading...</p>
    </div>;
  }

  return (
  <div className={`grid grid-cols-1 md:grid-cols-${Math.min(data.metrics.length, 4)} gap-6 mb-12`}>
    {data.metrics.map((record: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        {record.label && (
          <Editable 
            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.metrics[${idx}].label`}
            value={record.label}
            className="text-lg font-semibold text-blue-900 dark:text-blue-300"
            as="p"
            spacing="small"
          />
        )}
        <Editable 
          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.metrics[${idx}].value`}
          value={record.value}
          className="text-4xl font-bold text-blue-900 dark:text-blue-300"
          as="p"
          spacing="medium"
        />
        <Editable 
          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.metrics[${idx}].description`}
          value={record.description}
          inputType="multiline"
          className="text-sm text-blue-700 dark:text-blue-400"
          as="p"
          spacing="none"
        />
      </div>
    ))}
  </div>
    );
};

export default TrackRecordSection; 