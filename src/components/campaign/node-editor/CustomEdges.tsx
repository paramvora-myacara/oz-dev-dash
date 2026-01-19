import React, { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { Clock } from 'lucide-react';

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
}) => {
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
    // In a real app, this would open a delay config
    alert(`Configure Delay for edge ${id}\nCurrent: ${data?.delay || 'None'}`);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="flex items-center gap-1 bg-white border border-gray-300 rounded-full px-2 py-1 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
            onClick={onEdgeClick}
          >
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-medium text-gray-600">
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
