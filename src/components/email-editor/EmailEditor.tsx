'use client'

import { useState, useCallback } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Plus, ChevronDown, Upload, Users, Pencil, Eye } from 'lucide-react'
import SectionList from './SectionList'
import PreviewPanel from './PreviewPanel'
import AddSectionModal from './AddSectionModal'
import type { Section, SectionMode, SectionType, EmailTemplate, SampleData } from '@/types/email-editor'
import { DEFAULT_TEMPLATES } from '@/types/email-editor'

interface EmailEditorProps {
  initialTemplate?: EmailTemplate
  onSave?: (sections: Section[], subjectLine: { mode: SectionMode; content: string }) => void
}

export default function EmailEditor({ initialTemplate, onSave }: EmailEditorProps) {
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(
    initialTemplate || DEFAULT_TEMPLATES[0]
  )
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)

  // Sections state
  const [sections, setSections] = useState<Section[]>(() => {
    return selectedTemplate.defaultSections.map((section, index) => ({
      ...section,
      order: index,
    }))
  })

  // Subject line state
  const [subjectLine, setSubjectLine] = useState<{ mode: SectionMode; content: string; selectedFields?: string[] }>({
    mode: 'static',
    content: '',
  })

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)

  // Sample data state (from CSV upload)
  const [sampleData, setSampleData] = useState<SampleData | null>(null)
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0)

  // Preview state
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  // Mobile tab state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  // Get available fields from sample data
  const availableFields = sampleData?.columns || []

  // Handle template change
  const handleTemplateChange = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setSections(template.defaultSections.map((section, index) => ({
      ...section,
      order: index,
    })))
    setShowTemplateDropdown(false)
    setPreviewHtml(null)
  }

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
      
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      setSampleData({
        columns: headers,
        rows,
      })
      setSelectedSampleIndex(0)
    }
    reader.readAsText(file)
  }, [])

  // Handle generate preview
  const handleGeneratePreview = async () => {
    setIsGeneratingPreview(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setPreviewHtml(null)
    setIsGeneratingPreview(false)
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
          {/* Row 1: Template & Actions */}
          <div className="flex items-center justify-between gap-2">
            {/* Template Selector */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[100px] sm:max-w-none">{selectedTemplate.name}</span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              </button>

              {showTemplateDropdown && (
                <div className="absolute left-0 mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                  {DEFAULT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template)}
                      className={`w-full px-4 py-2.5 sm:py-3 text-left hover:bg-gray-50 ${
                        template.id === selectedTemplate.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        template.id === selectedTemplate.id ? 'text-blue-600' : 'text-gray-900'
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
            <div className="flex items-center gap-2">
              {/* CSV Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border transition-colors ${
                  sampleData 
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}>
                  {sampleData ? (
                    <>
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">{sampleData.rows.length}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">CSV</span>
                    </>
                  )}
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={() => onSave?.(sections, subjectLine)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* Row 2: Subject Line */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 flex-shrink-0">Subject:</span>
            <input
              type="text"
              value={subjectLine.content}
              onChange={(e) => setSubjectLine({ ...subjectLine, content: e.target.value })}
              placeholder="Enter subject line..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Desktop: Single row layout */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{selectedTemplate.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showTemplateDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                {DEFAULT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                      template.id === selectedTemplate.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      template.id === selectedTemplate.id ? 'text-blue-600' : 'text-gray-900'
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
              placeholder="Enter subject line..."
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
            />
          </div>

          {/* CSV Upload */}
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
              sampleData 
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}>
              {sampleData ? (
                <>
                  <Users className="w-4 h-4" />
                  {sampleData.rows.length} recipients
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </>
              )}
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={() => onSave?.(sections, subjectLine)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Save Draft
          </button>
        </div>
      </div>

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
              onGeneratePreview={handleGeneratePreview}
              isGenerating={isGeneratingPreview}
              previewHtml={previewHtml}
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
                onGeneratePreview={handleGeneratePreview}
                isGenerating={isGeneratingPreview}
                previewHtml={previewHtml}
              />
            </Panel>
          </PanelGroup>
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
