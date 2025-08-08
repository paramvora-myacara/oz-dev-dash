import React from 'react';
import { iconMap } from '../shared/iconMap';
import { Editable } from '@/components/Editable';

const SponsorIntroSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const renderHighlightIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6 text-orange-500" /> : null;
  };

  return (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
    <Editable 
      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.sponsorName`}
      
      className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6"
    />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        {data.content.paragraphs.map((p: string, i: number) => (
          <Editable 
            key={i}
            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.content.paragraphs[${i}]`}
            
            inputType="multiline"
            className="text-lg text-gray-600 dark:text-gray-400 mb-6 last:mb-0"
          />
        ))}
      </div>
      <div className="space-y-4">
        {data.content.highlights.type === 'icons' && data.content.highlights.items.map((item: any, i: number) => (
          <div key={i} className="flex items-center space-x-3">
            {renderHighlightIcon(item.icon)}
            <Editable 
              dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.content.highlights.items[${i}].text`}
              
              className="text-gray-900 dark:text-gray-100"
            />
          </div>
        ))}
         {data.content.highlights.type === 'list' && (
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Investment Strategy</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  {data.content.highlights.items.map((item: any, i: number) => (
                    <li key={i}>
                      • <Editable 
                          dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.content.highlights.items[${i}].text`}
                          
                          className="text-gray-600 dark:text-gray-400"
                        />
                    </li>
                  ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  </div>
);
};

export default SponsorIntroSection; 