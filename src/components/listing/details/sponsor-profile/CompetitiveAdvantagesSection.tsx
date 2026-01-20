import React from 'react';
import { Users } from 'lucide-react';
import { Editable } from '@/components/Editable';

const CompetitiveAdvantagesSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  if (!data?.advantages) {
    return <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
      <p className="text-gray-500 dark:text-gray-400">Competitive advantages data is loading...</p>
    </div>;
  }

  return (
   <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Competitive Advantages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {data.advantages.slice(0,2).map((advantage: any, i: number) => (
              <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.advantages[${i}].title`}
                      value={advantage.title}
                      className="font-semibold text-gray-900 dark:text-gray-100"
                      as="p"
                      spacing="small"
                    />
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.advantages[${i}].description`}
                      value={advantage.description}
                      inputType="multiline"
                      className="text-gray-600 dark:text-gray-400 text-sm"
                      as="p"
                      spacing="none"
                    />
                  </div>
                </div>
            ))}
          </div>
          <div className="space-y-4">
             {data.advantages.slice(2,4).map((advantage: any, i: number) => (
              <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.advantages[${i + 2}].title`}
                      value={advantage.title}
                      className="font-semibold text-gray-900 dark:text-gray-100"
                      as="p"
                      spacing="small"
                    />
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.advantages[${i + 2}].description`}
                      value={advantage.description}
                      inputType="multiline"
                      className="text-gray-600 dark:text-gray-400 text-sm"
                      as="p"
                      spacing="none"
                    />
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    );
};

export default CompetitiveAdvantagesSection; 