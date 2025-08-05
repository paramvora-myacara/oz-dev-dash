import React from 'react';

const ProjectionsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {data.projections.map((projection: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">{projection.label}</h3>
        <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300 mb-4">{projection.value}</p>
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{projection.description}</p>
      </div>
    ))}
  </div>
);

export default ProjectionsSection; 