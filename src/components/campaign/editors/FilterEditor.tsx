import React from 'react';
import { Filter } from 'lucide-react';

interface FilterEditorProps {
    data: any;
    onChange: (data: any) => void;
}

export default function FilterEditor({ data, onChange }: FilterEditorProps) {
    const attributeSources = [
        'User Profile',
        'Company Details',
        'Activity Logs',
        'External API',
    ];

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                    <Filter className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Data Source</h2>
                    <p className="text-sm text-gray-500">Select attributes to filter by</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attribute Source
                    </label>
                    <select
                        value={data.label}
                        onChange={(e) => onChange({ ...data, label: e.target.value })}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                    >
                        <option value="" disabled>Select a source</option>
                        {attributeSources.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                    Connecting this node to a <strong>Switch</strong> node will make its attributes available for conditions.
                </div>
            </div>
        </div>
    );
}
