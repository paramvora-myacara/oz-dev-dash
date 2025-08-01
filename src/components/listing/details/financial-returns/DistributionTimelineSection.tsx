import React from 'react';

const DistributionTimelineSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Distribution Timeline</h3>
    <div className="space-y-6">
      {data.timeline.map((phase: any, idx: number) => (
        <div key={idx} className="flex items-start space-x-6 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-bold flex-shrink-0">
            {idx + 1}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-emerald-300">{phase.year}</h4>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">{phase.phase}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{phase.distribution}</p>
                <p className="text-sm text-gray-600 dark:text-emerald-400">Distribution Rate</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-emerald-400">{phase.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DistributionTimelineSection; 