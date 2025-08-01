import React from 'react';

const TrackRecordSection: React.FC<{ data: any }> = ({ data }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${Math.min(data.metrics.length, 4)} gap-6 mb-12`}>
    {data.metrics.map((record: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        {record.label && <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-2">{record.label}</h3>}
        <p className="text-4xl font-bold text-orange-900 dark:text-orange-300 mb-4">{record.value}</p>
        <p className="text-sm text-orange-700 dark:text-orange-400">{record.description}</p>
      </div>
    ))}
  </div>
);

export default TrackRecordSection; 