'use client'

import { useRef, useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { CampaignStep } from '@/types/email-editor'

interface SequenceFlowPanelProps {
  steps: CampaignStep[]
  currentStepIndex: number
  onStepSelect: (index: number) => void
  onAddStep: () => void
}

// Custom node component for steps
function StepNode({ data }: { data: { label: string; stepIndex: number; isSelected: boolean } }) {
  return (
    <div className={`px-4 py-3 bg-white border-2 rounded-lg shadow-sm min-w-[150px] ${
      data.isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          data.isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {data.stepIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{data.label}</p>
        </div>
      </div>
    </div>
  )
}

// Custom node component for triggers (placeholder)
function TriggerNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-4 py-3 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm min-w-[150px]">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-600 text-white">
          ⚡
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{data.label}</p>
        </div>
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  step: StepNode,
  trigger: TriggerNode,
}

export default function SequenceFlowPanel({
  steps,
  currentStepIndex,
  onStepSelect,
  onAddStep,
}: SequenceFlowPanelProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Compute nodes from steps
  const computedNodes: Node[] = useMemo(() => [
    // Placeholder trigger node
    {
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 100, y: 50 },
      data: { label: 'User Signup' },
    },
    // Step nodes
    ...steps.map((step, index) => ({
      id: step.id || `step-${index}`,
      type: 'step',
      position: { x: 100, y: 150 + index * 120 },
      data: {
        label: step.name || step.subject?.content || `Step ${index + 1}`,
        stepIndex: index,
        isSelected: index === currentStepIndex,
      },
    })),
  ], [steps, currentStepIndex])

  // Compute edges from steps
  const computedEdges: Edge[] = useMemo(() => steps.flatMap((step, index) => {
    if (index === 0) {
      // First step connects from trigger
      return [{
        id: `edge-trigger-${step.id}`,
        source: 'trigger-1',
        target: step.id || `step-${index}`,
        type: 'smoothstep',
        animated: true,
      }]
    } else {
      // Subsequent steps connect from previous step
      const prevStep = steps[index - 1]
      return [{
        id: `edge-${prevStep.id}-${step.id}`,
        source: prevStep.id || `step-${index - 1}`,
        target: step.id || `step-${index}`,
        type: 'smoothstep',
        animated: true,
        label: step.edges?.[0] 
          ? `${step.edges[0].delayDays || 0}d ${step.edges[0].delayHours || 0}h ${step.edges[0].delayMinutes || 0}m`
          : undefined,
      }]
    }
  }), [steps])

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges)

  // Update nodes when steps or currentStepIndex changes
  useEffect(() => {
    setNodes(computedNodes)
  }, [computedNodes, setNodes])

  // Update edges when steps change
  useEffect(() => {
    setEdges(computedEdges)
  }, [computedEdges, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === 'step' && node.data.stepIndex !== undefined) {
        onStepSelect(node.data.stepIndex)
      }
    },
    [onStepSelect]
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* React Flow Canvas */}
      <div ref={reactFlowWrapper} className="flex-1 w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.8, minZoom: 0.2, maxZoom: 2 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      {/* Footer with Add Step button */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onAddStep}
          className="w-full px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Step
        </button>
      </div>
    </div>
  )
}
