import React from 'react';

const TaxBenefitsSection: React.FC<{ data: any }> = ({ data }) => (
   <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Opportunity Zone Benefits</h3>
      <div className="space-y-4">
          {data.benefits.map((benefit: any, idx: number) => (
              <div key={idx} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-emerald-300">{benefit.title}</h4>
                  <p className="text-gray-600 dark:text-emerald-400">{benefit.description}</p>
              </div>
          ))}
      </div>
  </div>
);

export default TaxBenefitsSection; 