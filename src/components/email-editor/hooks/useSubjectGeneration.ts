'use client'

import { useState, useCallback } from 'react'
import type { Campaign } from '@/types/email-editor'

interface UseSubjectGenerationOptions {
  campaign?: Campaign
  campaignId: string
}

interface UseSubjectGenerationReturn {
  isGenerating: boolean
  error: string | null
  subjectPrompt: string
  modalSubject: string
  showModal: boolean
  setSubjectPrompt: (prompt: string) => void
  setModalSubject: (subject: string) => void
  setShowModal: (show: boolean) => void
  openModal: (currentSubject: string) => void
  generateSubject: () => Promise<void>
  saveSubject: (onSave: (subject: string) => void) => void
}

export function useSubjectGeneration({ campaign, campaignId }: UseSubjectGenerationOptions): UseSubjectGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [subjectPrompt, setSubjectPrompt] = useState(
    'Generate a highly professional, institutional-quality email subject line for U.S. real estate developers and real estate funds. Assume the recipient is an experienced 50+ year-old developer who does not know what Opportunity Zones are, and we have already accounted for that in how we explain things. The subject should clearly and easily communicate the concrete benefits of using an Opportunity Zone structure for their project, not just a generic marketing statement. Focus on how OZ treatment helps them raise or deploy capital more efficiently, reduce taxes, or improve project economics. Keep it under 60 characters and optimized for opens.'
  )
  const [modalSubject, setModalSubject] = useState('')

  const openModal = useCallback((currentSubject: string) => {
    // Seed prompt and subject with sensible defaults
    setSubjectPrompt((prev: string) =>
      prev && prev.trim().length > 0
        ? prev
        : 'Generate a highly professional, institutional-quality email subject line for U.S. real estate developers and real estate funds. Assume the recipient is an experienced developer who does not know what Opportunity Zones are, and we have to account for that in how we explain things. The subject should clearly and easily communicate the concrete benefits of using an Opportunity Zone structure for their project, not just a generic marketing statement. Focus on how OZ treatment helps them raise or deploy capital more efficiently, reduce taxes, or improve project economics. Keep it under 60 characters and optimized for opens.'
    )
    setModalSubject(currentSubject || '')
    setShowModal(true)
    setError(null)
  }, [])

  const generateSubject = useCallback(async () => {
    if (!campaign) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/backend-proxy/campaigns/${campaign.id || campaignId}/generate-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions: subjectPrompt })
      })

      if (!response.ok) {
        throw new Error('Failed to generate subject')
      }

      const data = await response.json()
      // Only update the subject shown in the modal – don't touch the actual subject field yet
      setModalSubject(data.subject || '')
    } catch (error) {
      console.error('Subject generation failed:', error)
      setError('Failed to generate subject line. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [campaign, campaignId, subjectPrompt])

  const saveSubject = useCallback((onSave: (subject: string) => void) => {
    // Apply the modal subject to the actual subject line and close
    onSave(modalSubject)
    setShowModal(false)
  }, [modalSubject])

  return {
    isGenerating,
    error,
    subjectPrompt,
    modalSubject,
    showModal,
    setSubjectPrompt,
    setModalSubject,
    setShowModal,
    openModal,
    generateSubject,
    saveSubject,
  }
}
