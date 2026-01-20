import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Mail, GitFork, Filter } from 'lucide-react';

const EventNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="px-4 py-3 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm min-w-[150px]">
      <Handle
        type="source"
        position={Position.Bottom}
        id="control-out"
        isConnectable={isConnectable}
        className="w-5 h-5 bg-green-500 border-2 border-white"
        style={{ bottom: -10 }}
      />

      {/* Data output for connecting to Switch nodes */}
      <Handle
        type="source"
        position={Position.Right}
        id="data-out"
        isConnectable={isConnectable}
        className="w-5 h-5 bg-orange-400 !rounded-sm border-2 border-white"
        style={{ right: -10, top: '50%' }}
      />

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
          <Zap className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-green-800 uppercase">Event</p>
          <p className="text-sm font-medium text-gray-900">{data.label}</p>
          {data.eventType && (
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{data.eventType}</p>
          )}
        </div>
      </div>
    </div>
  );
});

const ActionNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-3 bg-white border-2 rounded-lg shadow-sm min-w-[180px] transition-all ${selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-5 h-5 bg-gray-400 border-2 border-white"
        style={{ top: -10 }}
      />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
          <Mail className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
          <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{data.label}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-5 h-5 bg-blue-500 border-2 border-white"
        style={{ bottom: -10 }}
      />
    </div>
  );
});

const SwitchNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  // Ensure we rely on the same default as the editor if data is missing
  const conditions = data.conditions || [{ id: 1 }];
  const inputIds = data.inputIds || ['input-1']; // Default to one input

  return (
    <div className={`px-4 py-3 bg-purple-50 border-2 rounded-lg shadow-sm min-w-[200px] ${selected ? 'border-purple-500 ring-2 ring-purple-100' : 'border-purple-300'}`}>
      {/* Input for Control Flow (Trigger/Prev Step) */}
      <Handle
        type="target"
        position={Position.Top}
        id="control-in"
        isConnectable={isConnectable}
        className="w-5 h-5 bg-purple-400 border-2 border-white"
        style={{ left: '50%', top: -10 }}
      />

      {/* Dynamic Data Inputs */}
      {inputIds.map((inputId: string, index: number) => {
        // Calculate vertical position to spread them out if multiple
        const topPos = inputIds.length === 1 ? '50%' : `${((index + 1) / (inputIds.length + 1)) * 100}%`;

        return (
          <div key={inputId} className="absolute left-0" style={{ top: topPos, transform: 'translate(-50%, -50%)' }}>
            <Handle
              type="target"
              position={Position.Left}
              id={inputId}
              isConnectable={isConnectable}
              className="w-5 h-5 bg-orange-400 !rounded-sm border-2 border-white"
              style={{ position: 'relative', transform: 'none' }}
            />
          </div>
        )
      })}

      <div className="flex flex-col items-center gap-1 mb-4">
        <GitFork className="w-6 h-6 text-purple-600" />
        <p className="text-sm font-medium text-purple-900">Switch</p>

        {/* Helper to show # of inputs */}
        {inputIds.length > 1 && (
          <span className="text-[10px] text-gray-500 bg-purple-100 px-1.5 rounded-full">
            {inputIds.length} Inputs
          </span>
        )}
      </div>

      {/* Dynamic Output Handles */}
      <div className="absolute -bottom-3 left-0 w-full flex justify-between px-4 gap-4">
        {conditions.map((condition: any, index: number) => (
          <div key={condition.id || index} className="relative flex flex-col items-center group">
            <Handle
              type="source"
              position={Position.Bottom}
              id={`case-${condition.id || index + 1}`}
              isConnectable={isConnectable}
              className="w-5 h-5 bg-purple-500 border-2 border-white"
              style={{ position: 'relative', transform: 'none', left: 0, bottom: -6 }}
            />
            <span className="absolute top-5 text-[9px] text-purple-700 whitespace-nowrap font-medium px-1 bg-purple-50 rounded opacity-80 group-hover:opacity-100 transition-opacity">
              Case {index + 1}
            </span>
          </div>
        ))}

        {/* Default Handle */}
        <div className="relative flex flex-col items-center group">
          <Handle
            type="source"
            position={Position.Bottom}
            id="default"
            isConnectable={isConnectable}
            className="w-5 h-5 bg-purple-400 border-2 border-white"
            style={{ position: 'relative', transform: 'none', left: 0, bottom: -6 }}
          />
          <span className="absolute top-5 text-[9px] text-purple-700 whitespace-nowrap font-medium px-1 bg-purple-50 rounded opacity-80 group-hover:opacity-100 transition-opacity">
            Default
          </span>
        </div>
      </div>
    </div>
  );
});

EventNode.displayName = 'EventNode';
ActionNode.displayName = 'ActionNode';
SwitchNode.displayName = 'SwitchNode';

export const nodeTypes = {
  event: EventNode,
  action: ActionNode,
  switch: SwitchNode,
};
