'use client'

import { useState, useCallback } from 'react'
import type { EmailTemplate, Section } from '@/types/email-editor'
import { DEFAULT_TEMPLATES } from '@/types/email-editor'

interface UseTemplateManagementOptions {
  initialTemplate?: EmailTemplate
  initialSections?: Section[]
  onSectionsChange: (sections: Section[]) => void
}

interface UseTemplateManagementReturn {
  selectedTemplate: EmailTemplate | null
  showDropdown: boolean
  setSelectedTemplate: (template: EmailTemplate | null) => void
  setShowDropdown: (show: boolean) => void
  selectTemplate: (template: EmailTemplate) => void
  availableTemplates: EmailTemplate[]
}

export function useTemplateManagement({
  initialTemplate,
  initialSections,
  onSectionsChange
}: UseTemplateManagementOptions): UseTemplateManagementReturn {
  const hasInitialData = initialTemplate || (initialSections && initialSections.length > 0)

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    hasInitialData ? (initialTemplate || DEFAULT_TEMPLATES[0]) : null
  )
  const [showDropdown, setShowDropdown] = useState(false)

  const selectTemplate = useCallback((template: EmailTemplate) => {
    setSelectedTemplate(template)
    const sectionsWithOrder = template.defaultSections.map((section, index) => ({
      ...section,
      order: index,
    }))
    onSectionsChange(sectionsWithOrder)
    setShowDropdown(false)
  }, [onSectionsChange])

  return {
    selectedTemplate,
    showDropdown,
    setSelectedTemplate,
    setShowDropdown,
    selectTemplate,
    availableTemplates: DEFAULT_TEMPLATES,
  }
}
