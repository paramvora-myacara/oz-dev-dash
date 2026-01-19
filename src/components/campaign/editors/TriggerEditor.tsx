import React from 'react';
import { Zap } from 'lucide-react';

interface TriggerEditorProps {
    data: any;
    onChange: (data: any) => void;
}

export default function TriggerEditor({ data, onChange }: TriggerEditorProps) {
    const triggerTypes = [
        'User Signup',
        'Form Submitted',
        'Tag Added',
        'Custom Event',
    ];

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                    <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Trigger Configuration</h2>
                    <p className="text-sm text-gray-500">What starts this sequence?</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trigger Event
                    </label>
                    <select
                        value={data.label}
                        onChange={(e) => onChange({ ...data, label: e.target.value })}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    >
                        {triggerTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-md">
                    When a user performs this action, they will enter this workflow.
                </div>
            </div>
        </div>
    );
}
