import React from 'react';
import { Editable } from '@/components/Editable';

const MarketMetricsSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {data.metrics.map((metric: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <Editable 
          dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.metrics[${idx}].label`}
          value={metric.label}
          className="text-lg font-semibold text-blue-900 dark:text-blue-300"
          as="p"
          spacing="small"
        />
        <Editable 
          dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.metrics[${idx}].value`}
          value={metric.value}
          className="text-4xl font-bold text-blue-900 dark:text-blue-300"
          as="p"
          spacing="medium"
        />
        <Editable 
          dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.metrics[${idx}].description`}
          value={metric.description}
          inputType="multiline"
          className="text-sm text-blue-700 dark:text-blue-400"
          as="p"
          spacing="none"
        />
      </div>
    ))}
  </div>
);

export default MarketMetricsSection; 