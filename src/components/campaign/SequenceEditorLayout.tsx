'use client'

import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels'
import { GitBranch, Edit, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import CollapsedStrip from './CollapsedStrip'
import SequenceFlowPanel from './SequenceFlowPanel'
import SectionList from '@/components/email-editor/SectionList'
import PreviewPanel from '@/components/email-editor/PreviewPanel'
import EditorHeader from './EditorHeader'
import type { CampaignStep, Section, SectionMode, SampleData } from '@/types/email-editor'

// New Editors
import TriggerEditor from './editors/TriggerEditor'
import SwitchEditor from './editors/SwitchEditor'
import FilterEditor from './editors/FilterEditor'
import { Node } from 'reactflow'

interface SequenceEditorLayoutProps {
  // Content
  sections: Section[]
  onSectionsChange: (sections: Section[]) => void
  subjectLine: { mode: SectionMode; content: string; selectedFields?: string[] }
  emailFormat: 'html' | 'text'
  onFormatChange: (format: 'html' | 'text') => void

  // Steps
  steps: CampaignStep[]
  currentStepIndex: number
  onStepSelect: (index: number) => void
  onAddStep: () => void
  onDeleteStep: (index: number) => void
  onDelayChange: (stepIndex: number, delayDays: number, delayHours: number, delayMinutes: number) => void

  // Preview
  sampleData: SampleData | null
  selectedSampleIndex: number
  onSampleIndexChange: (index: number) => void
  availableFields: string[]
  onAddSection?: () => void

  // Template and Subject (for Editor Header)
  selectedTemplate?: { name: string } | null
  showTemplateDropdown?: boolean
  onToggleTemplateDropdown?: () => void
  onSelectTemplate?: (template: any) => void
  availableTemplates?: any[]
  onOpenSubjectModal?: () => void
  onSubjectChange?: (subject: { mode: SectionMode; content: string; selectedFields?: string[] }) => void
  isGeneratingSubject?: boolean
}

export interface SequenceEditorLayoutRef {
  expandLeftPanel: () => void
  expandMiddlePanel: () => void
  expandRightPanel: () => void
}

const SequenceEditorLayout = forwardRef<SequenceEditorLayoutRef, SequenceEditorLayoutProps>(
  ({
    sections,
    onSectionsChange,
    subjectLine,
    emailFormat,
    onFormatChange,
    steps,
    currentStepIndex,
    onStepSelect,
    onAddStep,
    onDeleteStep,
    onDelayChange,
    sampleData,
    selectedSampleIndex,
    onSampleIndexChange,
    availableFields,
    onAddSection,
    selectedTemplate,
    showTemplateDropdown,
    onToggleTemplateDropdown,
    onSelectTemplate,
    availableTemplates,
    onOpenSubjectModal,
    onSubjectChange,
    isGeneratingSubject,
  }, ref) => {
    const leftPanelRef = useRef<ImperativePanelHandle>(null)
    const middlePanelRef = useRef<ImperativePanelHandle>(null)
    const rightPanelRef = useRef<ImperativePanelHandle>(null)

    const [leftPanelSize, setLeftPanelSize] = useState(20)
    const [middlePanelSize, setMiddlePanelSize] = useState(60)
    const [rightPanelSize, setRightPanelSize] = useState(0)

    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    useImperativeHandle(ref, () => ({
      expandLeftPanel: () => leftPanelRef.current?.expand(),
      expandMiddlePanel: () => middlePanelRef.current?.expand(),
      expandRightPanel: () => rightPanelRef.current?.expand(),
    }))

    const fieldValues = sampleData?.rows?.[selectedSampleIndex] || {}

    const isLeftCollapsed = leftPanelSize <= 3.5
    const isMiddleCollapsed = middlePanelSize <= 3.5
    const isRightCollapsed = rightPanelSize <= 3.5

    const handleNodeChange = (data: any) => {
      if (!selectedNode) return;
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...data } });
      // In real app, we would propagate this change up to a centralized store
    }

    return (
      <div className="h-full flex flex-col bg-gray-100">
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel: React Flow */}
          <Panel
            ref={leftPanelRef}
            collapsible
            collapsedSize={3}
            minSize={3}
            defaultSize={30} // Increased default size for better node visibility
            onResize={(size) => setLeftPanelSize(size)}
            className="bg-white"
          >
            {isLeftCollapsed ? (
              <CollapsedStrip
                icon={GitBranch}
                label="Sequence"
                onExpand={() => leftPanelRef.current?.expand()}
              />
            ) : (
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">Sequence Flow</span>
                  <button
                    onClick={() => leftPanelRef.current?.collapse()}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Collapse panel"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <SequenceFlowPanel
                    steps={steps}
                    currentStepIndex={currentStepIndex}
                    onStepSelect={onStepSelect}
                    onAddStep={onAddStep}
                    onNodeSelect={setSelectedNode}
                  />
                </div>
              </div>
            )}
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors cursor-col-resize" />

          {/* Middle Panel: Content Editor */}
          <Panel
            ref={middlePanelRef}
            collapsible
            collapsedSize={3}
            minSize={3}
            defaultSize={50}
            onResize={(size) => setMiddlePanelSize(size)}
            className="bg-gray-50"
          >
            {isMiddleCollapsed ? (
              <CollapsedStrip
                icon={Edit}
                label="Editor"
                onExpand={() => middlePanelRef.current?.expand()}
              />
            ) : (
              <div className="h-full flex flex-col">
                {/* Conditionally Render Editor based on selectedNode type */}

                {!selectedNode && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                    <GitBranch className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">Select a node to configure</p>
                    <p className="text-sm mt-2">Click on any node in the sequence flow on the left.</p>
                  </div>
                )}

                {selectedNode?.type === 'trigger' && (
                  <TriggerEditor data={selectedNode.data} onChange={handleNodeChange} />
                )}

                {selectedNode?.type === 'switch' && (
                  <SwitchEditor data={selectedNode.data} onChange={handleNodeChange} />
                )}

                {selectedNode?.type === 'filter' && (
                  <FilterEditor data={selectedNode.data} onChange={handleNodeChange} />
                )}

                {/* Default to Email Editor for 'action' nodes or simplified flow for legacy compat */}
                {(selectedNode?.type === 'action' || (!selectedNode && steps.length > 0)) && (
                  <>
                    {/* Editor Header with Template and Subject */}
                    {selectedTemplate !== undefined && onToggleTemplateDropdown && onSelectTemplate && availableTemplates && onOpenSubjectModal && onSubjectChange && (
                      <EditorHeader
                        selectedTemplate={selectedTemplate}
                        showTemplateDropdown={showTemplateDropdown || false}
                        onToggleTemplateDropdown={onToggleTemplateDropdown}
                        onSelectTemplate={onSelectTemplate}
                        availableTemplates={availableTemplates}
                        subjectLine={subjectLine}
                        onSubjectChange={onSubjectChange}
                        onOpenSubjectModal={onOpenSubjectModal}
                        isGeneratingSubject={isGeneratingSubject || false}
                        onCollapse={() => middlePanelRef.current?.collapse()}
                      />
                    )}
                    <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-5">
                      <SectionList
                        sections={sections}
                        onSectionsChange={onSectionsChange}
                        availableFields={availableFields}
                        fieldValues={fieldValues}
                      />
                      <div className="mt-3">
                        <button
                          onClick={onAddSection}
                          className="w-full flex items-center justify-center gap-2 py-4 sm:py-6 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-white transition-colors"
                        >
                          <span className="text-lg">+</span>
                          Add Section
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors cursor-col-resize" />

          {/* Right Panel: Preview (Only show for Email/Action Nodes) */}
          <Panel
            ref={rightPanelRef}
            collapsible
            collapsedSize={3}
            minSize={3}
            defaultSize={0}
            onResize={(size) => setRightPanelSize(size)}
            className="bg-white"
          >
            {isRightCollapsed ? (
              <CollapsedStrip
                icon={Eye}
                label="Preview"
                onExpand={() => rightPanelRef.current?.expand()}
              />
            ) : (
              // Only show email preview if an Action/Email node is selected or default
              (selectedNode?.type === 'action' || !selectedNode) ? (
                <div className="h-full flex flex-col">
                  <PreviewPanel
                    sections={sections}
                    subjectLine={subjectLine}
                    sampleData={sampleData}
                    selectedSampleIndex={selectedSampleIndex}
                    onSampleIndexChange={onSampleIndexChange}
                    emailFormat={emailFormat}
                    onFormatChange={onFormatChange}
                    onCollapse={() => rightPanelRef.current?.collapse()}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <Eye className="w-8 h-8 mb-2 opacity-50" />
                  <p>No preview available</p>
                  <p className="text-xs">Preview is only available for Email Logic</p>
                </div>
              )
            )}
          </Panel>
        </PanelGroup>
      </div>
    )
  }
)

SequenceEditorLayout.displayName = 'SequenceEditorLayout'

export default SequenceEditorLayout
