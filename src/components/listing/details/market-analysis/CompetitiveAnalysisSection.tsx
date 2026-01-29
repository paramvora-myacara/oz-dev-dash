import React from 'react';
import { Editable } from '@/components/Editable';

const CompetitiveAnalysisSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  // Support both old format (competitors) and new format (categories)
  if (data.categories && data.categories.length > 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.categories.map((category: any, catIdx: number) => (
            <div key={catIdx} className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded">
                <Editable 
                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.categories[${catIdx}].title`}
                  value={category.title}
                  className="font-semibold"
                  as="span"
                  spacing="none"
                />
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {category.projects.some((p: any) => p.id) && (
                        <th className="text-left py-2 text-sm font-medium text-gray-900 dark:text-gray-100">ID</th>
                      )}
                      <th className="text-left py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Project</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-900 dark:text-gray-100"># Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const hasIds = category.projects.some((p: any) => p.id);
                      return category.projects.map((project: any, projIdx: number) => (
                        <tr key={projIdx} className="border-b border-gray-100 dark:border-gray-800">
                          {hasIds && (
                            <td className="py-2 text-sm text-gray-600 dark:text-gray-400">
                              {project.id && (
                                <Editable 
                                  dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.categories[${catIdx}].projects[${projIdx}].id`}
                                  value={project.id}
                                  className="text-gray-600 dark:text-gray-400"
                                  as="span"
                                  spacing="none"
                                />
                              )}
                            </td>
                          )}
                          <td className="py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                            <Editable 
                              dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.categories[${catIdx}].projects[${projIdx}].name`}
                              value={project.name}
                              className="font-medium text-gray-900 dark:text-gray-100"
                              as="span"
                              spacing="none"
                            />
                          </td>
                          <td className="py-2 text-sm text-gray-600 dark:text-gray-400">
                            <Editable 
                              dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.categories[${catIdx}].projects[${projIdx}].units`}
                              value={project.units}
                              className="text-gray-600 dark:text-gray-400"
                              as="span"
                              spacing="none"
                            />
                          </td>
                        </tr>
                      ));
                    })()}
                    {category.total && (
                      <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-semibold">
                        <td colSpan={category.projects.some((p: any) => p.id) ? 2 : 1} className="py-2 text-sm text-gray-900 dark:text-gray-100">TOTAL</td>
                        <td className="py-2 text-sm text-gray-900 dark:text-gray-100">
                          <Editable 
                            dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.categories[${catIdx}].total`}
                            value={category.total}
                            className="font-semibold text-gray-900 dark:text-gray-100"
                            as="span"
                            spacing="none"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        {data.summary &&
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
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
  }

  // Fallback to old format
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        <Editable 
          dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.title`}
          value={data.title || "Comparable Properties"}
          className="font-semibold"
          as="span"
          spacing="none"
        />
      </h3>
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
            {data.competitors?.map((property: any, idx: number) => (
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
                <td className="py-3 text-blue-600 dark:text-blue-400 font-semibold">
                  <Editable 
                    dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.competitors[${idx}].occupancy`}
                    value={property.occupancy}
                    className="text-blue-600 dark:text-blue-400 font-semibold"
                    as="span"
                    spacing="none"
                  />
                </td>
                <td className="py-3 text-blue-600 dark:text-blue-400 font-semibold">
                  <Editable 
                    dataPath={`details.marketAnalysis.sections[${sectionIndex}].data.competitors[${idx}].rentGrowth`}
                    value={property.rentGrowth}
                    className="text-blue-600 dark:text-blue-400 font-semibold"
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
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
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
};

export default CompetitiveAnalysisSection; 