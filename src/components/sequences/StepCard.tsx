'use client';

import { Mail, GripVertical, Trash2, Edit2, ChevronRight } from 'lucide-react';
import type { CampaignStep } from '@/types/email-editor';
import { DelayBadge } from './DelayBadge';

interface StepCardProps {
    step: CampaignStep;
    stepNumber: number;
    isSelected: boolean;
    isFirst: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onDelayChange?: (delayDays: number, delayHours: number, delayMinutes: number) => void;
    editable?: boolean;
    isDragging?: boolean;
    dragHandleProps?: Record<string, unknown>;
}

/**
 * Card component for displaying a sequence step in the step list.
 * Shows step name, subject preview, delay badge, and action buttons.
 */
export function StepCard({
    step,
    stepNumber,
    isSelected,
    isFirst,
    onSelect,
    onEdit,
    onDelete,
    onDelayChange,
    editable = true,
    isDragging = false,
    dragHandleProps = {},
}: StepCardProps) {
    // Get delay from first edge (for linear sequences)
    const delay = step.edges?.[0] ?? { delayDays: 0, delayHours: 0, delayMinutes: 0 };

    // Subject preview (truncated)
    const subjectPreview = step.subject?.content
        ? step.subject.content.length > 50
            ? step.subject.content.substring(0, 50) + '...'
            : step.subject.content
        : 'No subject';

    return (
        <div className="flex flex-col">
            {/* Delay badge between steps (not shown for first step) */}
            {!isFirst && (
                <div className="flex items-center justify-center py-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <div className="px-3">
                        <DelayBadge
                            delayDays={delay.delayDays}
                            delayHours={delay.delayHours}
                            delayMinutes={delay.delayMinutes || 0}
                            onChange={onDelayChange}
                            editable={editable}
                            size="sm"
                        />
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>
            )}

            {/* Step card */}
            <div
                role="button"
                tabIndex={0}
                onClick={onSelect}
                onKeyDown={(e) => e.key === 'Enter' && onSelect()}
                className={`
          group relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer
          ${isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
          ${isDragging ? 'shadow-lg scale-[1.02] opacity-90' : ''}
        `}
            >
                {/* Drag handle */}
                {editable && (
                    <div
                        {...dragHandleProps}
                        className="flex-shrink-0 p-1 -ml-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical size={18} />
                    </div>
                )}

                {/* Step number badge */}
                <div
                    className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}
          `}
                >
                    {stepNumber}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Mail size={16} className={isSelected ? 'text-indigo-600' : 'text-gray-400'} />
                        <h3 className="font-medium text-gray-900 truncate">{step.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                        Subject: {subjectPreview}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit step"
                    >
                        <Edit2 size={16} />
                    </button>
                    {editable && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this step?')) {
                                    onDelete();
                                }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete step"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                    <ChevronRight size={20} className="flex-shrink-0 text-indigo-600" />
                )}
            </div>
        </div>
    );
}

export default StepCard;
