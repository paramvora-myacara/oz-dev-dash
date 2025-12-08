'use client'

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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
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
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-4xl mb-3">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No sections yet</h3>
        <p className="text-sm text-gray-500">
          Add a section to start building your email.
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
        <div className="space-y-4">
          {sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              onChange={handleSectionChange}
              onDelete={() => handleSectionDelete(section.id)}
              availableFields={availableFields}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
