'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Plus, ChevronDown, Upload, Pencil, Eye, X, AlertTriangle, ArrowRight, FileText, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import SectionList from './SectionList'
import PreviewPanel from './PreviewPanel'
import AddSectionModal from './AddSectionModal'
import type { Section, SectionMode, SectionType, EmailTemplate, SampleData } from '@/types/email-editor'
import { DEFAULT_TEMPLATES } from '@/types/email-editor'
import { extractTemplateFields, validateTemplateFields } from '@/lib/utils/status-labels'
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface EmailEditorProps {
  campaignId: string;
  campaign?: any;
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

const AUTOSAVE_DELAY = 1500

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
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  // Autosave state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const isInitialMount = useRef(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Subject generation state
  const [generatingSubject, setGeneratingSubject] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [subjectPrompt, setSubjectPrompt] = useState('')
  const [modalSubject, setModalSubject] = useState('')

  // Mark unsaved changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setHasUnsavedChanges(true)
    setSaveStatus('idle')
  }, [sections, subjectLine, emailFormat])

  // Autosave effect
  useEffect(() => {
    if (!hasUnsavedChanges || !onAutoSave) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        const success = await onAutoSave(sections, subjectLine, emailFormat)
        if (success) {
          setSaveStatus('saved')
          setLastSavedAt(new Date())
          setHasUnsavedChanges(false)
          setTimeout(() => {
            setSaveStatus((current) => current === 'saved' ? 'idle' : current)
          }, 2000)
        } else {
          setSaveStatus('error')
        }
      } catch {
        setSaveStatus('error')
      }
    }, AUTOSAVE_DELAY)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [hasUnsavedChanges, sections, subjectLine, emailFormat, onAutoSave])

  useUnsavedChangesWarning(hasUnsavedChanges && saveStatus !== 'saving')

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

  const isReadyToEdit = selectedTemplate !== null && recipientCount > 0

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

  const handleRetrySave = useCallback(async () => {
    if (!onAutoSave) return
    setSaveStatus('saving')
    try {
      const success = await onAutoSave(sections, subjectLine, emailFormat)
      if (success) {
        setSaveStatus('saved')
        setLastSavedAt(new Date())
        setHasUnsavedChanges(false)
        setTimeout(() => {
          setSaveStatus((current) => current === 'saved' ? 'idle' : current)
        }, 2000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
  }, [sections, subjectLine, emailFormat, onAutoSave])

  const handleOpenSubjectModal = useCallback(() => {
    // Seed prompt and subject with sensible defaults
    setSubjectPrompt(prev =>
      prev && prev.trim().length > 0
        ? prev
        : 'Generate a compelling email subject line for this campaign that will get high open rates. Make it professional but attention-grabbing, under 60 characters.'
    )
    setModalSubject(subjectLine.content || '')
    setShowSubjectModal(true)
  }, [subjectLine.content])

  const handleGenerateSubject = useCallback(async () => {
    if (!campaign) return

    setGeneratingSubject(true)
    try {
      const response = await fetch(`/api/campaigns/${campaign.id || campaignId}/generate-subject`, {
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
    setHasUnsavedChanges(false)
    onContinue?.({
      sections,
      subjectLine,
      emailFormat,
    })
  }, [sampleData, subjectLine, sections, emailFormat, onContinue, recipientCount])

  const SaveStatusIndicator = () => {
    if (saveStatus === 'saving') {
      return (
        <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden sm:inline">Saving...</span>
        </div>
      )
    }
    if (saveStatus === 'saved') {
      return (
        <div className="flex items-center gap-1.5 text-green-600 text-xs sm:text-sm">
          <Check className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Saved</span>
        </div>
      )
    }
    if (saveStatus === 'error') {
      return (
        <button
          onClick={handleRetrySave}
          className="flex items-center gap-1.5 text-red-600 text-xs sm:text-sm hover:text-red-700"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Error - tap to retry</span>
          <span className="sm:hidden">Retry</span>
        </button>
      )
    }
    if (lastSavedAt) {
      return (
        <div className="text-gray-400 text-xs hidden sm:block">
          Saved
        </div>
      )
    }
    return null
  }

  const fieldValues = useMemo(() => {
    if (!sampleData || !sampleData.rows.length) return {}
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
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Recipients:</span>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{recipientCount}</span>
            </div>
            <SaveStatusIndicator />
          </div>

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
          {/* Recipient Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{recipientCount} recipients</span>
          </div>

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

          {/* Save Status & Continue */}
          <div className="flex items-center gap-3">
            <SaveStatusIndicator />
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
        <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${isReadyToEdit ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {/* Mobile Tabs */}
          <div className="lg:hidden bg-white border-b flex">
            <button onClick={() => setActiveTab('edit')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'edit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Edit</button>
            <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Preview</button>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Mobile View */}
            <div className="lg:hidden h-full">
              {activeTab === 'edit' ? EditPanelContent : (
                <PreviewPanel
                  sections={sections}
                  subjectLine={subjectLine}
                  sampleData={sampleData}
                  selectedSampleIndex={selectedSampleIndex}
                  onSampleIndexChange={setSelectedSampleIndex}
                  emailFormat={emailFormat}
                  onFormatChange={setEmailFormat}
                />
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block h-full">
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

        {/* Empty State */}
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-50 transition-opacity duration-300 ${!isReadyToEdit ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Select a template to start</h3>
            <p className="text-gray-500 text-sm mt-2">You have {recipientCount} recipients selected.</p>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
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
