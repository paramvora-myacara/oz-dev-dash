'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Plus, ChevronDown, Upload, Pencil, Eye, X, AlertTriangle, ArrowRight, FileText, Check, AlertCircle, Loader2 } from 'lucide-react'
import SectionList from './SectionList'
import PreviewPanel from './PreviewPanel'
import AddSectionModal from './AddSectionModal'
import type { Section, SectionMode, SectionType, EmailTemplate, SampleData } from '@/types/email-editor'
import { DEFAULT_TEMPLATES } from '@/types/email-editor'
import { extractTemplateFields, validateTemplateFields } from '@/lib/utils/status-labels'
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface EmailEditorProps {
  initialTemplate?: EmailTemplate
  initialSections?: Section[]
  initialSubjectLine?: { mode: SectionMode; content: string; selectedFields?: string[] }
  initialEmailFormat?: 'html' | 'text'
  // Autosave callback - should return true on success, false on failure
  onAutoSave?: (sections: Section[], subjectLine: { mode: SectionMode; content: string }, emailFormat: 'html' | 'text') => Promise<boolean>
  // CSV state lifted to parent
  csvFile: File | null
  csvFileName: string | null
  sampleData: SampleData | null
  onCsvUpload: (file: File, fileName: string, sampleData: SampleData) => void
  onCsvRemove: () => void
  onContinue?: (data: {
    sections: Section[]
    subjectLine: { mode: SectionMode; content: string }
    emailFormat: 'html' | 'text'
  }) => void
  isContinuing?: boolean  // Loading state from parent
}

// Debounce delay in milliseconds
const AUTOSAVE_DELAY = 1500

export default function EmailEditor({ 
  initialTemplate, 
  initialSections, 
  initialSubjectLine, 
  initialEmailFormat, 
  onAutoSave,
  csvFile,
  csvFileName,
  sampleData,
  onCsvUpload,
  onCsvRemove,
  onContinue,
  isContinuing = false,
}: EmailEditorProps) {
  // Template selection - null means no template selected yet
  // If we have initial data (template or sections), consider template as selected
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
    // No template selected yet - empty sections
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

  // Sample index for preview (sampleData comes from props)
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

  // Mark as having unsaved changes when content changes (after initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setHasUnsavedChanges(true)
    setSaveStatus('idle')  // Reset saved status when changes are made
  }, [sections, subjectLine, emailFormat])

  // Debounced autosave effect
  useEffect(() => {
    if (!hasUnsavedChanges || !onAutoSave) return

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for autosave
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        const success = await onAutoSave(sections, subjectLine, emailFormat)
        if (success) {
          setSaveStatus('saved')
          setLastSavedAt(new Date())
          setHasUnsavedChanges(false)
          // Reset to idle after showing "Saved" for a bit
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
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [hasUnsavedChanges, sections, subjectLine, emailFormat, onAutoSave])

  // Warn user about unsaved changes when leaving (only if there are actual unsaved changes)
  useUnsavedChangesWarning(hasUnsavedChanges && saveStatus !== 'saving')

  // Get available fields from sample data
  const availableFields = sampleData?.columns || []

  // Check if we can continue (has CSV, subject, and content)
  const canContinue = useMemo(() => {
    const hasCSV = csvFile !== null
    const hasSubject = subjectLine.content.trim().length > 0
    const hasContent = sections.some(s => s.content?.trim().length > 0)
    return hasCSV && hasSubject && hasContent
  }, [csvFile, subjectLine, sections])

  // Get reason why continue is disabled
  const continueDisabledReason = useMemo(() => {
    if (!csvFile) return 'Upload a CSV with recipients'
    if (!subjectLine.content.trim()) return 'Add a subject line'
    if (!sections.some(s => s.content?.trim().length > 0)) return 'Add email content'
    return null
  }, [csvFile, subjectLine, sections])

  // Handle template change (also used for initial template selection)
  const handleTemplateChange = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setSections(template.defaultSections.map((section, index) => ({
      ...section,
      order: index,
    })))
    setShowTemplateDropdown(false)
  }

  // Check if both CSV and template are selected (editor should be shown)
  const isReadyToEdit = selectedTemplate !== null && csvFile !== null

  // Handle adding a new section
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

  // Manual retry save (for error state)
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

  // Handle CSV file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        alert('CSV must have at least a header row and one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
      
      // Check for Email column
      if (!headers.some(h => h.toLowerCase() === 'email')) {
        alert('CSV must have an "Email" column')
        return
      }

      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      // Call parent callback with CSV data
      onCsvUpload(file, file.name, {
        columns: headers,
        rows,
      })
      setSelectedSampleIndex(0)
      setValidationError(null)  // Clear any previous validation errors
    }
    reader.readAsText(file)
    
    // Reset the input so the same file can be selected again
    event.target.value = ''
  }, [onCsvUpload])

  // Handle removing CSV
  const handleRemoveCsv = useCallback(() => {
    onCsvRemove()
    setSelectedSampleIndex(0)
  }, [onCsvRemove])

  // Handle continue to format & sample step
  const handleContinue = useCallback(() => {
    if (!csvFile || !sampleData) return

    // Extract all template fields from subject and sections
    const allFields: string[] = []
    allFields.push(...extractTemplateFields(subjectLine.content))
    sections.forEach(section => {
      if (section.content) {
        allFields.push(...extractTemplateFields(section.content))
      }
    })

    // Validate against CSV columns
    const validation = validateTemplateFields(allFields, sampleData.columns)
    
    if (!validation.valid) {
      setValidationError({ fields: validation.missingFields })
      return
    }

    // Clear any previous errors and proceed
    setValidationError(null)
    setHasUnsavedChanges(false)  // Content will be saved by the parent
    onContinue?.({
      sections,
      subjectLine,
      emailFormat,
    })
  }, [csvFile, sampleData, subjectLine, sections, emailFormat, onContinue])

  // Save status indicator component
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
    
    // Idle state - show last saved time if available
    if (lastSavedAt) {
      return (
        <div className="text-gray-400 text-xs hidden sm:block">
          Saved
        </div>
      )
    }
    
    return null
  }

  // Edit panel content (reusable for both layouts)
  const EditPanelContent = (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-5 bg-gray-50">
        <SectionList
          sections={sections}
          onSectionsChange={setSections}
          availableFields={availableFields}
        />
        
        {/* Add Section Card */}
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
      {/* Top Bar - Responsive */}
      <div className="bg-white border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Mobile: Stacked layout */}
        <div className="flex flex-col gap-3 lg:hidden">
          {/* Row 1: CSV Upload (First - guides user to start here) */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 flex-shrink-0">Recipients:</span>
            {csvFile ? (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex-1">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 truncate">{csvFileName}</span>
                  <span className="text-xs text-green-600 font-medium">({sampleData?.rows.length})</span>
                </div>
                <button
                  onClick={handleRemoveCsv}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove CSV"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative flex-1">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 border-dashed rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload CSV to start
                </button>
              </div>
            )}
          </div>

          {/* Row 2: Template & Actions */}
          <div className="flex items-center justify-between gap-2">
            {/* Template Selector */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[100px] sm:max-w-none">
                  {selectedTemplate ? selectedTemplate.name : 'Select a template'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              </button>

              {showTemplateDropdown && (
                <div className="absolute left-0 mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                  {DEFAULT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template)}
                      className={`w-full px-4 py-2.5 sm:py-3 text-left hover:bg-gray-50 ${
                        selectedTemplate?.id === template.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        selectedTemplate?.id === template.id ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </div>
                      {template.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Save Status Indicator */}
              <SaveStatusIndicator />

              {/* Continue Button */}
              {onContinue && (
                <button
                  onClick={handleContinue}
                  disabled={!canContinue || isContinuing}
                  title={continueDisabledReason || undefined}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors ${
                    canContinue && !isContinuing
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  {isContinuing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Continue</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Row 3: Subject Line */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 flex-shrink-0">Subject:</span>
            <input
              type="text"
              value={subjectLine.content}
              onChange={(e) => setSubjectLine({ ...subjectLine, content: e.target.value })}
              placeholder="Enter subject line (use {{Name}} for personalization)"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Desktop: Multi-row layout */}
        <div className="hidden lg:flex flex-col gap-3">
          {/* Row 1: Recipients CSV (First - guides user to start here) */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Recipients:</span>
            {csvFile ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{csvFileName}</span>
                  <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                    {sampleData?.rows.length} recipients
                  </span>
                </div>
                <button
                  onClick={handleRemoveCsv}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove CSV"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 border-dashed rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload CSV to start
                  </button>
                </div>
                <span className="text-xs text-gray-400">CSV must include an Email column</span>
              </>
            )}
          </div>

          {/* Row 2: Template, Subject, Status, Continue */}
          <div className="flex items-center gap-4">
            {/* Template Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  {selectedTemplate ? selectedTemplate.name : 'Select a template'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showTemplateDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                  {DEFAULT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                        selectedTemplate?.id === template.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        selectedTemplate?.id === template.id ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </div>
                      {template.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Line - Integrated */}
            <div className="flex-1 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Subject:</span>
              <input
                type="text"
                value={subjectLine.content}
                onChange={(e) => setSubjectLine({ ...subjectLine, content: e.target.value })}
                placeholder="Enter subject line (use {{Name}} for personalization)"
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>

            {/* Save Status Indicator */}
            <div className="min-w-[80px] flex justify-end">
              <SaveStatusIndicator />
            </div>

            {/* Continue Button */}
            {onContinue && (
              <button
                onClick={handleContinue}
                disabled={!canContinue || isContinuing}
                title={continueDisabledReason || undefined}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  canContinue && !isContinuing
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
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
            )}
          </div>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                Can't continue — missing CSV fields
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Your email template uses fields not found in your CSV:{' '}
                <span className="font-mono">{validationError.fields.map(f => `{{${f}}}`).join(', ')}</span>
              </p>
              <p className="text-xs text-orange-600 mt-2">
                Either update your CSV to include these columns, or remove these variables from your template.
              </p>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content area with smooth transitions */}
      <div className="flex-1 relative overflow-hidden">
        {/* Editor and preview panels */}
        <div 
          className={`absolute inset-0 flex flex-col transition-opacity duration-500 ease-in-out ${
            isReadyToEdit ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Mobile Tab Bar */}
          <div className="lg:hidden bg-white border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'edit'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>

          {/* Main Content - Responsive */}
          <div className="flex-1 overflow-hidden">
            {/* Mobile: Tab-based view */}
            <div className="lg:hidden h-full">
              {activeTab === 'edit' ? (
                EditPanelContent
              ) : (
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

            {/* Desktop: Resizable Panels */}
            <div className="hidden lg:block h-full">
              <PanelGroup direction="horizontal" className="h-full">
                {/* Edit Panel */}
                <Panel defaultSize={50} minSize={30}>
                  {EditPanelContent}
                </Panel>

                {/* Resize Handle */}
                <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors cursor-col-resize" />

                {/* Preview Panel */}
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

        {/* Empty state when not ready to edit */}
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-gray-50 transition-opacity duration-500 ease-in-out ${
            !isReadyToEdit ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload a list and select a template to start</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Upload your recipient list as a CSV file and choose a template from the options above to begin editing your email campaign.
            </p>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSection}
      />
    </div>
  )
}
