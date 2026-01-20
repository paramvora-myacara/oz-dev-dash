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
  return (
    <div className={`px-4 py-3 bg-purple-50 border-2 rounded-lg shadow-sm min-w-[150px] ${selected ? 'border-purple-500 ring-2 ring-purple-100' : 'border-purple-300'}`}>
      {/* Input for Control Flow (Trigger/Prev Step) */}
      <Handle
        type="target"
        position={Position.Top}
        id="control-in"
        isConnectable={isConnectable}
        className="w-5 h-5 bg-purple-400 border-2 border-white"
        style={{ left: '50%', top: -10 }}
      />

      {/* Input for Data Source */}
      <Handle
        type="target"
        position={Position.Left}
        id="data-in"
        isConnectable={isConnectable}
        className="w-5 h-5 bg-orange-400 !rounded-sm border-2 border-white"
        style={{ top: '50%', left: -10 }}
      />

      <div className="flex flex-col items-center gap-1">
        <GitFork className="w-6 h-6 text-purple-600" />
        <p className="text-sm font-medium text-purple-900">Switch</p>
      </div>

      {/* Dynamic Output Handles would technically be better, but for mock let's have 2 default */}
      <div className="absolute -bottom-3 left-0 w-full flex justify-between px-4">
        <div className="relative">
          <Handle
            type="source"
            position={Position.Bottom}
            id="case-1"
            isConnectable={isConnectable}
            className="w-5 h-5 bg-purple-500 border-2 border-white"
            style={{ position: 'relative', transform: 'none', left: 0, bottom: -6 }}
          />
          <span className="absolute top-5 left-[-10px] text-[10px] text-purple-700 whitespace-nowrap font-medium">Case 1</span>
        </div>
        <div className="relative">
          <Handle
            type="source"
            position={Position.Bottom}
            id="case-2"
            isConnectable={isConnectable}
            className="w-5 h-5 bg-purple-500 border-2 border-white"
            style={{ position: 'relative', transform: 'none', left: 0, bottom: -6 }}
          />
          <span className="absolute top-5 left-[-10px] text-[10px] text-purple-700 whitespace-nowrap font-medium">Default</span>
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
