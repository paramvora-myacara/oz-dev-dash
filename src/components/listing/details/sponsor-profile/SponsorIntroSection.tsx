import React from 'react';
import { iconMap } from '../shared/iconMap';
import { Editable } from '@/components/Editable';

interface SponsorIntroSectionProps {
  data: any;
  sectionIndex: number;
  developerWebsite?: string | null;
}

const SponsorIntroSection: React.FC<SponsorIntroSectionProps> = ({ data, sectionIndex, developerWebsite }) => {
  const renderHighlightIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6 text-blue-500" /> : null;
  };

  if (!data) {
    return <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
      <p className="text-gray-500 dark:text-gray-400">Sponsor intro data is loading...</p>
    </div>;
  }

  return (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
    <Editable 
      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.sponsorName`}
      value={data.sponsorName}
      className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
      as="p"
      spacing="large"
    />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        {data.content?.paragraphs?.map((p: string, i: number) => (
          <Editable 
            key={i}
            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.content.paragraphs[${i}]`}
            value={p}
            inputType="multiline"
            className="text-lg text-gray-600 dark:text-gray-400"
            as="p"
            spacing="medium"
          />
        ))}
      </div>
      <div>
        {data.highlights?.map((highlight: any, i: number) => (
          <div key={i} className="flex items-start space-x-3 mb-4">
            {renderHighlightIcon(highlight.icon)}
            <div>
              <Editable 
                dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.highlights[${i}].title`}
                value={highlight.title}
                className="font-semibold text-gray-900 dark:text-gray-100"
                as="p"
                spacing="small"
              />
              <Editable 
                dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.highlights[${i}].description`}
                value={highlight.description}
                inputType="multiline"
                className="text-gray-600 dark:text-gray-400"
                as="p"
                spacing="none"
              />
            </div>
          </div>
        ))}
      </div>
      {developerWebsite && (
        <div className="mt-6">
          <a
            href={developerWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-blue-600 hover:underline font-semibold"
          >
            Visit Website
          </a>
        </div>
      )}
    </div>
  </div>
  );
};

export default SponsorIntroSection; 