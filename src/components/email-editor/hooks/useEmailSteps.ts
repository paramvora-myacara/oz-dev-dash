'use client'

import { useState, useCallback, useEffect } from 'react'
import type { CampaignStep, Section, SectionMode } from '@/types/email-editor'
import { getSteps, replaceCampaignSteps } from '@/lib/api/campaigns-backend'
import { useCampaignStore } from '@/stores/campaignStore'

interface UseEmailStepsOptions {
  campaignId: string
}

interface UseEmailStepsReturn {
  steps: CampaignStep[]
  currentStepIndex: number
  isLoading: boolean
  error: string | null
  setCurrentStepIndex: (index: number) => void
  addStep: () => void
  deleteStepByIndex: (index: number) => void
  updateStep: (stepId: string, updates: Partial<CampaignStep>) => void
  updateCurrentStepContent: (sections: Section[], subject: { mode: SectionMode; content: string; selectedFields?: string[] }) => void
  loadSteps: () => Promise<void>
  syncUnsavedChanges: () => Promise<void>
}

export function useEmailSteps({ campaignId }: UseEmailStepsOptions): UseEmailStepsReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Zustand store hooks
  const {
    steps: storeSteps,
    setCampaign,
    loadStepsFromServer,
    updateStep: updateStepStore,
    removeStep: removeStepStore,
    updateCurrentStepContent: storeUpdateContent,
    getUnsyncedSteps,
    markStepsSynced
  } = useCampaignStore()

  // Convert store steps to array format expected by components
  // Sort by created date to maintain order
  const steps = Object.values(storeSteps).sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // Initialize campaign in store
  useEffect(() => {
    setCampaign(campaignId, '') // We can load campaign name separately if needed
  }, [campaignId, setCampaign])

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
        loadStepsFromServer(fetchedSteps)
      }
    } catch (err) {
      console.error('Failed to load steps:', err)
      setError('Failed to load email steps')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, loadStepsFromServer])

  const updateStep = useCallback((stepId: string, updates: Partial<CampaignStep>) => {
    // Update store (which saves to localStorage automatically)
    updateStepStore(stepId, updates)
  }, [updateStepStore])

  const addStep = useCallback(() => {
    const newStepNumber = steps.length + 1
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newStep = {
      id: tempId,
      campaignId,
      name: `Follow-up ${newStepNumber - 1}`,
      subject: { mode: 'static' as SectionMode, content: '' },
      sections: [],
      edges: [], // New steps have empty edges (end of sequence)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add new step to store (saves to localStorage automatically)
    updateStep(tempId, newStep)

    // Update previous step's edges to point to new step
    if (steps.length > 0) {
      const prevStep = steps[steps.length - 1]
      const updatedEdges = [...(prevStep.edges || []), {
        targetStepId: tempId,
        delayDays: 2,
        delayHours: 0,
        delayMinutes: 0,
        condition: null
      }]
      updateStep(prevStep.id, { edges: updatedEdges })
    }

    setCurrentStepIndex(steps.length)
  }, [steps, campaignId, updateStep])

  const deleteStepByIndex = useCallback((index: number) => {
    // Don't allow deleting the last step
    if (steps.length <= 1) {
      return
    }

    const step = steps[index]
    if (step?.id) {
      // Remove step from store - it will be excluded during set-based sync
      removeStepStore(step.id)

      // Update local step index if needed
      if (currentStepIndex === index) {
        const nextIndex = Math.max(0, index - 1)
        setCurrentStepIndex(nextIndex)
      } else if (currentStepIndex > index) {
        setCurrentStepIndex(currentStepIndex - 1)
      }
    }
  }, [steps, currentStepIndex, removeStepStore])

  const updateCurrentStepContent = useCallback((
    sections: Section[],
    subject: { mode: SectionMode; content: string; selectedFields?: string[] }
  ) => {
    const currentStep = steps[currentStepIndex]
    if (!currentStep?.id) return

    // Update store (which saves to localStorage automatically)
    storeUpdateContent(currentStep.id, sections, subject)
  }, [steps, currentStepIndex, storeUpdateContent])

  const syncUnsavedChanges = useCallback(async () => {
    // Send complete current state for set-based replacement
    const currentSteps = Object.values(storeSteps)
    if (currentSteps.length === 0) {
      return // Nothing to sync
    }

    // Replace all campaign steps with current state
    await replaceCampaignSteps(campaignId, currentSteps)

    // Mark all steps as synced (they are now synced)
    markStepsSynced(currentSteps.map(step => step.id))
  }, [campaignId, storeSteps, replaceCampaignSteps, markStepsSynced])

  return {
    steps,
    currentStepIndex,
    isLoading,
    error,
    setCurrentStepIndex,
    addStep,
    updateStep,
    deleteStepByIndex,
    updateCurrentStepContent,
    loadSteps,
    syncUnsavedChanges,
  }
}
