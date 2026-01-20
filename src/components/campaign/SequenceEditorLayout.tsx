'use client'

import { useRef, useState, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react'
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels'
import { GitBranch, Edit, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import CollapsedStrip from './CollapsedStrip'
import SequenceFlowPanel from './SequenceFlowPanel'
import SectionList from '@/components/email-editor/SectionList'
import PreviewPanel from '@/components/email-editor/PreviewPanel'
import AddSectionModal from '@/components/email-editor/AddSectionModal'
import EditorHeader from './EditorHeader'
import type { CampaignStep, Section, SectionMode, SectionType, SampleData } from '@/types/email-editor'

// New Editors
import TriggerEditor from './editors/TriggerEditor'
import SwitchEditor from './editors/SwitchEditor'
import FilterEditor from './editors/FilterEditor'
import EventEditor from './editors/EventEditor'
import DelayEditor from './editors/DelayEditor'
import { Node, Edge, useNodesState, useEdgesState } from 'reactflow'
import { FlowEditorContext } from './FlowEditorContext'

interface SequenceEditorLayoutProps {
  campaignId: string
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

  // Continue Button
  showContinueButton?: boolean
  onContinue?: () => void
  isContinuing?: boolean
  canContinue?: boolean
  campaignType: 'batch' | 'always_on'
  onNodeUpdate?: (nodeId: string, data: any) => void
}

export interface SequenceEditorLayoutRef {
  expandLeftPanel: () => void
  expandMiddlePanel: () => void
  expandRightPanel: () => void
}

const initialNodesBatch: Node[] = [
  {
    id: 'email-1',
    type: 'action',
    position: { x: 250, y: 100 },
    data: { label: 'Initial Blast' },
  },
];

const initialNodesAlwaysOn: Node[] = [
  {
    id: 'event-1',
    type: 'event', // Changed from trigger
    position: { x: 250, y: 50 },
    data: { label: 'User Signup', eventType: 'page_view' },
  },
];

const SequenceEditorLayout = forwardRef<SequenceEditorLayoutRef, SequenceEditorLayoutProps>(
  ({
    campaignId,
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
    showContinueButton,
    onContinue,
    isContinuing,
    canContinue,
    campaignType,
    onNodeUpdate,
  }, ref) => {
    const leftPanelRef = useRef<ImperativePanelHandle>(null)
    const middlePanelRef = useRef<ImperativePanelHandle>(null)
    const rightPanelRef = useRef<ImperativePanelHandle>(null)

    const [leftPanelSize, setLeftPanelSize] = useState(20)
    const [middlePanelSize, setMiddlePanelSize] = useState(60)
    const [rightPanelSize, setRightPanelSize] = useState(0)

    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

    // Local state for independent node editing
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [showLocalTemplateDropdown, setShowLocalTemplateDropdown] = useState(false);

    // Initialize state with default values
    const [nodes, setNodes, onNodesChange] = useNodesState(
      campaignType === 'always_on' ? initialNodesAlwaysOn : initialNodesBatch
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Load from local storage on mount
    useEffect(() => {
      const savedFlow = localStorage.getItem(`campaign-flow-${campaignId}`);
      if (savedFlow) {
        try {
          const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedFlow);
          setNodes(savedNodes || []);
          setEdges(savedEdges || []);
        } catch (e) {
          console.error('Failed to parse saved flow', e);
        }
      }
    }, [campaignId, setNodes, setEdges]);

    // Save to local storage on change
    useEffect(() => {
      if (nodes.length > 0) {
        // Debounce saving slightly or just save on every change
        const flow = { nodes, edges };
        localStorage.setItem(`campaign-flow-${campaignId}`, JSON.stringify(flow));
      }
    }, [nodes, edges, campaignId]);

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

      const updatedNode = { ...selectedNode, data: { ...selectedNode.data, ...data } };
      setSelectedNode(updatedNode);

      // Update the node in the graph state
      setNodes((nds) =>
        nds.map((node) => (node.id === selectedNode.id ? updatedNode : node))
      );

      // Notify parent of update
      if (onNodeUpdate) {
        onNodeUpdate(selectedNode.id, updatedNode.data);
      }
    }

    const handleLocalAddSection = useCallback((name: string, type: SectionType, mode: SectionMode) => {
      if (!selectedNode) return;

      const currentSections = selectedNode.data.sections || [];
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

      handleNodeChange({ sections: [...currentSections, newSection] });
    }, [selectedNode, setNodes]);

    const handleLocalTemplateSelect = (template: any) => {
      if (!selectedNode) return;

      handleNodeChange({
        sections: template.defaultSections || [],
        subject: template.subject || selectedNode.data.subject,
        selectedTemplate: { name: template.name }
      });
      setShowLocalTemplateDropdown(false);
    }

    const handleEdgeChange = (data: any) => {
      if (!selectedEdge) return;

      const updatedEdge = { ...selectedEdge, data: { ...selectedEdge.data, ...data } };
      setSelectedEdge(updatedEdge);

      setEdges((eds) =>
        eds.map((edge) => (edge.id === selectedEdge.id ? updatedEdge : edge))
      );
    }

    const selectEdge = (edgeId: string) => {
      // 1. Update ReactFlow selection state
      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
      setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === edgeId })));

      // 2. Update Context state
      // Find the edge in the CURRENT state (or search in the state we are about to update?)
      // Since sets are async, we search in current `edges`.
      const edge = edges.find((e) => e.id === edgeId);
      if (edge) {
        setSelectedEdge(edge);
        setSelectedNode(null);
      }
    };

    return (
      <FlowEditorContext.Provider value={{
        selectedNode,
        setSelectedNode: (node) => {
          setSelectedNode(node);
          if (node) setSelectedEdge(null);
        },
        selectedEdge,
        setSelectedEdge: (edge) => {
          setSelectedEdge(edge);
          if (edge) setSelectedNode(null);
        },
        selectEdge
      }}>
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
                      campaignType={campaignType}
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      setNodes={setNodes}
                      setEdges={setEdges}
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

                  {!selectedNode && !selectedEdge && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                      <GitBranch className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-medium">Select a node or edge to configure</p>
                      <p className="text-sm mt-2">Click on any node or connection in the sequence flow on the left.</p>
                    </div>
                  )}

                  {selectedNode?.type === 'trigger' && (
                    <TriggerEditor data={selectedNode.data} onChange={handleNodeChange} />
                  )}

                  {selectedNode?.type === 'switch' && (
                    <SwitchEditor
                      data={selectedNode.data}
                      onChange={handleNodeChange}
                      nodeId={selectedNode.id}
                      nodes={nodes}
                      edges={edges}
                    />
                  )}

                  {selectedNode?.type === 'filter' && (
                    <FilterEditor data={selectedNode.data} onChange={handleNodeChange} />
                  )}

                  {selectedNode?.type === 'event' && (
                    <EventEditor data={selectedNode.data} onChange={handleNodeChange} />
                  )}

                  {selectedEdge?.type === 'delay' && (
                    <DelayEditor
                      data={selectedEdge.data}
                      onChange={handleEdgeChange}
                      edgeId={selectedEdge.id}
                    />
                  )}

                  {/* Email Editor for 'action' nodes */}
                  {selectedNode?.type === 'action' && (
                    <>
                      {/* Editor Header with Template and Subject */}
                      <EditorHeader
                        selectedTemplate={selectedNode.data.selectedTemplate || null}
                        showTemplateDropdown={showLocalTemplateDropdown}
                        onToggleTemplateDropdown={() => setShowLocalTemplateDropdown(!showLocalTemplateDropdown)}
                        onSelectTemplate={handleLocalTemplateSelect}
                        availableTemplates={availableTemplates || []}
                        subjectLine={selectedNode.data.subject || { mode: 'static', content: '' }}
                        onSubjectChange={(subject) => handleNodeChange({ subject })}
                        onOpenSubjectModal={onOpenSubjectModal || (() => { })}
                        isGeneratingSubject={isGeneratingSubject || false}
                        onCollapse={() => middlePanelRef.current?.collapse()}

                        showContinueButton={showContinueButton}
                        onContinue={onContinue}
                        isContinuing={isContinuing}
                        canContinue={canContinue}
                      />
                      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-5">
                        <SectionList
                          sections={selectedNode.data.sections || []}
                          onSectionsChange={(newSections) => handleNodeChange({ sections: newSections })}
                          availableFields={availableFields}
                          fieldValues={fieldValues}
                        />
                        <div className="mt-3">
                          <button
                            onClick={() => setShowAddSectionModal(true)}
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
                // Only show email preview if an Action/Email node is selected
                (selectedNode?.type === 'action') ? (
                  <div className="h-full flex flex-col">
                    <PreviewPanel
                      sections={selectedNode.data.sections || []}
                      subjectLine={selectedNode.data.subject || { mode: 'static', content: '' }}
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

          <AddSectionModal
            isOpen={showAddSectionModal}
            onClose={() => setShowAddSectionModal(false)}
            onAdd={handleLocalAddSection}
          />
        </div>
      </FlowEditorContext.Provider>
    )
  }
)

SequenceEditorLayout.displayName = 'SequenceEditorLayout'

export default SequenceEditorLayout
