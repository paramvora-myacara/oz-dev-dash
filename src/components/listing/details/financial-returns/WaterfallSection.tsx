'use client';

import React from 'react';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

const WaterfallSection: React.FC<{ data: any; sectionIndex: number }> = ({ data, sectionIndex }) => {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  const saleWaterfallPath = `details.financialReturns.sections[${sectionIndex}].data.saleWaterfall`;
  const cashFlowPath = `details.financialReturns.sections[${sectionIndex}].data.cashFlowDistribution`;
  
  const saleWaterfall = (draftData ? getByPath(draftData, saleWaterfallPath) : null) ?? data.saleWaterfall ?? [];
  const cashFlowDistribution = (draftData ? getByPath(draftData, cashFlowPath) : null) ?? data.cashFlowDistribution ?? [];

  const handleAddSaleWaterfall = () => {
    const newItem = { priority: 'First', allocation: '100%', description: 'Description' };
    updateField(saleWaterfallPath, [...saleWaterfall, newItem]);
  };

  const handleRemoveSaleWaterfall = (idx: number) => {
    const updated = saleWaterfall.filter((_: any, i: number) => i !== idx);
    updateField(saleWaterfallPath, updated);
  };

  const handleAddCashFlow = () => {
    const newItem = { priority: 'First', recipient: 'Recipient', allocation: '100%', description: 'Description' };
    updateField(cashFlowPath, [...cashFlowDistribution, newItem]);
  };

  const handleRemoveCashFlow = (idx: number) => {
    const updated = cashFlowDistribution.filter((_: any, i: number) => i !== idx);
    updateField(cashFlowPath, updated);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sale Waterfall */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Sale Waterfall</h4>
            {isEditing && (
              <button 
                onClick={handleAddSaleWaterfall} 
                className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                + Add
              </button>
            )}
          </div>
          <div className="space-y-3">
            {saleWaterfall.map((item: any, idx: number) => (
              <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                        <Editable 
                          dataPath={`details.financialReturns.sections[${sectionIndex}].data.saleWaterfall[${idx}].priority`}
                          value={item.priority}
                          className="text-base font-semibold text-blue-600 dark:text-blue-400"
                          as="span"
                          spacing="none"
                        />
                      </span>
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                        <Editable 
                          dataPath={`details.financialReturns.sections[${sectionIndex}].data.saleWaterfall[${idx}].allocation`}
                          value={item.allocation}
                          className="text-base font-medium text-gray-700 dark:text-gray-300"
                          as="span"
                          spacing="none"
                        />
                      </span>
                    </div>
                    <Editable 
                      dataPath={`details.financialReturns.sections[${sectionIndex}].data.saleWaterfall[${idx}].description`}
                      value={item.description}
                      inputType="multiline"
                      className="text-base text-gray-600 dark:text-gray-400"
                      as="span"
                      spacing="none"
                    />
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => handleRemoveSaleWaterfall(idx)} 
                      className="ml-2 px-2 py-1 text-sm rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution Waterfall */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Distribution Waterfall</h4>
            {isEditing && (
              <button 
                onClick={handleAddCashFlow} 
                className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                + Add
              </button>
            )}
          </div>
          <div className="space-y-3">
            {cashFlowDistribution.map((item: any, idx: number) => (
              <div key={idx} className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                        <Editable 
                          dataPath={`details.financialReturns.sections[${sectionIndex}].data.cashFlowDistribution[${idx}].priority`}
                          value={item.priority}
                          className="text-base font-semibold text-blue-600 dark:text-blue-400"
                          as="span"
                          spacing="none"
                        />
                      </span>
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                        <Editable 
                          dataPath={`details.financialReturns.sections[${sectionIndex}].data.cashFlowDistribution[${idx}].recipient`}
                          value={item.recipient}
                          className="text-base font-medium text-gray-700 dark:text-gray-300"
                          as="span"
                          spacing="none"
                        />
                      </span>
                    </div>
                    <div className="text-base text-gray-500 dark:text-gray-500 mb-2">
                      <Editable 
                        dataPath={`details.financialReturns.sections[${sectionIndex}].data.cashFlowDistribution[${idx}].allocation`}
                        value={item.allocation}
                        className="text-base text-gray-500 dark:text-gray-500"
                        as="span"
                        spacing="none"
                      />
                    </div>
                    <Editable 
                      dataPath={`details.financialReturns.sections[${sectionIndex}].data.cashFlowDistribution[${idx}].description`}
                      value={item.description}
                      inputType="multiline"
                      className="text-base text-gray-600 dark:text-gray-400"
                      as="span"
                      spacing="none"
                    />
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => handleRemoveCashFlow(idx)} 
                      className="ml-2 px-2 py-1 text-sm rounded border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterfallSection;

