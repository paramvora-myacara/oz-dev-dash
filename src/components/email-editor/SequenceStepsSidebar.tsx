'use client';

import { useState } from 'react';
import { Plus, Mail, ChevronRight, Clock, GitBranch, Trash2 } from 'lucide-react';
import type { CampaignStep, Section, SectionMode } from '@/types/email-editor';
import { DelayBadge } from '@/components/sequences/DelayBadge';

interface SequenceStepsSidebarProps {
    steps: CampaignStep[];
    currentStepIndex: number;
    onStepSelect: (index: number) => void;
    onAddStep: () => void;
    onDeleteStep: (index: number) => void;
    onDelayChange: (stepIndex: number, delayDays: number, delayHours: number, delayMinutes: number) => void;
    isEditable?: boolean;
}

/**
 * Sidebar component for managing multiple email steps in a sequence.
 * Shows step list with delays and "Add Follow-up" button.
 */
export function SequenceStepsSidebar({
    steps,
    currentStepIndex,
    onStepSelect,
    onAddStep,
    onDeleteStep,
    onDelayChange,
    isEditable = true,
}: SequenceStepsSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isCollapsed) {
        return (
            <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-3">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Expand steps"
                >
                    <GitBranch size={18} />
                </button>
                <div className="mt-3 flex flex-col gap-2">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onStepSelect(index)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${index === currentStepIndex
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                {isEditable && (
                    <button
                        onClick={onAddStep}
                        className="mt-auto p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Add follow-up step"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GitBranch size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                        {steps.length === 1 ? 'Email' : 'Sequence'}
                    </span>
                </div>
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Steps list */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-0">
                    {steps.map((step, index) => (
                        <div key={step.id || index}>
                            {/* Delay badge between steps */}
                            {index > 0 && (
                                <div className="flex items-center justify-center py-2">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <div className="px-2">
                                        <DelayBadge
                                            delayDays={steps[index - 1]?.edges?.[0]?.delayDays ?? 1}
                                            delayHours={steps[index - 1]?.edges?.[0]?.delayHours ?? 0}
                                            delayMinutes={steps[index - 1]?.edges?.[0]?.delayMinutes ?? 0}
                                            onChange={(days, hours, minutes) => onDelayChange(index - 1, days, hours, minutes)}
                                            editable={isEditable}
                                            size="sm"
                                        />
                                    </div>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>
                            )}

                            {/* Step card */}
                            <button
                                onClick={() => onStepSelect(index)}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${index === currentStepIndex
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-transparent hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === currentStepIndex
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {step.name || `Step ${index + 1}`}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {step.subject?.content || 'No subject'}
                                        </p>
                                    </div>
                                    {steps.length > 1 && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteStep(index);
                                            }}
                                            className={`p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer ${
                                                index === currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                                            }`}
                                            title="Delete step"
                                        >
                                            <Trash2 size={14} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add step button */}
                {isEditable && (
                    <button
                        onClick={onAddStep}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-white transition-colors"
                    >
                        <Plus size={16} />
                        Add Follow-up
                    </button>
                )}
            </div>

            {/* Info footer */}
            {steps.length > 1 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-100">
                    <p className="text-xs text-gray-500">
                        {steps.length} steps • Stops on reply
                    </p>
                </div>
            )}
        </div>
    );
}

export default SequenceStepsSidebar;
