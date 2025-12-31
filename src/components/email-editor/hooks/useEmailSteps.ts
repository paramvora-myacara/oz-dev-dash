'use client'

import { useState, useCallback, useEffect } from 'react'
import type { CampaignStep, Section, SectionMode } from '@/types/email-editor'
import { getSteps, createStep, updateStep as updateStepApi, deleteStep as deleteStepApi } from '@/lib/api/campaigns-backend'

interface UseEmailStepsOptions {
  campaignId: string
  initialSteps?: CampaignStep[]
}

interface UseEmailStepsReturn {
  steps: CampaignStep[]
  currentStepIndex: number
  isLoading: boolean
  error: string | null
  setCurrentStepIndex: (index: number) => void
  addStep: () => Promise<void>
  updateStep: (stepId: string, data: Partial<CampaignStep>) => Promise<void>
  deleteStep: (stepId: string) => Promise<void>
  deleteStepByIndex: (index: number) => void
  updateCurrentStepContent: (sections: Section[], subject: { mode: SectionMode; content: string; selectedFields?: string[] }) => void
  loadSteps: () => Promise<void>
}

export function useEmailSteps({ campaignId, initialSteps }: UseEmailStepsOptions): UseEmailStepsReturn {
  const [steps, setSteps] = useState<CampaignStep[]>(initialSteps || [])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load steps on mount
  useEffect(() => {
    loadSteps()
  }, [campaignId])

  const loadSteps = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedSteps = await getSteps(campaignId)
      if (fetchedSteps && fetchedSteps.length > 0) {
        setSteps(fetchedSteps)
      }
    } catch (err) {
      console.error('Failed to load steps:', err)
      setError('Failed to load email steps')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  const addStep = useCallback(async () => {
    const newStepNumber = steps.length + 1
    const defaultStepData = {
      name: `Follow-up ${newStepNumber - 1}`,
      subject: { mode: 'static' as SectionMode, content: '' },
      sections: [],
      edges: [], // Backend will handle edge management
    }

    try {
      const createdStep = await createStep(campaignId, defaultStepData)

      // Backend automatically updated previous step's edges
      // Refresh all steps to get updated edges
      const updatedSteps = await getSteps(campaignId)
      setSteps(updatedSteps)
      setCurrentStepIndex(steps.length)
    } catch (err) {
      console.error('Failed to create step:', err)
      setError('Failed to create new step')
      throw err
    }
  }, [steps, campaignId])

  const updateStep = useCallback(async (stepId: string, data: Partial<CampaignStep>) => {
    try {
      await updateStepApi(campaignId, stepId, data)
      // Refresh steps to get updated data
      const updatedSteps = await getSteps(campaignId)
      setSteps(updatedSteps)
    } catch (err) {
      console.error('Failed to update step:', err)
      setError('Failed to update step')
      throw err
    }
  }, [campaignId])

  const deleteStep = useCallback(async (stepId: string) => {
    try {
      await deleteStepApi(campaignId, stepId)

      // Backend automatically updated adjacent edges
      // Refresh all steps to get updated edges
      const updatedSteps = await getSteps(campaignId)
      setSteps(updatedSteps)

      // If we deleted the current step, move to the first one available
      const deletedIndex = steps.findIndex(s => s.id === stepId)
      if (currentStepIndex === deletedIndex) {
        const nextIndex = Math.max(0, deletedIndex - 1)
        setCurrentStepIndex(nextIndex)
      } else if (currentStepIndex > deletedIndex) {
        setCurrentStepIndex(currentStepIndex - 1)
      }
    } catch (err) {
      console.error('Failed to delete step:', err)
      setError('Failed to delete step')
      throw err
    }
  }, [campaignId, currentStepIndex, steps])

  const deleteStepByIndex = useCallback((index: number) => {
    // Don't allow deleting the last step
    if (steps.length <= 1) {
      return
    }

    const step = steps[index]
    if (step?.id) {
      deleteStep(step.id)
    }
  }, [steps, deleteStep])

  const updateCurrentStepContent = useCallback((
    sections: Section[],
    subject: { mode: SectionMode; content: string; selectedFields?: string[] }
  ) => {
    // Update local steps state with current content
    setSteps(prevSteps => {
      const updatedSteps = [...prevSteps]
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        sections,
        subject,
      }
      return updatedSteps
    })
  }, [currentStepIndex])

  return {
    steps,
    currentStepIndex,
    isLoading,
    error,
    setCurrentStepIndex,
    addStep,
    updateStep,
    deleteStep,
    deleteStepByIndex,
    updateCurrentStepContent,
    loadSteps,
  }
}
