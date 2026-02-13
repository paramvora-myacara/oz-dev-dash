/**
 * LinkedIn Tab Component
 * Shows work queue with pending LinkedIn actions
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, Check, AlertCircle } from 'lucide-react';
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
                            <div key={call.id} className="border rounded-lg p-3 bg-blue-50">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleExpanded(call.id)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-green-100">
                                                ✅ Search Complete
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {call.callerName} · {formatTime(call.calledAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1">Found profiles · Select one to connect</p>
                                    </div>
                                    {expandedCalls.has(call.id) ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>

                                {expandedCalls.has(call.id) && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm text-gray-600 mb-3">Select LinkedIn profile:</p>
                                        {/* TODO: Load and display search results */}
                                        <p className="text-sm text-gray-500">Profile selector coming soon...</p>
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
                                        <p className="text-sm font-medium">Search at 6:00 PM (in {getNextBatchTime()})</p>
                                        <p className="text-sm text-gray-600">
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
                                            {call.linkedInStatus === 'connection_pending' && 'Connection scheduled for 6:30 PM'}
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
                        <div key={call.id} className="flex items-start gap-3">
                            <Check className="h-4 w-4 text-green-500 mt-1" />
                            <div>
                                <p className="text-sm font-medium">Connected · {formatTime(call.calledAt)}</p>
                                {call.linkedInUrl && (
                                    <a
                                        href={call.linkedInUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {call.linkedInUrl}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}

                    {failed.map(call => (
                        <div key={call.id} className="flex items-start gap-3">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                            <div>
                                <p className="text-sm font-medium">Failed · {formatTime(call.calledAt)}</p>
                                {call.linkedInError && (
                                    <p className="text-sm text-gray-600">{call.linkedInError}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
