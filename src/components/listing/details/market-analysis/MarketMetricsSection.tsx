import React from 'react';

const MarketMetricsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {data.metrics.map((metric: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">{metric.label}</h3>
        <p className="text-4xl font-bold text-purple-900 dark:text-purple-300 mb-4">{metric.value}</p>
        <p className="text-sm text-purple-700 dark:text-purple-400">{metric.description}</p>
      </div>
    ))}
  </div>
);

export default MarketMetricsSection; 