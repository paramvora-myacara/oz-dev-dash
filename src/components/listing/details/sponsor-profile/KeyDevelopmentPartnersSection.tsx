import React from 'react';

const KeyDevelopmentPartnersSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Development Partners</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.partners.map((partner: any, i: number) => (
             <div key={i} className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{partner.name}</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  <strong>Role:</strong> {partner.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {partner.description}
                </p>
              </div>
          ))}
        </div>
      </div>
);

export default KeyDevelopmentPartnersSection; 