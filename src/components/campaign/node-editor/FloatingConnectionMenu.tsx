import React, { useCallback } from 'react';
import { Mail, GitFork, Zap, Filter } from 'lucide-react';

interface FloatingConnectionMenuProps {
    position: { x: number; y: number } | null;
    onClose: () => void;
    onSelect: (type: string) => void;
}

export default function FloatingConnectionMenu({ position, onClose, onSelect }: FloatingConnectionMenuProps) {
    if (!position) return null;

    return (
        <div
            className="absolute bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
            style={{
                left: position.x,
                top: position.y,
            }}
        >
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase">Add Node</span>
            </div>
            <div className="p-1">
                <button
                    onClick={() => onSelect('action')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors text-left"
                >
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>Email Action</span>
                </button>

                <button
                    onClick={() => onSelect('switch')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors text-left"
                >
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <GitFork className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>Switch / Split</span>
                </button>

                <button
                    onClick={() => onSelect('trigger')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md transition-colors text-left"
                >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-3 h-3 text-green-600" />
                    </div>
                    <span>Trigger</span>
                </button>

                <button
                    onClick={() => onSelect('filter')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md transition-colors text-left"
                >
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Filter className="w-3 h-3 text-orange-600" />
                    </div>
                    <span>Data Filter</span>
                </button>
            </div>
        </div>
    );
}
