import React from 'react';
import { iconMap } from '../shared/iconMap';
import { Editable } from '@/components/Editable';

const SupplyDemandSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Supply & Demand Analysis</h3>
    <div className="space-y-4">
      {data.analysis.map((item: any, idx: number) => {
        const Icon = iconMap[item.icon];
        return (
          <div key={idx} className="flex items-start space-x-3">
            <div className="text-2xl">{Icon && <Icon className="w-6 h-6 text-blue-500" />}</div>
            <div>
              <Editable 
                dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.analysis[${idx}].title`}
                value={item.title}
                className="font-semibold text-gray-900 dark:text-gray-100"
                as="p"
                spacing="small"
              />
              <Editable 
                dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.analysis[${idx}].description`}
                value={item.description}
                inputType="multiline"
                className="text-gray-600 dark:text-gray-400"
                as="p"
                spacing="none"
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default SupplyDemandSection; 