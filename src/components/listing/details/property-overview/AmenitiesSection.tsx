import React from 'react';
import { iconMap } from '../shared/iconMap';
import { Editable } from '@/components/Editable';

const AmenitiesSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Amenities</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.amenities.map((amenity: any, idx: number) => {
        const Icon = iconMap[amenity.icon];
        return (
          <div key={idx} className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
            <div className="text-blue-600 dark:text-blue-400">
              {Icon && <Icon className="w-6 h-6" />}
            </div>
            <Editable 
              dataPath={`details.propertyOverview.sections[${sectionIndex}].data.amenities[${idx}].name`}
              value={amenity.name}
              className="text-sm font-medium text-gray-900 dark:text-gray-100"
              as="span"
              spacing="none"
            />
          </div>
        );
      })}
    </div>
  </div>
);

export default AmenitiesSection; 