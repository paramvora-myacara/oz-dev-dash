'use client';

import { Clock, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface DelayBadgeProps {
    delayDays: number;
    delayHours: number;
    delayMinutes: number;
    onChange?: (days: number, hours: number, minutes: number) => void;
    editable?: boolean;
    size?: 'sm' | 'md';
}

/**
 * Displays delay between sequence steps with optional inline editing.
 * Shows "Wait X days, Y hours, Z mins" format with a clock icon.
 */
export function DelayBadge({
    delayDays,
    delayHours,
    delayMinutes,
    onChange,
    editable = false,
    size = 'md',
}: DelayBadgeProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [days, setDays] = useState(delayDays);
    const [hours, setHours] = useState(delayHours);
    const [minutes, setMinutes] = useState(delayMinutes);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync local state with props
    useEffect(() => {
        setDays(delayDays);
        setHours(delayHours);
        setMinutes(delayMinutes);
    }, [delayDays, delayHours, delayMinutes]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                handleSave();
            }
        }
        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing]);

    const handleSave = () => {
        onChange?.(days, hours, minutes);
        setIsEditing(false);
    };

    const formatDelay = () => {
        const parts: string[] = [];
        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
        return parts.length ? `Wait ${parts.join(', ')}` : 'Immediately';
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
    };

    const iconSize = size === 'sm' ? 12 : 14;

    if (!editable) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 font-medium ${sizeClasses[size]}`}
            >
                <Clock size={iconSize} className="text-indigo-500" />
                {formatDelay()}
            </span>
        );
    }

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors cursor-pointer ${sizeClasses[size]}`}
            >
                <Clock size={iconSize} className="text-indigo-500" />
                {formatDelay()}
                <ChevronDown size={iconSize} className="text-indigo-500" />
            </button>

            {isEditing && (
                <div className="absolute z-10 mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Days</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={30}
                                    value={days}
                                    onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Hours</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={hours}
                                    onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Mins</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={minutes}
                                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="w-full px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DelayBadge;
