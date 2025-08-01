import React from 'react';

const DevelopmentPhasesSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Phases</h3>
    <div className="space-y-6">
      {data.phases.map((phase: any, idx: number) => (
        <div key={idx} className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{phase.phase}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{phase.timeline}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{phase.units}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Units</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{phase.sqft}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rentable SF</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{phase.features}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DevelopmentPhasesSection; 