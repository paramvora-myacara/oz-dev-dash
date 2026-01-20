import React, { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow';
import { Clock } from 'lucide-react';
import { useFlowEditor } from '../FlowEditorContext';

const DelayEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const { selectEdge } = useFlowEditor();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    selectEdge(id);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: selected ? 2 : 1, stroke: selected ? '#2563eb' : (style.stroke || '#b1b1b7') }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            zIndex: 1000,
          }}
          className="nodrag nopan"
        >
          <button
            className={`flex items-center gap-1 bg-white border rounded-full px-2 py-1 shadow-sm transition-colors ${selected
              ? 'border-blue-500 text-blue-600 ring-2 ring-blue-100'
              : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            onClick={onEdgeClick}
          >
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-medium">
              {data?.delay ? data.delay : '0m'}
            </span>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export const edgeTypes = {
  delay: DelayEdge,
};

