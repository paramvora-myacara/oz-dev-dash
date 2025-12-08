'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import Section from './Section'
import type { Section as SectionType } from '@/types/email-editor'

interface SectionListProps {
  sections: SectionType[]
  onSectionsChange: (sections: SectionType[]) => void
  availableFields: string[]
}

export default function SectionList({ sections, onSectionsChange, availableFields }: SectionListProps) {
  // Track which section is expanded (only one at a time)
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)

      const newSections = arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index,
      }))

      onSectionsChange(newSections)
    }
  }

  const handleSectionChange = (updatedSection: SectionType) => {
    const newSections = sections.map((s) =>
      s.id === updatedSection.id ? updatedSection : s
    )
    onSectionsChange(newSections)
  }

  const handleSectionDelete = (sectionId: string) => {
    const newSections = sections
      .filter((s) => s.id !== sectionId)
      .map((section, index) => ({
        ...section,
        order: index,
      }))
    onSectionsChange(newSections)
    
    // Clear expanded state if deleted section was expanded
    if (expandedSectionId === sectionId) {
      setExpandedSectionId(null)
    }
  }

  const handleToggleExpand = (sectionId: string) => {
    setExpandedSectionId(expandedSectionId === sectionId ? null : sectionId)
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4">✉️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
        <p className="text-gray-500">
          Click "Add Section" to start building your email.
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              onChange={handleSectionChange}
              onDelete={() => handleSectionDelete(section.id)}
              availableFields={availableFields}
              isExpanded={expandedSectionId === section.id}
              onToggleExpand={() => handleToggleExpand(section.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
