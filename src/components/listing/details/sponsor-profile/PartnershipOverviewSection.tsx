import React from 'react';
import { Editable } from '@/components/Editable';

const PartnershipOverviewSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
   <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Partnership Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.partners.map((partner: any, i: number) => (
            <div key={i}>
              <Editable 
                dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.partners[${i}].name`}
                
                className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4"
              />
              {partner.description.map((p: string, j: number) => (
                <Editable 
                  key={j}
                  dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.partners[${i}].description[${j}]`}
                  
                  inputType="multiline"
                  className="text-gray-600 dark:text-gray-400 mb-4 last:mb-0"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
);

export default PartnershipOverviewSection; 