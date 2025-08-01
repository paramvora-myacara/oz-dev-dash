import React from 'react';

const KeyFactsSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    {data.facts.map((fact: any, idx: number) => (
      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">{fact.label}</h3>
        <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">{fact.value}</p>
        <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">{fact.description}</p>
      </div>
    ))}
  </div>
);

export default KeyFactsSection; 