'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Check, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { formatToPT } from '@/lib/date-utils';
import { LinkedInProfileSelector } from '@/components/prospects/LinkedInProfileSelector';

interface LinkedInQueueItem {
    id: string; // prospect_call_id
    created_at: string;
    prospect_phone_id: string;
    caller_name: string;
    linkedin_status: string;
    linkedin_url?: string;
    linkedin_error?: string;
    // Joined data
    prospect_phones: {
        phone_number: string;
        contact_name: string;
        entity_names?: string;
        prospects: {
            property_name: string;
        } | null;
    };
    linkedin_search_results: any[];
}

interface LinkedInQueueProps {
    currentUser: string | null;
}

export default function LinkedInQueue({ currentUser }: LinkedInQueueProps) {
    const [queueItems, setQueueItems] = useState<LinkedInQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const fetchQueue = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = new URL('/api/linkedin/queue', window.location.origin);
            if (currentUser) url.searchParams.set('user', currentUser);

            const res = await fetch(url.toString());
            if (res.ok) {
                const { data } = await res.json();
                setQueueItems(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch queue:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const toggleExpanded = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const handleActionComplete = () => {
        fetchQueue();
    };

    // Group items
    const actionRequired = queueItems.filter(i => i.linkedin_status === 'search_complete');
    const queued = queueItems.filter(i => i.linkedin_status === 'connection_pending');
    const inProgress = queueItems.filter(i => ['searching', 'connecting'].includes(i.linkedin_status));
    const history = queueItems.filter(i => ['invited', 'failed', 'search_failed'].includes(i.linkedin_status));

    const handleRetry = async (callId: string) => {
        try {
            const res = await fetch('/api/linkedin/retry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callId }),
            });

            if (res.ok) {
                // Refresh immediately to show pending status
                fetchQueue();
            } else {
                console.error('Retry failed');
            }
        } catch (error) {
            console.error('Error retrying search:', error);
        }
    };

    const renderItem = (item: LinkedInQueueItem, type: 'action' | 'queued' | 'history') => {
        const contactName = item.prospect_phones.contact_name || 'Unknown Contact';
        const companyName = item.prospect_phones.entity_names?.split(',')[0]?.trim();

        return (
            <div key={item.id} className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-lg">{contactName}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {companyName && <span className="font-medium text-foreground mr-1.5">{companyName} ·</span>}
                            {item.prospect_phones.phone_number} · Logged by {item.caller_name} · {formatToPT(item.created_at)}
                        </p>

                        {/* Status Message */}
                        <div className="mt-2 text-sm">
                            {item.linkedin_status === 'search_complete' && (
                                <span className="text-blue-600 font-medium flex items-center gap-1">
                                    <Search className="w-3 h-3" /> Profiles Found - Select Match
                                </span>
                            )}
                            {item.linkedin_status === 'connection_pending' && (
                                <span className="text-amber-600 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Queued for Daily Batch (6:30 PM)
                                </span>
                            )}
                            {item.linkedin_status === 'invited' && (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Invitation Sent
                                </span>
                            )}
                            {(item.linkedin_status === 'failed' || item.linkedin_status === 'search_failed') && (
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Failed: {item.linkedin_error || 'Unknown error'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 items-end">
                        {type === 'action' && (
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleRetry(item.id)}>
                                    <RefreshCw className="w-3 h-3 mr-1" /> Retry
                                </Button>
                                <Button size="sm" onClick={() => toggleExpanded(item.id)}>
                                    {expandedIds.has(item.id) ? 'Hide Profiles' : 'Review Matches'}
                                </Button>
                            </div>
                        )}

                        {(type === 'history' || item.linkedin_status === 'search_failed') && (
                            <Button size="sm" variant="outline" onClick={() => handleRetry(item.id)}>
                                <RefreshCw className="w-3 h-3 mr-1" /> Retry Search
                            </Button>
                        )}

                        {item.linkedin_url && (
                            <a
                                href={item.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs flex items-center gap-1 text-blue-500 hover:underline"
                            >
                                View Profile <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Expandable Selection Area */}
                {type === 'action' && expandedIds.has(item.id) && (
                    <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-1">
                        <LinkedInProfileSelector
                            callId={item.id}
                            onSelect={handleActionComplete}
                            initialResults={item.linkedin_search_results}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">LinkedIn Automation Queue</h2>
                    <p className="text-muted-foreground">Manage pending connection requests and review search results.</p>
                </div>
                <Button variant="outline" onClick={fetchQueue} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Queue
                </Button>
            </div>

            {/* Action Required */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    🚨 Action Required
                    <Badge variant="secondary" className="ml-2">{actionRequired.length}</Badge>
                </h3>
                {actionRequired.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No pending profile selections. Great job!
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {actionRequired.map(item => renderItem(item, 'action'))}
                    </div>
                )}
            </div>

            {/* Queued / In Progress */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    ⏳ In Queue / Processing
                    <Badge variant="secondary" className="ml-2">{queued.length + inProgress.length}</Badge>
                </h3>
                {(queued.length + inProgress.length) === 0 ? (
                    <div className="text-sm text-muted-foreground italic pl-1">
                        No active automations.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {/* Show in-progress first */}
                        {inProgress.map(item => renderItem(item, 'queued'))}
                        {queued.map(item => renderItem(item, 'queued'))}
                    </div>
                )}
            </div>

            {/* Recent History (Last 10) */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    📜 Recent History
                </h3>
                <div className="grid gap-2 opacity-80">
                    {history.slice(0, 10).map(item => renderItem(item, 'history'))}
                </div>
            </div>
        </div>
    );
}
