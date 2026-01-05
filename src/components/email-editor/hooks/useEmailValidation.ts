'use client'

import { useMemo } from 'react'
import type { Section, SampleData, SectionMode } from '@/types/email-editor'
import { extractTemplateFields, validateTemplateFields } from '@/lib/utils/status-labels'

interface UseEmailValidationOptions {
  sections: Section[]
  subjectLine: { mode: SectionMode; content: string; selectedFields?: string[] }
  sampleData: SampleData | null
  recipientCount: number
}

interface UseEmailValidationReturn {
  canContinue: boolean
  continueDisabledReason: string | null
  validationError: { fields: string[] } | null
  validateForContinue: () => void
}

export function useEmailValidation({
  sections,
  subjectLine,
  sampleData,
  recipientCount
}: UseEmailValidationOptions): UseEmailValidationReturn {
  const canContinue = useMemo(() => {
    const hasRecipients = recipientCount > 0
    const hasSubject = subjectLine.content.trim().length > 0
    const hasContent = sections.some(s => s.content?.trim().length > 0)
    return hasRecipients && hasSubject && hasContent
  }, [recipientCount, subjectLine, sections])

  const continueDisabledReason = useMemo(() => {
    if (recipientCount === 0) return 'Select recipients first'
    if (!subjectLine.content.trim()) return 'Add a subject line'
    if (!sections.some(s => s.content?.trim().length > 0)) return 'Add email content'
    return null
  }, [recipientCount, subjectLine, sections])

  const validationError = useMemo(() => {
    if (!sampleData) return null

    const allFields: string[] = []
    allFields.push(...extractTemplateFields(subjectLine.content))
    sections.forEach(section => {
      if (section.content) {
        allFields.push(...extractTemplateFields(section.content))
      }
    })

    const validation = validateTemplateFields(allFields, sampleData.columns)
    return validation.valid ? null : { fields: validation.missingFields }
  }, [sampleData, subjectLine, sections])

  const validateForContinue = () => {
    if (validationError) {
      // Error is already computed in useMemo
      return
    }
  }

  return {
    canContinue,
    continueDisabledReason,
    validationError,
    validateForContinue,
  }
}
