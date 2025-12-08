'use client'

import { useState, useCallback } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Plus, FileText, ChevronDown, Upload } from 'lucide-react'
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

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
      
      // Parse data rows
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
    
    // Simulate preview generation delay
    // In real implementation, this would call an API to generate AI content
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For now, just set the plain HTML from static sections
    // The PreviewPanel will handle displaying this
    setPreviewHtml(null) // Let PreviewPanel use its built-in rendering
    setIsGeneratingPreview(false)
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{selectedTemplate.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showTemplateDropdown && (
              <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  {DEFAULT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template)}
                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 ${
                        template.id === selectedTemplate.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        template.id === selectedTemplate.id ? 'text-brand-primary' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </div>
                      {template.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CSV Upload */}
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <Upload className="w-4 h-4" />
              {sampleData ? `${sampleData.rows.length} recipients` : 'Upload CSV'}
            </button>
          </div>
        </div>

        {/* Save Button (placeholder) */}
        <button
          onClick={() => onSave?.(sections, subjectLine)}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-dark transition-colors"
        >
          Save Draft
        </button>
      </div>

      {/* Subject Line */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Subject:
          </label>
          <input
            type="text"
            value={subjectLine.content}
            onChange={(e) => setSubjectLine({ ...subjectLine, content: e.target.value })}
            placeholder="Enter subject line... (use {{Name}} for variables)"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Content - Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Edit Panel */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-gray-50">
              {/* Edit Panel Header */}
              <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Content Sections</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              {/* Section List */}
              <div className="flex-1 overflow-auto p-4">
                <SectionList
                  sections={sections}
                  onSectionsChange={setSections}
                  availableFields={availableFields}
                />
              </div>

              {/* Bottom Add Button */}
              {sections.length > 0 && (
                <div className="px-4 py-3 border-t bg-white">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    + Add Section
                  </button>
                </div>
              )}
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-1.5 bg-gray-200 hover:bg-brand-primary transition-colors cursor-col-resize flex items-center justify-center group">
            <div className="w-1 h-8 bg-gray-400 rounded-full group-hover:bg-white transition-colors" />
          </PanelResizeHandle>

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

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSection}
      />
    </div>
  )
}
