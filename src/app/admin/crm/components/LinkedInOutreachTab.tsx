'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    RefreshCw, Check, AlertCircle, Clock, ExternalLink,
    Pencil, Trash2, RotateCcw, Linkedin, ChevronDown, ChevronUp
} from 'lucide-react';

interface QueueItem {
    id: string;
    person_id: string;
    linkedin_profile_id: string;
    linkedin_url: string;
    person_name: string;
    message: string;
    sender_account: string;
    status: string;
    error: string | null;
    queued_at: string;
    processed_at: string | null;
    people?: {
        display_name?: string;
        tags?: string[];
        person_organizations?: { organizations: { name: string } }[];
    };
}

interface LinkedInOutreachTabProps {
    currentUser: string | null;
}

export function LinkedInOutreachTab({ currentUser }: LinkedInOutreachTabProps) {
    const [items, setItems] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [senderFilter, setSenderFilter] = useState('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMessage, setEditMessage] = useState('');
    const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

    const fetchQueue = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/crm/linkedin-queue');
            if (res.ok) {
                const { data } = await res.json();
                setItems(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch LinkedIn queue:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();

        const supabase = createClient();
        const channel = supabase
            .channel('linkedin_queue_realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'linkedin_outreach_queue',
            }, () => fetchQueue())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchQueue]);

    // Filter by sender client-side so tab counts are always correct
    const filteredItems = senderFilter === 'all'
        ? items
        : items.filter((i) => i.sender_account === senderFilter);

    const queued = filteredItems.filter((i) => i.status === 'queued');
    const processing = filteredItems.filter((i) => i.status === 'processing');
    const sent = filteredItems.filter((i) => i.status === 'sent');
    const failed = filteredItems.filter((i) => i.status === 'failed');

    const senderCounts = items.reduce((acc, item) => {
        acc[item.sender_account] = (acc[item.sender_account] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const handleSaveMessage = async (id: string) => {
        try {
            const res = await fetch(`/api/crm/linkedin-queue/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: editMessage }),
            });
            if (res.ok) {
                setEditingId(null);
                fetchQueue();
            }
        } catch (err) {
            console.error('Failed to update message:', err);
        }
    };

    const handleRetry = async (id: string) => {
        try {
            await fetch(`/api/crm/linkedin-queue/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'queued' }),
            });
            fetchQueue();
        } catch (err) {
            console.error('Failed to retry:', err);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await fetch(`/api/crm/linkedin-queue/${id}`, { method: 'DELETE' });
            fetchQueue();
        } catch (err) {
            console.error('Failed to remove:', err);
        }
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit',
        });
    };

    const renderItem = (item: QueueItem) => {
        const orgName = item.people?.person_organizations?.[0]?.organizations?.name;
        const isEditing = editingId === item.id;

        return (
            <div key={item.id} className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{item.person_name}</h4>
                            {orgName && (
                                <span className="text-sm text-muted-foreground">{orgName}</span>
                            )}
                            <Badge variant="outline" className="text-[10px]">{item.sender_account}</Badge>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                            <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-500 hover:underline truncate max-w-[250px]">
                                {item.linkedin_url.replace('https://www.linkedin.com/in/', '')}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                            <span>{formatTime(item.queued_at)}</span>
                        </div>

                        {/* Status line */}
                        <div className="mt-2 text-sm">
                            {item.status === 'queued' && (
                                <span className="text-amber-600 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Queued — sends at 6:30 PM PT
                                </span>
                            )}
                            {item.status === 'processing' && (
                                <span className="text-blue-600 font-medium flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                                </span>
                            )}
                            {item.status === 'sent' && (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Sent {item.processed_at ? formatTime(item.processed_at) : ''}
                                </span>
                            )}
                            {item.status === 'failed' && (
                                <div className="flex flex-col gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedErrorId((id) => (id === item.id ? null : item.id))}
                                        className="text-red-600 font-medium flex items-center gap-1 text-left hover:underline"
                                    >
                                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate max-w-[200px]" title={item.error || undefined}>
                                            Failed: {(item.error || 'Unknown').slice(0, 60)}
                                            {(item.error?.length ?? 0) > 60 ? '…' : ''}
                                        </span>
                                        {expandedErrorId === item.id ? (
                                            <ChevronUp className="w-3 h-3 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3 flex-shrink-0" />
                                        )}
                                    </button>
                                    {expandedErrorId === item.id && item.error && (
                                        <pre className="mt-2 p-3 text-xs bg-red-50 border border-red-100 rounded-md overflow-auto max-h-40 whitespace-pre-wrap text-red-800 font-mono">
                                            {item.error}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Message (editable for queued items) */}
                        {isEditing ? (
                            <div className="mt-3">
                                <Textarea value={editMessage}
                                    onChange={(e) => setEditMessage(e.target.value)}
                                    rows={4} className="text-sm" />
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={() => handleSaveMessage(item.id)}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 italic">
                                &ldquo;{item.message}&rdquo;
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 ml-4">
                        {item.status === 'queued' && (
                            <>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                                    onClick={() => { setEditingId(item.id); setEditMessage(item.message); }}>
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => handleRemove(item.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </>
                        )}
                        {item.status === 'failed' && (
                            <Button size="sm" variant="outline" onClick={() => handleRetry(item.id)}>
                                <RotateCcw className="w-3 h-3 mr-1" /> Retry
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg">LinkedIn Outreach</h3>
                    <span className="text-xs text-muted-foreground ml-2">Runner: 6:30 PM PT daily</span>
                </div>
                <Button variant="outline" size="sm" onClick={fetchQueue} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Sender filter tabs */}
            <Tabs value={senderFilter} onValueChange={setSenderFilter}>
                <TabsList>
                    <TabsTrigger value="all">All ({items.length})</TabsTrigger>
                    {Object.entries(senderCounts).sort(([a], [b]) => a.localeCompare(b)).map(([sender, count]) => (
                        <TabsTrigger key={sender} value={sender}>
                            {sender} ({count})
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 text-center">
                    <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Queued</div>
                    <div className="text-2xl font-black text-amber-700">{queued.length}</div>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-center">
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Processing</div>
                    <div className="text-2xl font-black text-blue-700">{processing.length}</div>
                </div>
                <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 text-center">
                    <div className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Sent</div>
                    <div className="text-2xl font-black text-green-700">{sent.length}</div>
                </div>
                <div className={`rounded-xl p-4 border text-center ${failed.length > 0 ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${failed.length > 0 ? 'text-red-600' : 'text-slate-400'}`}>Failed</div>
                    <div className={`text-2xl font-black ${failed.length > 0 ? 'text-red-700' : 'text-slate-400'}`}>{failed.length}</div>
                </div>
            </div>

            {/* Queued section */}
            <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    Queued for Tonight
                    <Badge variant="secondary">{queued.length + processing.length}</Badge>
                </h3>
                {(queued.length + processing.length) === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                        No pending outreach. Select people from the People tab to queue them.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {processing.map(renderItem)}
                        {queued.map(renderItem)}
                    </div>
                )}
            </div>

            {/* Sent section */}
            {sent.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        Sent <Badge variant="secondary">{sent.length}</Badge>
                    </h3>
                    <div className="grid gap-2 opacity-80">
                        {sent.slice(0, 20).map(renderItem)}
                    </div>
                </div>
            )}

            {/* Failed section */}
            {failed.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                        Failed <Badge variant="destructive">{failed.length}</Badge>
                    </h3>
                    <div className="grid gap-3">
                        {failed.map(renderItem)}
                    </div>
                </div>
            )}
        </div>
    );
}
