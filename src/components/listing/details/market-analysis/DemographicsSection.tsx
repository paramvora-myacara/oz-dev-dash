import React from 'react';

const DemographicsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Demographics</h3>
    <div className="space-y-6">
      {data.demographics.map((demo: any, idx: number) => (
        <div key={idx} className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{demo.category}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{demo.description}</p>
          </div>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{demo.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default DemographicsSection; 