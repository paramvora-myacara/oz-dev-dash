'use client';

import React from 'react';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

const DevelopmentPortfolioSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  const basePath = `details.sponsorProfile.sections[${sectionIndex}].data.projects`;
  const items = (draftData ? getByPath(draftData, basePath) : null) ?? data.projects ?? [];

  const handleAdd = () => {
    const newItem = { name: 'Project Name', location: 'City, ST', units: '0', year: 'Year', status: 'Planning', returnsOrFocus: 'Focus' };
    updateField(basePath, [...items, newItem]);
  };

  const handleRemove = (idx: number) => {
    const updated = items.filter((_: any, i: number) => i !== idx);
    updateField(basePath, updated);
  };

  return (
     <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Development Portfolio</h3>
          {isEditing && (
            <button onClick={handleAdd} className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">+ Add</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Project Name</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Location</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Units</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Year</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Status</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Returns/Focus</th>
                {isEditing && <th className="py-3" />}
              </tr>
            </thead>
            <tbody>
              {items.map((project: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.projects[${idx}].name`}
                      value={project.name}
                      className="font-semibold text-gray-900 dark:text-gray-100"
                      as="span"
                      spacing="none"
                    />
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.projects[${idx}].location`}
                      value={project.location}
                      className="text-gray-600 dark:text-gray-400"
                      as="span"
                      spacing="none"
                    />
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.projects[${idx}].units`}
                      value={project.units}
                      className="text-gray-600 dark:text-gray-400"
                      as="span"
                      spacing="none"
                    />
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.projects[${idx}].year`}
                      value={project.year}
                      className="text-gray-600 dark:text-gray-400"
                      as="span"
                      spacing="none"
                    />
                  </td>
                  <td className="py-3">
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.projects[${idx}].status`}
                      value={project.status}
                      constraints={{ options: ['Completed', 'In Progress', 'Planning', 'Operating'] }}
                      className={`px-2 py-1 rounded text-sm ${
                        project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : project.status === 'Operating' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}
                      as="span"
                      spacing="none"
                    />
                  </td>
                  <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">
                    <Editable 
                      dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.projects[${idx}].returnsOrFocus`}
                      value={project.returnsOrFocus}
                      className="font-semibold text-blue-600 dark:text-blue-400"
                      as="span"
                      spacing="none"
                    />
                  </td>
                  {isEditing && (
                    <td className="py-3 text-right">
                      <button onClick={() => handleRemove(idx)} className="px-2 py-1 text-sm rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">-</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.investmentPhilosophy && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
            <Editable 
              dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.investmentPhilosophy.title`}
              value={data.investmentPhilosophy.title}
              className="font-semibold text-gray-900 dark:text-gray-100"
              as="p"
              spacing="small"
            />
            <Editable 
              dataPath={`details.sponsorProfile.sections[${sectionIndex}].data.investmentPhilosophy.description`}
              value={data.investmentPhilosophy.description}
              inputType="multiline"
              className="text-gray-600 dark:text-gray-400"
              as="p"
              spacing="none"
            />
          </div>
        )}
      </div>
  );
};

export default DevelopmentPortfolioSection; 