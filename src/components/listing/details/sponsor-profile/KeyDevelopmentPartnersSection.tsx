import React from 'react';
import { Editable } from '@/components/Editable';

const KeyDevelopmentPartnersSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  if (!data?.partners) {
    return <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <p className="text-gray-500 dark:text-gray-400">Key development partners data is loading...</p>
    </div>;
  }

  return (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Development Partners</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.partners.map((partner: any, i: number) => (
             <div key={i} className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                <Editable 
                  dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.partners[${i}].name`}
                  value={partner.name}
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                  as="p"
                  spacing="medium"
                />
                <div className="text-gray-600 dark:text-gray-400 mb-3">
                  <strong>Role:</strong> <Editable 
                    dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.partners[${i}].role`}
                    value={partner.role}
                    className="text-gray-600 dark:text-gray-400"
                    as="span"
                    spacing="none"
                  />
                </div>
                <Editable 
                  dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.partners[${i}].description`}
                  value={partner.description}
                  inputType="multiline"
                  className="text-gray-600 dark:text-gray-400"
                  as="p"
                  spacing="none"
                />
              </div>
          ))}
        </div>
      </div>
    );
};

export default KeyDevelopmentPartnersSection; 