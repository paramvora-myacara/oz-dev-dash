import React, { useMemo, useEffect } from 'react';
import { GitFork, Plus, Trash2, Zap, Plug, AlertCircle, RefreshCw } from 'lucide-react';
import { Node, Edge } from 'reactflow';

interface SwitchEditorProps {
    data: any;
    onChange: (data: any) => void;
    nodeId?: string;
    nodes?: Node[];
    edges?: Edge[];
}

// Interfaces for new data structure
interface Rule {
    id: string;
    eventId: string;
    operator: 'has_occurred' | 'has_not_occurred';
}

interface Case {
    id: number;
    logic: 'AND' | 'OR';
    rules: Rule[];
}

export default function SwitchEditor({ data, onChange, nodeId, nodes = [], edges = [] }: SwitchEditorProps) {
    const conditions = data.conditions || [];
    const inputIds = data.inputIds || ['input-1'];

    // Identify connected source nodes
    const connectedEvents = useMemo(() => {
        if (!nodeId) return [];
        const connectedEdges = edges.filter(e => e.target === nodeId);
        const sourceNodeIds = connectedEdges.map(e => e.source);
        return nodes
            .filter(n => sourceNodeIds.includes(n.id) && n.type === 'event')
            .map(n => ({
                id: n.id,
                label: n.data.label || 'Unknown Event',
                eventType: n.data.eventType
            }));
    }, [nodes, edges, nodeId]);

    // Auto-migrate legacy conditions to new structure
    useEffect(() => {
        if (conditions.length > 0 && !conditions[0].rules) {
            console.log("Migrating Switch Node to Combinatorial Logic...");
            const migratedConditions = conditions.map((c: any) => ({
                id: c.id || Date.now(),
                logic: 'AND' as const,
                rules: [{
                    id: `rule-${Date.now()}`,
                    eventId: c.eventId || 'page_view',
                    operator: c.operator || 'has_occurred'
                }]
            }));
            onChange({ ...data, conditions: migratedConditions });
        } else if (conditions.length === 0) {
            // Initialize with one empty case if completely empty
            onChange({
                ...data, conditions: [{
                    id: Date.now(),
                    logic: 'AND',
                    rules: [{ id: `rule-${Date.now()}`, eventId: '', operator: 'has_occurred' }]
                }]
            });
        }
    }, []); // Run once on mount to check migration

    const updateCaseLogic = (caseIdx: number, logic: 'AND' | 'OR') => {
        const newConditions = [...conditions];
        newConditions[caseIdx] = { ...newConditions[caseIdx], logic };
        onChange({ ...data, conditions: newConditions });
    };

    const updateRule = (caseIdx: number, ruleIdx: number, key: string, val: any) => {
        const newConditions = [...conditions];
        const newRules = [...newConditions[caseIdx].rules];
        newRules[ruleIdx] = { ...newRules[ruleIdx], [key]: val };
        newConditions[caseIdx] = { ...newConditions[caseIdx], rules: newRules };
        onChange({ ...data, conditions: newConditions });
    };

    const addRule = (caseIdx: number) => {
        const newConditions = [...conditions];
        // Default to first connected event if available
        const defaultEvent = connectedEvents.length > 0 ? connectedEvents[0].eventType : '';
        const newRule: Rule = {
            id: `rule-${Date.now()}`,
            eventId: defaultEvent,
            operator: 'has_occurred'
        };
        newConditions[caseIdx].rules.push(newRule);
        onChange({ ...data, conditions: newConditions });
    };

    const removeRule = (caseIdx: number, ruleIdx: number) => {
        const newConditions = [...conditions];
        newConditions[caseIdx].rules = newConditions[caseIdx].rules.filter((_: any, i: number) => i !== ruleIdx);
        onChange({ ...data, conditions: newConditions });
    };

    const addCase = () => {
        const defaultEvent = connectedEvents.length > 0 ? connectedEvents[0].eventType : '';
        const newCase: Case = {
            id: Date.now(),
            logic: 'AND',
            rules: [{ id: `rule-${Date.now()}`, eventId: defaultEvent, operator: 'has_occurred' }]
        };
        onChange({ ...data, conditions: [...conditions, newCase] });
    };

    const removeCase = (idx: number) => {
        const newConditions = conditions.filter((_: any, i: number) => i !== idx);
        onChange({ ...data, conditions: newConditions });
    };

    const addInputHandle = () => {
        const newId = `input-${Date.now()}`;
        onChange({ ...data, inputIds: [...inputIds, newId] });
    };

    const removeInputHandle = (idToRemove: string) => {
        if (inputIds.length <= 1) return;
        onChange({ ...data, inputIds: inputIds.filter((id: string) => id !== idToRemove) });
    };

    // Safe access to conditions after migration check
    // If waiting for migration (conditions[0].rules undefined), render nothing or loader to avoid crash
    if (conditions.length > 0 && !conditions[0].rules) {
        return <div className="p-4 text-sm text-gray-500">Upgrading logic structure...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                        <GitFork className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Combinatorial Logic</h2>
                        <p className="text-sm text-gray-500">Route based on multiple events</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[calc(100vh-200px)]">

                {/* Input Connection Management */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Plug className="w-3 h-3" />
                        Data Sources
                    </h3>

                    {connectedEvents.length > 0 ? (
                        <div className="mb-4 space-y-2">
                            <p className="text-xs text-orange-700">Connected Events:</p>
                            {connectedEvents.map(evt => (
                                <div key={evt.id} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-orange-100 text-xs text-gray-700">
                                    <Zap className="w-3 h-3 text-green-500" />
                                    <span className="font-medium">{evt.label}</span>
                                    <span className="text-gray-400">({evt.eventType})</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mb-4 flex items-center gap-2 text-xs text-orange-600 bg-white p-2 rounded border border-orange-100">
                            <AlertCircle className="w-4 h-4" />
                            Connect Event nodes to this Switch node to route based on their data.
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="text-xs text-gray-500 mb-1">Input Connectors</div>
                        {inputIds.map((inputId: string, idx: number) => (
                            <div key={inputId} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                                <span className="font-mono text-gray-600">{`Input ${idx + 1}`}</span>
                                {inputIds.length > 1 && (
                                    <button onClick={() => removeInputHandle(inputId)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addInputHandle}
                            className="w-full py-2 border border-dashed border-orange-300 rounded text-orange-600 text-xs hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Input Socket
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                {/* Cases */}
                {conditions.map((condition: Case, caseIdx: number) => (
                    <div key={condition.id || caseIdx} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm relative group">

                        {/* Case Header */}
                        <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-1 rounded">Case {caseIdx + 1}</span>
                                <div className="flex rounded bg-gray-100 p-0.5">
                                    <button
                                        onClick={() => updateCaseLogic(caseIdx, 'AND')}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${condition.logic === 'AND' ? 'bg-white shadow text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        MATCH ALL
                                    </button>
                                    <button
                                        onClick={() => updateCaseLogic(caseIdx, 'OR')}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${condition.logic === 'OR' ? 'bg-white shadow text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        MATCH ANY
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => removeCase(caseIdx)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Remove Case"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Rules List */}
                        <div className="space-y-2 mb-3">
                            {condition.rules.map((rule, ruleIdx) => (
                                <div key={rule.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                                    {/* Event Selector - Only Connected Events */}
                                    <div className="flex-1">
                                        <select
                                            className="w-full text-xs border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-1"
                                            value={rule.eventId}
                                            onChange={(e) => updateRule(caseIdx, ruleIdx, 'eventId', e.target.value)}
                                        >
                                            <option value="" disabled>Select Event...</option>
                                            {connectedEvents.map(evt => (
                                                <option key={`${rule.id}-${evt.eventType}`} value={evt.eventType}>
                                                    {evt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Operator Selector */}
                                    <div className="w-1/3">
                                        <select
                                            className="w-full text-xs border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-1"
                                            value={rule.operator}
                                            onChange={(e) => updateRule(caseIdx, ruleIdx, 'operator', e.target.value)}
                                        >
                                            <option value="has_occurred">Occurred</option>
                                            <option value="has_not_occurred">Not Occurred</option>
                                        </select>
                                    </div>

                                    {/* Remove Rule Button */}
                                    <button
                                        onClick={() => removeRule(caseIdx, ruleIdx)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        disabled={condition.rules.length === 1} // Prevent removing last rule
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Rule Button */}
                        <button
                            onClick={() => addRule(caseIdx)}
                            className="w-full py-1.5 border border-dashed border-gray-300 rounded text-gray-500 text-xs hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center gap-1 transition-all"
                        >
                            <Plus className="w-3 h-3" /> Add Condition Rule
                        </button>
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
                        Users who don't match any cases will go this way.
                    </p>
                </div>
            </div>
        </div>
    );
}
