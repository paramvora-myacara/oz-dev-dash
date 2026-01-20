import React from 'react';
import { Zap, Mail, GitFork, Filter } from 'lucide-react';

export default function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white border-b border-gray-200 p-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Node Palette</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <div
          className="flex flex-col items-center justify-center p-2 bg-green-50 border border-green-200 rounded cursor-grab hover:bg-green-100 min-w-[70px]"
          onDragStart={(event) => onDragStart(event, 'event')}
          draggable
        >
          <Zap className="w-5 h-5 text-green-600 mb-1" />
          <span className="text-xs font-medium text-gray-700">Event</span>
        </div>

        <div
          className="flex flex-col items-center justify-center p-2 bg-blue-50 border border-blue-200 rounded cursor-grab hover:bg-blue-100 min-w-[70px]"
          onDragStart={(event) => onDragStart(event, 'action')}
          draggable
        >
          <Mail className="w-5 h-5 text-blue-600 mb-1" />
          <span className="text-xs font-medium text-gray-700">Email</span>
        </div>

        <div
          className="flex flex-col items-center justify-center p-2 bg-purple-50 border border-purple-200 rounded cursor-grab hover:bg-purple-100 min-w-[70px]"
          onDragStart={(event) => onDragStart(event, 'switch')}
          draggable
        >
          <GitFork className="w-5 h-5 text-purple-600 mb-1" />
          <span className="text-xs font-medium text-gray-700">Switch</span>
        </div>
      </div>
    </div>
  );
}
