import React from 'react';
import { Editable } from '@/components/Editable';

const MajorEmployersSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Major Employers</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Company</th>
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Employees</th>
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Industry</th>
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Distance</th>
          </tr>
        </thead>
        <tbody>
          {data.employers.map((employer: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.employers[${idx}].name`}
                  value={employer.name}
                  className="font-semibold text-gray-900 dark:text-gray-100"
                />
              </td>
              <td className="py-3 text-gray-600 dark:text-gray-400">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.employers[${idx}].employees`}
                  value={employer.employees}
                  className="text-gray-600 dark:text-gray-400"
                />
              </td>
              <td className="py-3 text-gray-600 dark:text-gray-400">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.employers[${idx}].industry`}
                  value={employer.industry}
                  className="text-gray-600 dark:text-gray-400"
                />
              </td>
              <td className="py-3 text-gray-600 dark:text-gray-400">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.employers[${idx}].distance`}
                  value={employer.distance}
                  className="text-gray-600 dark:text-gray-400"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default MajorEmployersSection; 