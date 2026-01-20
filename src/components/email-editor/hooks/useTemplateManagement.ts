'use client'

import { useState, useCallback, useEffect } from 'react'
import type { EmailTemplate, Section } from '@/types/email-editor'
import { DEFAULT_TEMPLATES } from '@/types/email-editor'
import { getEmailTemplates, saveEmailTemplate } from '@/lib/services/email-templates'

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
  saveTemplate: (name: string, sections: Section[]) => Promise<void>
  loadTemplates: () => Promise<void>
}

// Keep the Blank Template hardcoded
const BLANK_TEMPLATE: EmailTemplate = {
  id: 'blank',
  slug: 'blank',
  name: 'Blank Template',
  description: 'Start from scratch',
  defaultSections: [],
}

export function useTemplateManagement({
  initialTemplate,
  initialSections,
  onSectionsChange
}: UseTemplateManagementOptions): UseTemplateManagementReturn {
  const hasInitialData = initialTemplate || (initialSections && initialSections.length > 0)

  // Start with just the blank template until we fetch
  const [availableTemplates, setAvailableTemplates] = useState<EmailTemplate[]>([BLANK_TEMPLATE])

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    hasInitialData ? (initialTemplate || null) : null
  )
  const [showDropdown, setShowDropdown] = useState(false)

  const loadTemplates = useCallback(async () => {
    try {
      const dbTemplates = await getEmailTemplates()
      // Merge DB templates with the blank template
      setAvailableTemplates([...dbTemplates, BLANK_TEMPLATE])
    } catch (error) {
      console.error('Failed to load templates:', error)
      // Fallback: use DEFAULT_TEMPLATES if DB fails (only if they aren't duplicates)
      // For now, safely fallback to BLANK_TEMPLATE
      setAvailableTemplates([BLANK_TEMPLATE])
    }
  }, [])

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const selectTemplate = useCallback((template: EmailTemplate) => {
    setSelectedTemplate(template)
    const sectionsWithOrder = template.defaultSections.map((section, index) => ({
      ...section,
      order: index,
    }))
    onSectionsChange(sectionsWithOrder)
    setShowDropdown(false)
  }, [onSectionsChange])

  const saveTemplate = useCallback(async (name: string, sections: Section[]) => {
    try {
      // Remove 'order' field to match EmailTemplate structure
      const defaultSections = sections.map(({ order, ...rest }) => rest)

      const saved = await saveEmailTemplate({
        name,
        defaultSections
      })

      if (saved) {
        // Refresh list
        await loadTemplates()
        setSelectedTemplate(saved)
      }
    } catch (error) {
      console.error('Failed to save template', error)
      throw error
    }
  }, [loadTemplates])

  return {
    selectedTemplate,
    showDropdown,
    setSelectedTemplate,
    setShowDropdown,
    selectTemplate,
    availableTemplates,
    saveTemplate,
    loadTemplates
  }
}
