import React from 'react';
import { Editable } from '@/components/Editable';

const CapitalStackSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-blue-300 mb-6">Capital Structure</h3>

      {/* Uses and Sources Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Uses Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Uses of Funds</h4>
          <div className="space-y-3">
            {data.uses.map((use: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex-1">
                  <Editable
                    dataPath={`details.financialReturns.sections[${sectionIndex}].data.uses[${idx}].use`}
                    value={use.use}
                    className="font-medium text-gray-900 dark:text-gray-100"
                    as="span"
                    spacing="none"
                  />
                  <Editable
                    dataPath={`details.financialReturns.sections[${sectionIndex}].data.uses[${idx}].description`}
                    value={use.description}
                    inputType="multiline"
                    className="text-sm text-gray-600 dark:text-gray-400 block mt-1"
                    as="span"
                    spacing="none"
                  />
                </div>
                <div className="text-right">
                  <Editable
                    dataPath={`details.financialReturns.sections[${sectionIndex}].data.uses[${idx}].amount`}
                    value={use.amount}
                    className="font-semibold text-blue-600 dark:text-blue-400"
                    as="span"
                    spacing="none"
                  />
                  <Editable
                    dataPath={`details.financialReturns.sections[${sectionIndex}].data.uses[${idx}].percentage`}
                    value={use.percentage}
                    className="text-sm text-gray-500 dark:text-gray-500 block"
                    as="span"
                    spacing="none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sources Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Sources of Funds</h4>
          <div className="space-y-3">
            {data.sources.map((source: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <div className="flex-1">
                  <Editable
                    dataPath={`details.financialReturns.sections[${sectionIndex}].data.sources[${idx}].source`}
                    value={source.source}
                    className="font-medium text-gray-900 dark:text-gray-100"
                    as="span"
                    spacing="none"
                  />
                  <Editable
                    dataPath={`details.financialReturns.sections[${sectionIndex}].data.sources[${idx}].description`}
                    value={source.description}
                    inputType="multiline"
                    className="text-sm text-gray-600 dark:text-gray-400 block mt-1"
                    as="span"
                    spacing="none"
                  />
                </div>
                <div className="text-right">
                  <Editable
                    dataPath={`details.financialReturns.sections[${sectionIndex}].data.sources[${idx}].amount`}
                    value={source.amount}
                    className="font-semibold text-blue-600 dark:text-blue-400"
                    as="span"
                    spacing="none"
                  />
                  <Editable
                    dataPath={`details.financialReturns.sections[${sectionIndex}].data.sources[${idx}].percentage`}
                    value={source.percentage}
                    className="text-sm text-gray-500 dark:text-gray-500 block"
                    as="span"
                    spacing="none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Total Project Cost */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-800 dark:text-gray-200">Total Project Cost</span>
          <Editable
            dataPath={`details.financialReturns.sections[${sectionIndex}].data.totalProject`}
            value={data.totalProject}
            className="text-lg font-bold text-blue-600 dark:text-blue-400"
            as="span"
            spacing="none"
          />
        </div>
      </div>
    </div>
  );
};

export default CapitalStackSection;
