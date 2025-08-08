import React from 'react';
import { Editable } from '@/components/Editable';

const CompetitiveAnalysisSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Competitive Student Housing Market</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Property</th>
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Year Built</th>
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Beds</th>
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Avg Rate/Bed</th>
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Occupancy</th>
            <th className="text-left py-3 text-gray-900 dark:text-gray-100">Rent Growth</th>
          </tr>
        </thead>
        <tbody>
          {data.competitors.map((property: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.competitors[${idx}].name`}
                  value={property.name}
                  className="font-semibold text-gray-900 dark:text-gray-100"
                  as="span"
                  spacing="none"
                />
              </td>
              <td className="py-3 text-gray-600 dark:text-gray-400">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.competitors[${idx}].built`}
                  value={property.built}
                  className="text-gray-600 dark:text-gray-400"
                  as="span"
                  spacing="none"
                />
              </td>
              <td className="py-3 text-gray-600 dark:text-gray-400">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.competitors[${idx}].beds`}
                  value={property.beds}
                  className="text-gray-600 dark:text-gray-400"
                  as="span"
                  spacing="none"
                />
              </td>
              <td className="py-3 text-gray-600 dark:text-gray-400">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.competitors[${idx}].rent`}
                  value={property.rent}
                  className="text-gray-600 dark:text-gray-400"
                  as="span"
                  spacing="none"
                />
              </td>
              <td className="py-3 text-green-600 dark:text-green-400 font-semibold">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.competitors[${idx}].occupancy`}
                  value={property.occupancy}
                  className="text-green-600 dark:text-green-400 font-semibold"
                  as="span"
                  spacing="none"
                />
              </td>
              <td className="py-3 text-purple-600 dark:text-purple-400 font-semibold">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.competitors[${idx}].rentGrowth`}
                  value={property.rentGrowth}
                  className="text-purple-600 dark:text-purple-400 font-semibold"
                  as="span"
                  spacing="none"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.summary &&
      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
        <Editable 
          dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.summary`}
          value={data.summary}
          inputType="multiline"
          className="text-gray-600 dark:text-gray-400"
          as="p"
          spacing="none"
        />
      </div>
    }
  </div>
);

export default CompetitiveAnalysisSection; 