'use client'

import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { AlertTriangle, X, ArrowRight, Loader2 } from 'lucide-react'
import type { Section, SectionMode, SectionType, SampleData, Campaign, CampaignStep } from '@/types/email-editor'
import { useEmailSteps, useSubjectGeneration, useEmailValidation, useTemplateManagement } from '@/components/email-editor/hooks'
import SubjectGenerationModal from '@/components/email-editor/SubjectGenerationModal'
import AddSectionModal from '@/components/email-editor/AddSectionModal'
import SaveTemplateModal from '@/components/email-editor/SaveTemplateModal'
import { EmailEditorContext } from '@/components/email-editor/EmailEditorContext'
import SequenceEditorLayout from './SequenceEditorLayout'

interface SequenceEditorProps {
  campaignId: string
  campaign?: Campaign
  sampleData: SampleData | null
  recipientCount?: number
  onContinue: (data: {
    sections: Section[]
    subjectLine: { mode: SectionMode; content: string }
    emailFormat: 'html' | 'text'
  }) => void
  isContinuing: boolean
  saveButtonText?: string
  skipAutoSync?: boolean
  onSaveStateChange?: (canSave: boolean) => void
  showContinueButton?: boolean
  campaignType?: 'batch' | 'always_on' // Added optional prop, defaults to batch
}

function SequenceEditor({
  campaignId,
  campaign,
  sampleData,
  recipientCount = 0,
  onContinue,
  isContinuing,
  saveButtonText = 'Continue',
  skipAutoSync = false,
  onSaveStateChange,
  showContinueButton,
  campaignType = 'batch', // Default
}: SequenceEditorProps, ref: any) {
  const [emailFormat, setEmailFormat] = useState<'html' | 'text'>('html')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [sectionsToSave, setSectionsToSave] = useState<Section[]>([])
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0)

  // Custom hooks
  const stepsManager = useEmailSteps({
    campaignId
  })

  const subjectGenerator = useSubjectGeneration({
    campaign,
    campaignId
  })

  const validation = useEmailValidation({
    sections: stepsManager.steps[stepsManager.currentStepIndex]?.sections || [],
    subjectLine: stepsManager.steps[stepsManager.currentStepIndex]?.subject || { mode: 'static', content: '' },
    sampleData,
    recipientCount
  })

  // Notify parent of save state changes
  useEffect(() => {
    if (onSaveStateChange) {
      onSaveStateChange(validation.canContinue)
    }
  }, [validation.canContinue, onSaveStateChange])

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

  // Template management for email composition
  const templateManager = useTemplateManagement({
    initialSections: currentSections,
    onSectionsChange: handleSectionsChange
  })

  const layoutRef = useRef<any>(null);

  const handleSaveFlow = useCallback(async () => {
    // 1. Get latest flow state from the layout component
    const nodes = layoutRef.current?.getNodes() || [];
    const edges = layoutRef.current?.getEdges() || [];

    console.log('[DEBUG] Saving flow...', { nodes, edges });

    // 2. Convert Flow Graph to Campaign Steps
    const campaignSteps: any[] = nodes.map((node: any) => {
      // Find all edges starting from this node
      const nodeEdges = edges.filter((e: any) => e.source === node.id);

      const stepEdges = nodeEdges.map((e: any) => ({
        targetStepId: e.target,
        sourceHandle: e.sourceHandle, // Important for Switch nodes
        delayDays: e.data?.delayData?.days || 0,
        delayHours: e.data?.delayData?.hours || 0,
        delayMinutes: e.data?.delayData?.minutes || 0,
        condition: e.data?.condition || null // Preserve conditions if any
      }));

      return {
        id: node.id,
        campaignId,
        type: node.type || 'action',
        name: node.data?.label || 'Untitled Step',
        config: node.type === 'switch' ? { conditions: node.data.conditions } : undefined,
        // Action node specific data
        subject: node.data?.subject || { mode: 'static', content: '' },
        sections: node.data?.sections || [],
        edges: stepEdges
      };
    });

    try {
      // Save all steps (sync changes)
      // First update store with all steps
      // We can't easily bulk update store via 'updateStep' loop effectively if we want to REPLACE the structure.
      // But updateStep modifies the existing step in the store.
      // If we added new nodes, they won't be in the store yet unless we added them via addStep?
      // Actually, layout changes nodes directly.

      // We need to ensure logic in useEmailSteps supports comprehensive update.
      // We will loop through and update.
      await Promise.all(campaignSteps.map(step => stepsManager.updateStep(step.id, step)));

      // Sync to DB
      await stepsManager.syncUnsavedChanges();

      if (!validation.canContinue) {
        if (campaignType === 'batch') return { success: false };
      }

      return {
        success: true,
        data: {
          sections: currentSections,
          subjectLine: currentSubject,
          emailFormat,
          steps: campaignSteps
        }
      };
    } catch (error) {
      console.error('Failed to save flow:', error)
      return { success: false };
    }
  }, [validation.canContinue, campaignId, stepsManager, campaignType, currentSections, currentSubject, emailFormat])

  useImperativeHandle(ref, () => ({
    save: handleSaveFlow
  }));

  const handleSubjectSave = useCallback((subject: string) => {
    handleSubjectChange({ ...currentSubject, content: subject })
  }, [currentSubject, handleSubjectChange])

  // Sync node changes back to the store steps
  const handleNodeUpdate = useCallback((nodeId: string, data: any) => {
    // Only sync for Action/Email nodes content
    if (data.sections || data.subject) {
      stepsManager.updateStep(nodeId, {
        sections: data.sections || [],
        subject: data.subject || { mode: 'static', content: '' },
        // Ensure name exists if creating new
        name: data.label || `Email Step ${nodeId}`
      });
    }
  }, [stepsManager]);

  const handleOpenSaveModal = useCallback((sections: Section[]) => {
    setSectionsToSave(sections)
    setShowSaveTemplateModal(true)
  }, [])

  const handleSaveTemplate = useCallback(async (name: string) => {
    // Save stored sections as template
    await templateManager.saveTemplate(name, sectionsToSave)
    setShowSaveTemplateModal(false)
  }, [sectionsToSave, templateManager])

  return (
    <div className="h-full flex flex-col bg-gray-100">

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
            <button onClick={() => { }} className="text-orange-400 hover:text-orange-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content - 3 Panel Layout */}
      <EmailEditorContext.Provider value={{ campaignName: campaign?.name, campaignId }}>
        <SequenceEditorLayout
          ref={layoutRef}
          campaignId={campaignId}
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
          onAddSection={() => setShowAddModal(true)}
          selectedTemplate={templateManager.selectedTemplate}
          showTemplateDropdown={templateManager.showDropdown}
          onToggleTemplateDropdown={() => templateManager.setShowDropdown(!templateManager.showDropdown)}
          onSelectTemplate={templateManager.selectTemplate}
          availableTemplates={templateManager.availableTemplates}
          onOpenSubjectModal={() => subjectGenerator.openModal(currentSubject.content)}
          onSubjectChange={handleSubjectChange}
          isGeneratingSubject={subjectGenerator.isGenerating}

          showContinueButton={false}
          // onContinue={handleContinue}
          isContinuing={isContinuing}
          canContinue={validation.canContinue}
          campaignType={campaignType}
          onNodeUpdate={handleNodeUpdate}
          onSaveTemplate={handleOpenSaveModal}
        />
      </EmailEditorContext.Provider>

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

      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveTemplate}
      />
    </div>
  )
}
const ForwardedSequenceEditor = forwardRef(SequenceEditor);
export default ForwardedSequenceEditor;
