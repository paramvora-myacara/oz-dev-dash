'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Plus, ChevronDown, Upload, Pencil, Eye, X, AlertTriangle, ArrowRight, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import SectionList from './SectionList'
import PreviewPanel from './PreviewPanel'
import AddSectionModal from './AddSectionModal'
import SequenceStepsSidebar from './SequenceStepsSidebar'
import type { Section, SectionMode, SectionType, EmailTemplate, SampleData, Campaign, CampaignStep } from '@/types/email-editor'
import { DEFAULT_TEMPLATES } from '@/types/email-editor'
import { extractTemplateFields, validateTemplateFields } from '@/lib/utils/status-labels'
import { getSteps, createStep, updateStep as updateStepApi, deleteStep as deleteStepApi } from '@/lib/api/campaigns-backend'


interface EmailEditorProps {
  campaignId: string;
  campaign?: Campaign;
  initialTemplate?: EmailTemplate;
  initialSections: Section[];
  initialSubjectLine: { mode: SectionMode; content: string; selectedFields?: string[] };
  initialEmailFormat: 'html' | 'text';
  onAutoSave: (sections: Section[], subjectLine: { mode: SectionMode; content: string }, emailFormat: 'html' | 'text') => Promise<boolean>;
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
  initialSections,
  initialSubjectLine,
  initialEmailFormat,
  onAutoSave,
  sampleData,
  recipientCount = 0,
  onContinue,
  isContinuing,
}: EmailEditorProps) {
  // Template selection
  const hasInitialData = initialTemplate || (initialSections && initialSections.length > 0)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    hasInitialData ? (initialTemplate || DEFAULT_TEMPLATES[0]) : null
  )
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)

  // Email format state
  const [emailFormat, setEmailFormat] = useState<'html' | 'text'>(initialEmailFormat || 'text')

  // Sections state
  const [sections, setSections] = useState<Section[]>(() => {
    if (initialSections && initialSections.length > 0) {
      return initialSections.map((section, index) => ({
        ...section,
        order: index,
      }))
    }
    if (initialTemplate) {
      return initialTemplate.defaultSections.map((section, index) => ({
        ...section,
        order: index,
      }))
    }
    return []
  })

  // Subject line state
  const [subjectLine, setSubjectLine] = useState<{ mode: SectionMode; content: string; selectedFields?: string[] }>(
    initialSubjectLine || {
      mode: 'static',
      content: '',
    }
  )

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)

  // Sample index for preview
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0)

  // Validation error state
  const [validationError, setValidationError] = useState<{ fields: string[] } | null>(null)

  // Mobile tab state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'steps'>('edit')

  // Multi-step sequence state
  const [steps, setSteps] = useState<CampaignStep[]>(() => {
    // Initialize with existing campaign steps or create default step
    // Initialize with existing campaign steps if available
    if (campaign?.steps && campaign.steps.length > 0) {
      return campaign.steps;
    }
    return [];
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);


  // Subject generation state
  const [generatingSubject, setGeneratingSubject] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [subjectPrompt, setSubjectPrompt] = useState(
    campaign?.subjectPrompt ||
    'Generate a highly professional, institutional-quality email subject line for U.S. real estate developers and real estate funds. Assume the recipient is an experienced 50+ year-old developer who does not know what Opportunity Zones are, and we have already accounted for that in how we explain things. The subject should clearly and easily communicate the concrete benefits of using an Opportunity Zone structure for their project, not just a generic marketing statement. Focus on how OZ treatment helps them raise or deploy capital more efficiently, reduce taxes, or improve project economics. Keep it under 60 characters and optimized for opens.'
  )
  const [modalSubject, setModalSubject] = useState('')

  // Load steps on mount
  useEffect(() => {
    const loadSteps = async () => {
      try {
        const fetchedSteps = await getSteps(campaignId);
        if (fetchedSteps && fetchedSteps.length > 0) {
          setSteps(fetchedSteps);
          // Load first step content
          setSections(fetchedSteps[0].sections || []);
          const subject = fetchedSteps[0].subject;
          setSubjectLine(
            subject && subject.mode && subject.content !== undefined
              ? subject
              : { mode: 'static', content: '' }
          );
        }
      } catch (err) {
        console.error('Failed to load steps:', err);
      }
    };
    loadSteps();
  }, [campaignId]);


  const availableFields = sampleData?.columns || []

  // Derived state
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

  const handleTemplateChange = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setSections(template.defaultSections.map((section, index) => ({
      ...section,
      order: index,
    })))
    setShowTemplateDropdown(false)
  }


  const handleAddSection = (name: string, type: SectionType, mode: SectionMode) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name,
      type,
      mode,
      content: '',
      buttonUrl: type === 'button' ? 'https://' : undefined,
      selectedFields: mode === 'personalized' ? [] : undefined,
      order: sections.length,
    }
    setSections([...sections, newSection])
  }

  // Step management handlers
  const handleAddStep = useCallback(async () => {
    const newStepNumber = steps.length + 1;
    const defaultStepData = {
      name: `Follow-up ${newStepNumber - 1}`,
      subject: { mode: 'static' as SectionMode, content: '' },
      sections: [],
      edges: [], // Backend will handle edge management
    };

    try {
      const createdStep = await createStep(campaignId, defaultStepData);

      // Backend automatically updated previous step's edges
      // Refresh all steps to get updated edges
      const updatedSteps = await getSteps(campaignId);
      setSteps(updatedSteps);

      setCurrentStepIndex(steps.length);
      // Reset editor to new step's empty content
      setSections([]);
      setSubjectLine({ mode: 'static', content: '' });
    } catch (err) {
      console.error('Failed to create step:', err);
    }
  }, [steps, campaignId]);

  const handleStepSelect = useCallback(async (index: number) => {
    // Update local steps state with current content
    setSteps(prevSteps => {
      const updatedSteps = [...prevSteps];
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        sections,
        subject: subjectLine,
      };
      return updatedSteps;
    });

    // Switch to selected step
    setCurrentStepIndex(index);
    const targetStep = steps[index];
    setSections(targetStep?.sections || []);
    const subject = targetStep?.subject;
    setSubjectLine(
      subject && subject.mode && subject.content !== undefined
        ? subject
        : { mode: 'static', content: '' }
    );
  }, [currentStepIndex, sections, subjectLine, steps, campaignId]);

  const handleStepDelayChange = useCallback(async (stepIndex: number, delayDays: number, delayHours: number, delayMinutes: number) => {
    const stepToUpdate = steps[stepIndex];
    if (!stepToUpdate) return;

    const updatedEdges = [...(stepToUpdate.edges || [])];
    if (updatedEdges.length > 0) {
      updatedEdges[0] = { ...updatedEdges[0], delayDays, delayHours, delayMinutes };
    } else {
      updatedEdges.push({ targetStepId: '', delayDays, delayHours, delayMinutes, condition: null });
    }

    try {
      setSteps(prevSteps => {
        const updatedSteps = [...prevSteps];
        updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], edges: updatedEdges };
        return updatedSteps;
      });

      await updateStepApi(campaignId, stepToUpdate.id, { edges: updatedEdges });
    } catch (err) {
      console.error('Failed to update step delay:', err);
    }
  }, [steps, campaignId]);

  const handleDeleteStep = useCallback(async (stepId: string) => {
    try {
      await deleteStepApi(campaignId, stepId);

      // Backend automatically updated adjacent edges
      // Refresh all steps to get updated edges
      const updatedSteps = await getSteps(campaignId);
      setSteps(updatedSteps);

      // If we deleted the current step, move to the first one available
      const deletedIndex = steps.findIndex(s => s.id === stepId);
      if (currentStepIndex === deletedIndex) {
        const nextIndex = Math.max(0, deletedIndex - 1);
        setCurrentStepIndex(nextIndex);
        const nextStep = updatedSteps[nextIndex];
        setSections(nextStep?.sections || []);
        const subject = nextStep?.subject;
        setSubjectLine(
          subject && subject.mode && subject.content !== undefined
            ? subject
            : { mode: 'static', content: '' }
        );
      } else if (currentStepIndex > deletedIndex) {
        setCurrentStepIndex(currentStepIndex - 1);
      }
    } catch (err) {
      console.error('Failed to delete step:', err);
    }
  }, [campaignId, currentStepIndex, steps]);

  const handleDeleteStepByIndex = useCallback((index: number) => {
    // Don't allow deleting the last step
    if (steps.length <= 1) {
      return;
    }

    const step = steps[index];
    if (step?.id) {
      handleDeleteStep(step.id);
    }
  }, [steps, handleDeleteStep]);

  const handleManualSave = useCallback(async () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep && !currentStep.id.startsWith('step-')) {
      try {
        await updateStepApi(campaignId, currentStep.id, {
          sections,
          subject: subjectLine,
        });

        // Update local state
        setSteps(prev => {
          const next = [...prev];
          next[currentStepIndex] = { ...next[currentStepIndex], sections, subject: subjectLine };
          return next;
        });

        // Show success feedback
        alert('Step saved successfully!');
      } catch (err) {
        console.error('Failed to save step:', err);
        alert('Failed to save step. Please try again.');
      }
    }
  }, [campaignId, currentStepIndex, sections, subjectLine, steps]);

  const handleOpenSubjectModal = useCallback(() => {
    // Seed prompt and subject with sensible defaults
    setSubjectPrompt(prev =>
      prev && prev.trim().length > 0
        ? prev
        : 'Generate a highly professional, institutional-quality email subject line for U.S. real estate developers and real estate funds. Assume the recipient is an experienced developer who does not know what Opportunity Zones are, and we have to account for that in how we explain things. The subject should clearly and easily communicate the concrete benefits of using an Opportunity Zone structure for their project, not just a generic marketing statement. Focus on how OZ treatment helps them raise or deploy capital more efficiently, reduce taxes, or improve project economics. Keep it under 60 characters and optimized for opens.'
    )
    setModalSubject(subjectLine.content || '')
    setShowSubjectModal(true)
  }, [subjectLine.content])

  const handleGenerateSubject = useCallback(async () => {
    if (!campaign) return

    setGeneratingSubject(true)
    try {
      const response = await fetch(`/api/backend-proxy/campaigns/${campaign.id || campaignId}/generate-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions: subjectPrompt })
      })

      if (!response.ok) throw new Error('Failed to generate subject')

      const data = await response.json()
      // Only update the subject shown in the modal – don't touch the actual subject field yet
      setModalSubject(data.subject || '')
    } catch (error) {
      console.error('Subject generation failed:', error)
      alert('Failed to generate subject line. Please try again.')
    } finally {
      setGeneratingSubject(false)
    }
  }, [campaign, campaignId, subjectPrompt])

  const handleSaveSubject = useCallback(() => {
    // Apply the modal subject to the actual subject line and close
    setSubjectLine({ ...subjectLine, content: modalSubject })
    setShowSubjectModal(false)
  }, [modalSubject, subjectLine])

  const handleContinue = useCallback(() => {
    // Basic validation
    if (recipientCount === 0) return

    // Template field validation if sampleData is available
    if (sampleData) {
      const allFields: string[] = []
      allFields.push(...extractTemplateFields(subjectLine.content))
      sections.forEach(section => {
        if (section.content) {
          allFields.push(...extractTemplateFields(section.content))
        }
      })

      const validation = validateTemplateFields(allFields, sampleData.columns)

      if (!validation.valid) {
        setValidationError({ fields: validation.missingFields })
        return
      }
    }

    setValidationError(null)
    onContinue?.({
      sections,
      subjectLine,
      emailFormat,
    })
  }, [sampleData, subjectLine, sections, emailFormat, onContinue, recipientCount])


  const fieldValues = useMemo(() => {
    if (!sampleData || !sampleData.rows || !sampleData.rows.length) return {}
    return sampleData.rows[selectedSampleIndex] || {}
  }, [sampleData, selectedSampleIndex])

  const EditPanelContent = (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-5 bg-gray-50">
        <SectionList
          sections={sections}
          onSectionsChange={setSections}
          availableFields={availableFields}
          fieldValues={fieldValues}
        />
        <div className="mt-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 py-4 sm:py-6 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Section
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Mobile Stacked */}
        <div className="flex flex-col gap-3 lg:hidden">
          {/* Template & Continue */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              >
                <span className="truncate">{selectedTemplate?.name || 'Select Template'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showTemplateDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  {DEFAULT_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange(t)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!canContinue || isContinuing}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${canContinue && !isContinuing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              {isContinuing ? '...' : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Subject:</span>
              <button
                onClick={handleOpenSubjectModal}
                disabled={generatingSubject}
                title="Generate subject with AI"
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generatingSubject ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </button>
            </div>
            <input
              type="text"
              value={subjectLine.content}
              onChange={(e) => setSubjectLine({ ...subjectLine, content: e.target.value })}
              placeholder="Subject line..."
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        {/* Desktop Row */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{selectedTemplate?.name || 'Select Template'}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showTemplateDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                {DEFAULT_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateChange(t)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subject Line */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Subject:</span>
            <div className="flex-1 relative group">
              <input
                type="text"
                value={subjectLine.content}
                onChange={(e) => setSubjectLine({ ...subjectLine, content: e.target.value })}
                placeholder="Enter subject line..."
                className="w-full pr-28 pl-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleOpenSubjectModal}
                disabled={generatingSubject}
                title="Generate subject with AI"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out overflow-hidden w-8 group-hover:w-28"
              >
                {generatingSubject ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {generatingSubject ? 'Generating...' : 'AI Generate'}
                </span>
              </button>
            </div>
          </div>

          {/* Save & Continue */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSave}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Save Step
            </button>
            <button
              onClick={handleContinue}
              disabled={!canContinue || isContinuing}
              title={continueDisabledReason || undefined}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${canContinue && !isContinuing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isContinuing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Missing fields</p>
              <p className="text-sm text-orange-700 mt-1">
                Template uses: <span className="font-mono">{validationError.fields.join(', ')}</span> which are missing.
              </p>
            </div>
            <button onClick={() => setValidationError(null)} className="text-orange-400 hover:text-orange-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Editor Wrapper */}
        <div className="absolute inset-0 flex flex-col">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-white border-b sticky top-0 z-20">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('steps')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'steps' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Steps
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Preview
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Mobile View */}
            <div className="lg:hidden h-full">
              {activeTab === 'edit' && (
                <div className="h-full overflow-y-auto">
                  {EditPanelContent}
                </div>
              )}
              {activeTab === 'steps' && (
                <div className="h-full overflow-y-auto p-4 bg-gray-50">
                  <SequenceStepsSidebar
                    steps={steps}
                    currentStepIndex={currentStepIndex}
                    onStepSelect={handleStepSelect}
                    onAddStep={handleAddStep}
                    onDeleteStep={handleDeleteStepByIndex}
                    onDelayChange={handleStepDelayChange}
                    isEditable={true}
                  />
                </div>
              )}
              {activeTab === 'preview' && (
                <div className="h-full overflow-y-auto bg-gray-50">
                  <PreviewPanel
                    sections={sections}
                    subjectLine={subjectLine}
                    sampleData={sampleData}
                    selectedSampleIndex={selectedSampleIndex}
                    onSampleIndexChange={setSelectedSampleIndex}
                    emailFormat={emailFormat}
                    onFormatChange={setEmailFormat}
                  />
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:flex h-full">
              {/* Steps Sidebar - only show if multi-step */}
              {steps.length >= 1 && (
                <SequenceStepsSidebar
                  steps={steps}
                  currentStepIndex={currentStepIndex}
                  onStepSelect={handleStepSelect}
                  onAddStep={handleAddStep}
                  onDeleteStep={handleDeleteStepByIndex}
                  onDelayChange={handleStepDelayChange}
                  isEditable={true}
                />
              )}

              {/* Main editor panels */}
              <div className="flex-1">
                <PanelGroup direction="horizontal">
                  <Panel defaultSize={50} minSize={30}>{EditPanelContent}</Panel>
                  <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize" />
                  <Panel defaultSize={50} minSize={30}>
                    <PreviewPanel
                      sections={sections}
                      subjectLine={subjectLine}
                      sampleData={sampleData}
                      selectedSampleIndex={selectedSampleIndex}
                      onSampleIndexChange={setSelectedSampleIndex}
                      emailFormat={emailFormat}
                      onFormatChange={setEmailFormat}
                    />
                  </Panel>
                </PanelGroup>
              </div>
            </div>
          </div>
        </div>

      </div>

      <AddSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSection}
      />

      {/* Subject Generation Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Generate Subject Line</h2>
                  <p className="text-sm text-gray-600">Customize the AI prompt for your subject line</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Current / Generated Subject Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subject Preview
                  </label>
                  <input
                    type="text"
                    value={modalSubject}
                    readOnly
                    placeholder="Generated subject will appear here..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Click &quot;Save&quot; to apply.
                  </p>
                </div>

                {/* Prompt Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Instructions
                  </label>
                  <textarea
                    value={subjectPrompt}
                    onChange={(e) => setSubjectPrompt(e.target.value)}
                    placeholder="Describe what kind of subject line you want..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The AI will have access to your campaign name and email content to generate relevant subject lines.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => setShowSubjectModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateSubject}
                    disabled={generatingSubject || !subjectPrompt.trim()}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                  >
                    {generatingSubject ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Regenerate
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSaveSubject}
                    disabled={!modalSubject.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
