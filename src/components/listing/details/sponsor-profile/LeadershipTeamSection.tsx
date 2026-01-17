import React from 'react';
import { Editable } from '@/components/Editable';

const LeadershipTeamSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  if (!data?.teamMembers) {
    return <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <p className="text-gray-500 dark:text-gray-400">Leadership team data is loading...</p>
    </div>;
  }

  return (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Leadership Team</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.teamMembers.map((member: any, idx: number) => (
        <div key={idx} className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
          <Editable 
            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.teamMembers[${idx}].name`}
            value={member.name}
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            as="p"
            spacing="small"
          />
          <Editable 
            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.teamMembers[${idx}].title`}
            value={member.title}
            className="text-blue-600 dark:text-blue-400 font-medium"
            as="p"
            spacing="small"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            <Editable 
              dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.teamMembers[${idx}].experience`}
              value={member.experience}
              className="text-sm text-gray-600 dark:text-gray-400"
              as="span"
              spacing="none"
            />
            <span> experience</span>
          </div>
          <Editable 
            dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.teamMembers[${idx}].background`}
            value={member.background}
            inputType="multiline"
            className="text-sm text-gray-600 dark:text-gray-400"
            as="p"
            spacing="none"
          />
        </div>
      ))}
    </div>
  </div>
    );
};

export default LeadershipTeamSection; 