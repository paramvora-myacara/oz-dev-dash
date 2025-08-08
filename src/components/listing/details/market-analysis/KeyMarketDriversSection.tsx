import React from 'react';
import { iconMap } from '../shared/iconMap';
import { Editable } from '@/components/Editable';

const KeyMarketDriversSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
   <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Market Drivers</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.drivers.map((driver: any, idx: number) => {
          const Icon = iconMap[driver.icon];
          return (
            <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                {Icon && <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
                </div>
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.drivers[${idx}].title`}
                  value={driver.title}
                  className="font-semibold text-gray-900 dark:text-gray-100 mb-2"
                />
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.drivers[${idx}].description`}
                  value={driver.description}
                  inputType="multiline"
                  className="text-sm text-gray-600 dark:text-gray-400"
                />
            </div>
          )
      })}
    </div>
  </div>
);

export default KeyMarketDriversSection; 