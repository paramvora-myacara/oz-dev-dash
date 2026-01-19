import React from 'react';
import { GitFork, Plus, Trash2 } from 'lucide-react';

interface SwitchEditorProps {
    data: any;
    onChange: (data: any) => void;
}

export default function SwitchEditor({ data, onChange }: SwitchEditorProps) {
    // Mock condition state
    const conditions = data.conditions || [
        { id: 1, field: 'Role', operator: 'equals', value: 'Investor' }
    ];

    const updateCondition = (idx: number, field: string, val: any) => {
        const newConditions = [...conditions];
        newConditions[idx] = { ...newConditions[idx], [field]: val };
        onChange({ ...data, conditions: newConditions });
    };

    const addCase = () => {
        const newCase = { id: Date.now(), field: 'Role', operator: 'equals', value: '' };
        onChange({ ...data, conditions: [...conditions, newCase] });
    };

    const removeCase = (idx: number) => {
        const newConditions = conditions.filter((_: any, i: number) => i !== idx);
        onChange({ ...data, conditions: newConditions });
    };

    const attributes = ['Role', 'City', 'Signed Up Date', 'Company Size', 'Lead Score'];
    const operators = [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains', label: 'Contains' },
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' },
    ];

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                    <GitFork className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Switch Logic</h2>
                    <p className="text-sm text-gray-500">Route users based on data</p>
                </div>
            </div>

            <div className="space-y-6">
                {conditions.map((condition: any, idx: number) => (
                    <div key={condition.id || idx} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm relative group">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-1 rounded">Case {idx + 1}</span>
                            <button
                                onClick={() => removeCase(idx)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Remove Case"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">If Attribute</label>
                                <select
                                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    value={condition.field}
                                    onChange={(e) => updateCondition(idx, 'field', e.target.value)}
                                >
                                    {attributes.map(attr => <option key={attr} value={attr}>{attr}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <div className="w-1/3">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Operator</label>
                                    <select
                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                        value={condition.operator}
                                        onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                                    >
                                        {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                        placeholder="Value to match..."
                                        value={condition.value}
                                        onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addCase}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center gap-2 text-sm font-medium transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Another Case
                </button>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Default Path</span>
                    <p className="text-sm text-gray-600 mt-1">
                        Any user who doesn't match the above cases will follow the <span className="font-medium text-gray-900">Default</span> output.
                    </p>
                </div>
            </div>

        </div>
    );
}
