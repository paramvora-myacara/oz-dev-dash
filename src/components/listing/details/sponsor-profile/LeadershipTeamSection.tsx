import React from 'react';

const LeadershipTeamSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Leadership Team</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.teamMembers.map((member: any, idx: number) => (
        <div key={idx} className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{member.name}</h4>
          <p className="text-orange-600 dark:text-orange-400 font-medium mb-2">{member.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{member.experience} experience</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{member.background}</p>
        </div>
      ))}
    </div>
  </div>
);

export default LeadershipTeamSection; 