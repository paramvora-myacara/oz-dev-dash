import React from 'react';
import { iconMap } from '../shared/iconMap';

const TaxBenefitsSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-blue-300 mb-6">Opportunity Zone Benefits</h3>
      <div className="space-y-4">
        {data.benefits.map((benefit: any, idx: number) => {
          const IconComponent = benefit.icon ? iconMap[benefit.icon] : null;
          return (
            <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="flex items-center space-x-3">
                {IconComponent && <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                <h4 className="font-semibold text-gray-900 dark:text-blue-300">{benefit.title}</h4>
              </div>
              <p className="text-gray-600 dark:text-blue-400 mt-2 ml-8">{benefit.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
};

export default TaxBenefitsSection; 