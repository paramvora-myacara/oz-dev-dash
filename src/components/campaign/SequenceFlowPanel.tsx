'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
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
  EdgeTypes,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  OnConnectStartParams,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { CampaignStep } from '@/types/email-editor'
import { nodeTypes } from './node-editor/CustomNodes'
import { edgeTypes } from './node-editor/CustomEdges'
import NodePalette from './node-editor/NodePalette'
import FloatingConnectionMenu from './node-editor/FloatingConnectionMenu'

interface SequenceFlowPanelProps {
  steps: CampaignStep[]
  currentStepIndex: number
  onStepSelect: (index: number) => void
  onAddStep: () => void
  onNodeSelect?: (node: Node | null) => void
  campaignType: 'batch' | 'always_on' // Added prop
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

function SequenceFlow({
  onNodeSelect,
  campaignType,
}: { onNodeSelect?: (node: Node | null) => void, campaignType: 'batch' | 'always_on' }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Initialize nodes based on campaign type
  const [nodes, setNodes, onNodesChange] = useNodesState(
    campaignType === 'always_on' ? initialNodesAlwaysOn : initialNodesBatch
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();

  // Floating Menu State
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [connectingHandleId, setConnectingHandleId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      // Logic enforcement
      if (campaignType === 'batch') {
        const sourceNode = nodes.find(n => n.id === params.source);
        if (sourceNode?.type === 'event' && params.sourceHandle === 'control-out') {
          alert("Batch campaigns cannot use event triggers for control flow. Events are only for data checking in Switch nodes.");
          return;
        }
      }

      setEdges((eds) => addEdge({ ...params, type: 'delay', data: { delay: '0m' } }, eds));
    },
    [setEdges, campaignType, nodes]
  );

  const onConnectStart = useCallback((_: any, { nodeId, handleId }: OnConnectStartParams) => {
    setConnectingNodeId(nodeId);
    setConnectingHandleId(handleId);
  }, []);

  const onConnectEnd = useCallback(
    (event: any) => {
      if (!connectingNodeId) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane && reactFlowWrapper.current) {
        // Determine position relative to container
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        const clientX = event.clientX || event.changedTouches?.[0]?.clientX;
        const clientY = event.clientY || event.changedTouches?.[0]?.clientY; // Handle touch if needed

        setMenuPosition({
          x: clientX - left,
          y: clientY - top,
        });
      }
    },
    [connectingNodeId]
  );

  const onMenuSelect = useCallback((type: string) => {
    if (!menuPosition || !connectingNodeId) return;

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: project({ x: menuPosition.x, y: menuPosition.y }),
      data: { label: `New ${type}` },
    };

    setNodes((nds) => nds.concat(newNode));

    // Create edge from the starting node to the new node
    const newEdge: Edge = {
      id: `e-${connectingNodeId}-${newNode.id}`,
      source: connectingNodeId,
      sourceHandle: connectingHandleId,
      target: newNode.id,
      type: 'delay', // Default edge type
      data: { delay: '0m' },
    };

    setEdges((eds) => eds.concat(newEdge));
    setMenuPosition(null);
    setConnectingNodeId(null);
    setConnectingHandleId(null);
  }, [menuPosition, connectingNodeId, connectingHandleId, project, setNodes, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowWrapper.current?.getBoundingClientRect();
      if (!position) return;

      const target = project({
        x: event.clientX - position.left,
        y: event.clientY - position.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: target,
        data: { label: `New ${type}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeSelect) onNodeSelect(node);
    setMenuPosition(null);
  }, [onNodeSelect]);

  const onPaneClick = useCallback(() => {
    if (onNodeSelect) onNodeSelect(null);
    setMenuPosition(null);
  }, [onNodeSelect]);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    if (onNodeSelect) onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      <NodePalette />
      <div className="flex-1 w-full h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes as EdgeTypes}
          onInit={(_instance) => console.log('flow loaded')}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodesDelete={onNodesDelete}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap zoomable pannable />
          <FloatingConnectionMenu
            position={menuPosition}
            onClose={() => setMenuPosition(null)}
            onSelect={onMenuSelect}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function SequenceFlowPanel(props: SequenceFlowPanelProps) {
  return (
    <ReactFlowProvider>
      <SequenceFlow {...props} campaignType={props.campaignType} />
    </ReactFlowProvider>
  );
}
