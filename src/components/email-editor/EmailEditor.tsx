'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { Section, SectionMode, SectionType, EmailTemplate, SampleData, Campaign, CampaignStep } from '@/types/email-editor'
import { useEmailSteps, useSubjectGeneration, useTemplateManagement, useEmailValidation } from './hooks'
import EmailEditorToolbar from './EmailEditorToolbar'
import EmailEditorLayout from './EmailEditorLayout'
import SubjectGenerationModal from './SubjectGenerationModal'
import AddSectionModal from './AddSectionModal'


interface EmailEditorProps {
  campaignId: string;
  campaign?: Campaign;
  initialTemplate?: EmailTemplate;
  initialSubjectLine: { mode: SectionMode; content: string; selectedFields?: string[] };
  initialEmailFormat: 'html' | 'text';
  sampleData: SampleData | null;
  recipientCount?: number;
  onContinue: (data: {
    sections: Section[];
    subjectLine: { mode: SectionMode; content: string };
    emailFormat: 'html' | 'text';
  }) => void;
  isContinuing: boolean;
}

export default function EmailEditor({
  campaignId,
  campaign,
  initialTemplate,
  initialSubjectLine,
  initialEmailFormat,
  sampleData,
  recipientCount = 0,
  onContinue,
  isContinuing,
}: EmailEditorProps) {
  // Core state
  const [emailFormat, setEmailFormat] = useState<'html' | 'text'>(initialEmailFormat || 'text')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'steps'>('edit')

  // Custom hooks
  const stepsManager = useEmailSteps({
    campaignId
  })

  const subjectGenerator = useSubjectGeneration({
    campaign,
    campaignId
  })

  const templateManager = useTemplateManagement({
    initialTemplate,
    onSectionsChange: (sections) => {
      stepsManager.updateCurrentStepContent(sections, stepsManager.steps[stepsManager.currentStepIndex]?.subject || { mode: 'static', content: '' })
    }
  })

  const validation = useEmailValidation({
    sections: stepsManager.steps[stepsManager.currentStepIndex]?.sections || [],
    subjectLine: stepsManager.steps[stepsManager.currentStepIndex]?.subject || { mode: 'static', content: '' },
    sampleData,
    recipientCount
  })


  const availableFields = sampleData?.columns || []

  // Current step data
  const currentStep = stepsManager.steps[stepsManager.currentStepIndex]
  const currentSections = currentStep?.sections || []
  const currentSubject = currentStep?.subject || { mode: 'static', content: '' }


  // Event handlers
  const handleAddSection = useCallback((name: string, type: SectionType, mode: SectionMode) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name,
      type,
      mode,
      content: '',
      buttonUrl: type === 'button' ? 'https://' : undefined,
      selectedFields: mode === 'personalized' ? [] : undefined,
      order: currentSections.length,
    }
    const updatedSections = [...currentSections, newSection]
    stepsManager.updateCurrentStepContent(updatedSections, currentSubject)
  }, [currentSections, currentSubject, stepsManager])

  const handleSectionsChange = useCallback((sections: Section[]) => {
    stepsManager.updateCurrentStepContent(sections, currentSubject)
  }, [currentSubject, stepsManager])

  const handleSubjectChange = useCallback((subject: { mode: SectionMode; content: string; selectedFields?: string[] }) => {
    stepsManager.updateCurrentStepContent(currentSections, subject)
  }, [currentSections, stepsManager])


  const handleContinue = useCallback(async () => {
    if (!validation.canContinue) return

    try {
      // Sync all unsaved changes before continuing
      await stepsManager.syncUnsavedChanges()

      onContinue?.({
        sections: currentSections,
        subjectLine: currentSubject,
        emailFormat,
      })
    } catch (error) {
      console.error('Failed to sync changes:', error)
      // Still call onContinue - let the parent handle the error
      onContinue?.({
        sections: currentSections,
        subjectLine: currentSubject,
        emailFormat,
      })
    }
  }, [validation.canContinue, currentSections, currentSubject, emailFormat, onContinue, stepsManager])

  const handleSubjectSave = useCallback((subject: string) => {
    handleSubjectChange({ ...currentSubject, content: subject })
  }, [currentSubject, handleSubjectChange])


  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <EmailEditorToolbar
          selectedTemplate={templateManager.selectedTemplate}
          showTemplateDropdown={templateManager.showDropdown}
          onToggleTemplateDropdown={() => templateManager.setShowDropdown(!templateManager.showDropdown)}
          onSelectTemplate={templateManager.selectTemplate}
          availableTemplates={templateManager.availableTemplates}
          subjectLine={currentSubject}
          onSubjectChange={handleSubjectChange}
          onOpenSubjectModal={() => subjectGenerator.openModal(currentSubject.content)}
          isGeneratingSubject={subjectGenerator.isGenerating}
          canContinue={validation.canContinue}
          continueDisabledReason={validation.continueDisabledReason}
          isContinuing={isContinuing}
          onContinue={handleContinue}
        />
      </div>

      {/* Validation Banner */}
      {validation.validationError && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Missing fields</p>
              <p className="text-sm text-orange-700 mt-1">
                Template uses: <span className="font-mono">{validation.validationError.fields.join(', ')}</span> which are missing.
              </p>
            </div>
            <button onClick={() => {}} className="text-orange-400 hover:text-orange-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <EmailEditorLayout
        sections={currentSections}
        onSectionsChange={handleSectionsChange}
        subjectLine={currentSubject}
        emailFormat={emailFormat}
        onFormatChange={setEmailFormat}
        steps={stepsManager.steps}
        currentStepIndex={stepsManager.currentStepIndex}
        onStepSelect={stepsManager.setCurrentStepIndex}
        onAddStep={stepsManager.addStep}
        onDeleteStep={stepsManager.deleteStepByIndex}
        onDelayChange={(stepIndex, delayDays, delayHours, delayMinutes) => {
          const step = stepsManager.steps[stepIndex]
          if (step?.id) {
            // Update the first edge's delay values while preserving targetStepId
            const currentEdges = step.edges || []
            const updatedEdges = [...currentEdges]
            if (updatedEdges.length > 0) {
              updatedEdges[0] = {
                ...updatedEdges[0],
                delayDays,
                delayHours,
                delayMinutes
              }
            }
            // Update step with new edges - this saves to localStorage automatically
            stepsManager.updateStep(step.id, { edges: updatedEdges })
          }
        }}
        sampleData={sampleData}
        selectedSampleIndex={selectedSampleIndex}
        onSampleIndexChange={setSelectedSampleIndex}
        availableFields={availableFields}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
      />

      {/* Modals */}
      <AddSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSection}
      />

      <SubjectGenerationModal
        isOpen={subjectGenerator.showModal}
        onClose={() => subjectGenerator.setShowModal(false)}
        subjectPrompt={subjectGenerator.subjectPrompt}
        onSubjectPromptChange={subjectGenerator.setSubjectPrompt}
        modalSubject={subjectGenerator.modalSubject}
        onModalSubjectChange={subjectGenerator.setModalSubject}
        isGenerating={subjectGenerator.isGenerating}
        error={subjectGenerator.error}
        onGenerate={subjectGenerator.generateSubject}
        onSave={() => subjectGenerator.saveSubject(handleSubjectSave)}
      />
    </div>
  )
}
