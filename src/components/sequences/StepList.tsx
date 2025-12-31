'use client';

import { useMemo, useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { Plus } from 'lucide-react';

import type { CampaignStep } from '@/types/email-editor';
import { StepCard } from './StepCard';

interface StepListProps {
    steps: CampaignStep[];
    selectedStepId?: string;
    editable?: boolean;
    onReorder: (newOrder: CampaignStep[]) => void;
    onStepSelect: (step: CampaignStep) => void;
    onStepEdit: (step: CampaignStep) => void;
    onStepDelete: (stepId: string) => void;
    onDelayChange: (stepId: string, delayDays: number, delayHours: number) => void;
    onAddStep: () => void;
}

/**
 * Sortable wrapper for StepCard that provides drag-and-drop functionality.
 */
function SortableStepCard({
    step,
    stepNumber,
    isSelected,
    isFirst,
    editable,
    onSelect,
    onEdit,
    onDelete,
    onDelayChange,
}: {
    step: CampaignStep;
    stepNumber: number;
    isSelected: boolean;
    isFirst: boolean;
    editable: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onDelayChange?: (delayDays: number, delayHours: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <StepCard
                step={step}
                stepNumber={stepNumber}
                isSelected={isSelected}
                isFirst={isFirst}
                editable={editable}
                isDragging={isDragging}
                dragHandleProps={{ ...attributes, ...listeners }}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onDelayChange={onDelayChange}
            />
        </div>
    );
}

/**
 * List of sequence steps with drag-and-drop reordering.
 * Uses @dnd-kit for accessible, performant drag-and-drop.
 */
export function StepList({
    steps,
    selectedStepId,
    editable = true,
    onReorder,
    onStepSelect,
    onStepEdit,
    onStepDelete,
    onDelayChange,
    onAddStep,
}: StepListProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    // Memoize step IDs for SortableContext
    const stepIds = useMemo(() => steps.map((s) => s.id), [steps]);

    // Sensors for mouse/touch and keyboard interaction
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = steps.findIndex((s) => s.id === active.id);
            const newIndex = steps.findIndex((s) => s.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newSteps = [...steps];
                const [removed] = newSteps.splice(oldIndex, 1);
                newSteps.splice(newIndex, 0, removed);
                onReorder(newSteps);
            }
        }
    };

    const activeStep = activeId ? steps.find((s) => s.id === activeId) : null;

    return (
        <div className="space-y-0">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
                    {steps.map((step, index) => (
                        <SortableStepCard
                            key={step.id}
                            step={step}
                            stepNumber={index + 1}
                            isSelected={step.id === selectedStepId}
                            isFirst={index === 0}
                            editable={editable}
                            onSelect={() => onStepSelect(step)}
                            onEdit={() => onStepEdit(step)}
                            onDelete={() => onStepDelete(step.id)}
                            onDelayChange={(days, hours) => onDelayChange(step.id, days, hours)}
                        />
                    ))}
                </SortableContext>

                <DragOverlay>
                    {activeStep && (
                        <StepCard
                            step={activeStep}
                            stepNumber={steps.findIndex((s) => s.id === activeStep.id) + 1}
                            isSelected={false}
                            isFirst={false}
                            editable={false}
                            isDragging
                            onSelect={() => { }}
                            onEdit={() => { }}
                            onDelete={() => { }}
                        />
                    )}
                </DragOverlay>
            </DndContext>

            {/* Add step button */}
            {editable && (
                <div className="pt-4">
                    <button
                        type="button"
                        onClick={onAddStep}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                    >
                        <Plus size={18} />
                        <span className="font-medium">Add Step</span>
                    </button>
                </div>
            )}

            {/* Empty state */}
            {steps.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                        <Plus size={48} className="mx-auto opacity-50" />
                    </div>
                    <p className="text-gray-500">No steps yet. Add your first step to get started.</p>
                </div>
            )}
        </div>
    );
}

export default StepList;
