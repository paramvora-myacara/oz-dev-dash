import React from 'react';
import { iconMap } from '../shared/iconMap';

const LocationHighlightsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Location Highlights</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.highlights.map((highlight: any, idx: number) => {
        const Icon = iconMap[highlight.icon];
        return (
          <div key={idx} className="text-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
            {Icon && <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />}
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{highlight.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{highlight.description}</p>
          </div>
        );
      })}
    </div>
  </div>
);

export default LocationHighlightsSection; 