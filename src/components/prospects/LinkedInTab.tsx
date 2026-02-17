/**
 * LinkedIn Tab Component
 * Shows work queue with pending LinkedIn actions
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, Check, AlertCircle } from 'lucide-react';
import { LinkedInProfileSelector } from './LinkedInProfileSelector';
import type { ProspectPhone } from '@/types/prospect';

interface LinkedInSearchResult {
    id: string;
    profile_url: string;
    profile_name: string;
    profile_title?: string;
    profile_company?: string;
    profile_location?: string;
    profile_image_url?: string;
    rank: number;
    selected?: boolean;
}

interface LinkedInTabProps {
    prospectPhone: ProspectPhone;
}

export function LinkedInTab({ prospectPhone }: LinkedInTabProps) {
    const [expandedCalls, setExpandedCalls] = useState<Set<string>>(new Set());

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const onSelectionComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        // Ideally trigger a parent re-fetch here if possible
        // For now, we manually update the expanded state or show a success message?
        // We can't easily update props.prospectPhone without a callback.
        // We'll show a "Success" state in the selector.
    };

    // Filter calls with LinkedIn statuses
    const linkedInCalls = prospectPhone.callHistory?.filter(call =>
        call.linkedInStatus && call.linkedInStatus !== 'null'
    ) || [];

    // Group by status
    const pendingSelection = linkedInCalls.filter(call =>
        call.linkedInStatus === 'search_complete'
    );
    const scheduled = linkedInCalls.filter(call =>
        call.linkedInStatus === 'search_pending'
    );
    const processing = linkedInCalls.filter(call =>
        ['searching', 'connecting', 'connection_pending'].includes(call.linkedInStatus || '')
    );
    const completed = linkedInCalls.filter(call =>
        call.linkedInStatus === 'invited'
    );
    const failed = linkedInCalls.filter(call =>
        ['search_failed', 'failed'].includes(call.linkedInStatus || '')
    );

    const toggleExpanded = (callId: string) => {
        const newExpanded = new Set(expandedCalls);
        if (newExpanded.has(callId)) {
            newExpanded.delete(callId);
        } else {
            newExpanded.add(callId);
        }
        setExpandedCalls(newExpanded);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const getNextBatchTime = () => {
        const now = new Date();
        const searchTime = new Date();
        searchTime.setHours(18, 0, 0, 0);

        if (now > searchTime) {
            searchTime.setDate(searchTime.getDate() + 1);
        }

        const diffMs = searchTime.getTime() - now.getTime();
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);

        return `${hours}h ${mins}m`;
    };

    if (linkedInCalls.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No LinkedIn automation activity yet</p>
                <p className="text-sm mt-2">Log a call to initiate LinkedIn search</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Action Required Section */}
            {pendingSelection.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        🔔 Action Required ({pendingSelection.length})
                    </h3>
                    <div className="space-y-2">
                        {pendingSelection.map(call => (
                            <div key={call.id} className="border rounded-lg p-3 bg-blue-50 transition-all">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleExpanded(call.id)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                ✅ Search Complete
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {call.callerName} · {formatTime(call.calledAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1 font-medium">Found profiles · Select one to connect</p>
                                    </div>
                                    {expandedCalls.has(call.id) ? (
                                        <ChevronUp className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    )}
                                </div>

                                {expandedCalls.has(call.id) && (
                                    <div className="mt-4 pt-4 border-t border-blue-100">
                                        <p className="text-sm text-gray-600 mb-3 font-medium">Select correct LinkedIn profile:</p>
                                        <LinkedInProfileSelector
                                            callId={call.id}
                                            onSelect={onSelectionComplete}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Scheduled Section */}
            {scheduled.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        ⏰ Scheduled for Today
                    </h3>
                    <div className="space-y-2">
                        {scheduled.map(call => (
                            <div key={call.id} className="border rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium">Search Pending</p>
                                        <p className="text-xs text-gray-500">
                                            Waiting for search results... (Usually instantaneous)
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Call by {call.callerName} · {formatTime(call.calledAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Processing Section */}
            {processing.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-3">⏳ In Progress</h3>
                    <div className="space-y-2">
                        {processing.map(call => (
                            <div key={call.id} className="border rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {call.linkedInStatus === 'searching' && 'Searching...'}
                                            {call.linkedInStatus === 'connecting' && 'Sending connection...'}
                                            {call.linkedInStatus === 'connection_pending' && 'Queued for Connection (Daily Limit)'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {call.callerName} · {formatTime(call.calledAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History Section */}
            <div>
                <h3 className="font-semibold mb-3">LinkedIn History</h3>
                <div className="space-y-3">
                    {completed.map(call => (
                        <div key={call.id} className="flex items-start gap-3 bg-gray-50 p-2 rounded">
                            <Check className="h-4 w-4 text-green-500 mt-1" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">Invitation Sent</p>
                                    <span className="text-xs text-gray-500">· {formatTime(call.calledAt)}</span>
                                </div>
                                {call.linkedInUrl && (
                                    <a
                                        href={call.linkedInUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                    >
                                        View Profile ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}

                    {failed.map(call => (
                        <div key={call.id} className="flex items-start gap-3 bg-red-50 p-2 rounded">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-red-900">Failed</p>
                                {call.linkedInError && (
                                    <p className="text-xs text-red-700 mt-1">{call.linkedInError}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatTime(call.calledAt)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {completed.length === 0 && failed.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No history yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}


