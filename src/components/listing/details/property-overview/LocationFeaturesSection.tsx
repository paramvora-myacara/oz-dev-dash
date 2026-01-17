import React from 'react';
import { iconMap } from '../shared/iconMap';
import { Editable } from '@/components/Editable';

const LocationFeaturesSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
    {data.featureSections.map((highlight: any, idx: number) => {
      const Icon = iconMap[highlight.icon];
      return (
        <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-6">
            {Icon && <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            <Editable 
              dataPath={`details.propertyOverview.sections[${sectionIndex}].data.featureSections[${idx}].category`}
              value={highlight.category}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              as="span"
              spacing="none"
            />
          </div>
          <ul className="space-y-3">
            {highlight.features.map((feature: string, featureIdx: number) => (
              <li key={featureIdx} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <Editable 
                  dataPath={`details.propertyOverview.sections[${sectionIndex}].data.featureSections[${idx}].features[${featureIdx}]`}
                  value={feature}
                  className="text-gray-600 dark:text-gray-400 text-sm"
                  as="span"
                  spacing="none"
                />
              </li>
            ))}
          </ul>
        </div>
      )
    })}
  </div>
);

export default LocationFeaturesSection; 