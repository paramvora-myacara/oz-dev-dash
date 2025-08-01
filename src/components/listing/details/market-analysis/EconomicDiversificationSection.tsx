import React from 'react';

const EconomicDiversificationSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Economic Diversification</h3>
    <div className="space-y-4">
      {data.sectors.map((sector: any, idx: number) => (
        <div key={idx} className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{sector.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{sector.description}</p>
        </div>
      ))}
    </div>
  </div>
);

export default EconomicDiversificationSection; 