import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Edge } from 'reactflow';

interface DelayEditorProps {
    data: any;
    onChange: (data: any) => void;
    edgeId: string;
}

export default function DelayEditor({ data, onChange, edgeId }: DelayEditorProps) {
    const [tempDelay, setTempDelay] = useState({
        days: data?.delayData?.days || 0,
        hours: data?.delayData?.hours || 0,
        minutes: data?.delayData?.minutes || 0,
        seconds: data?.delayData?.seconds || 0,
    });

    // Update local state when data changes (e.g. switching edges)
    useEffect(() => {
        setTempDelay({
            days: data?.delayData?.days || 0,
            hours: data?.delayData?.hours || 0,
            minutes: data?.delayData?.minutes || 0,
            seconds: data?.delayData?.seconds || 0,
        });
    }, [edgeId, data]);

    const handleChange = (field: keyof typeof tempDelay, value: string) => {
        const newVal = parseInt(value) || 0;
        const updatedDelay = {
            ...tempDelay,
            [field]: newVal < 0 ? 0 : newVal
        };

        setTempDelay(updatedDelay);

        // Calculate label immediately
        const parts = [];
        if (updatedDelay.days > 0) parts.push(`${updatedDelay.days}d`);
        if (updatedDelay.hours > 0) parts.push(`${updatedDelay.hours}h`);
        if (updatedDelay.minutes > 0) parts.push(`${updatedDelay.minutes}m`);
        if (updatedDelay.seconds > 0) parts.push(`${updatedDelay.seconds}s`);

        const label = parts.length > 0 ? parts.join(' ') : '0m';

        onChange({
            ...data,
            delay: label,
            delayData: updatedDelay,
        });
    };

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                    <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Delay Configuration</h2>
                    <p className="text-sm text-gray-500">Wait time between steps</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Days</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            value={tempDelay.days}
                            onChange={(e) => handleChange('days', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Hours</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            value={tempDelay.hours}
                            onChange={(e) => handleChange('hours', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Minutes</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            value={tempDelay.minutes}
                            onChange={(e) => handleChange('minutes', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Seconds</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            value={tempDelay.seconds}
                            onChange={(e) => handleChange('seconds', e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-md">
                    The workflow will pause here for the specified duration before proceeding to the next step.
                </div>
            </div>
        </div>
    );
}
