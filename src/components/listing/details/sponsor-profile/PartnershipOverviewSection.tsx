import React from 'react';

const PartnershipOverviewSection: React.FC<{ data: any }> = ({ data }) => (
   <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Partnership Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.partners.map((partner: any, i: number) => (
            <div key={i}>
              <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">{partner.name}</h4>
              {partner.description.map((p: string, j: number) => (
                <p key={j} className="text-gray-600 dark:text-gray-400 mb-4 last:mb-0">{p}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
);

export default PartnershipOverviewSection; 