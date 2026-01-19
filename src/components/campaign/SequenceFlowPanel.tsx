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
  steps: CampaignStep[] // Keep for compat, but we might ignore or map initially
  currentStepIndex: number
  onStepSelect: (index: number) => void // Legacy: mapped to node selection if possible
  onAddStep: () => void // Legacy
  onNodeSelect?: (node: Node | null) => void // New prop for generic node selection
}

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'User Signup' },
  },
  {
    id: 'email-1',
    type: 'action',
    position: { x: 250, y: 200 },
    data: { label: 'Welcome Email' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'trigger-1', target: 'email-1', type: 'delay', data: { delay: '1d' } }
];

function SequenceFlow({
  onNodeSelect,
}: { onNodeSelect?: (node: Node | null) => void }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { project } = useReactFlow();

  // Floating Menu State
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [connectingHandleId, setConnectingHandleId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'delay', data: { delay: '0m' } }, eds)),
    [setEdges]
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
      <SequenceFlow {...props} />
    </ReactFlowProvider>
  );
}
