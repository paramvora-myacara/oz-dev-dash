import React from 'react';

const InvestmentStructureSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Investment Structure</h3>
      <div className="space-y-4">
          {data.structure.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-emerald-400">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-emerald-300">{item.value}</span>
              </div>
          ))}
      </div>
  </div>
);

export default InvestmentStructureSection; 