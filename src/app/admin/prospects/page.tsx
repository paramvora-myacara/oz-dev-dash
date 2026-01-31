'use client';

import { useState, useEffect, useCallback } from 'react';
import ProspectsTable from '@/components/prospects/ProspectsTable';
import CallModal from '@/components/prospects/CallModal';
import { Prospect, CallStatus } from '@/types/prospect';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mapProspect } from '@/utils/prospect-mapping';
import { createClient } from '@/utils/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

const PAGE_SIZE = 50;

export default function ProspectsPage() {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const fetchProspects = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = new URL('/api/prospects', window.location.origin);
            url.searchParams.set('page', page.toString());
            url.searchParams.set('limit', PAGE_SIZE.toString());

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to fetch');
            const result = await res.json();
            setProspects(result.data);
            setTotalCount(result.count);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    // Restore user and setup Realtime
    useEffect(() => {
        setMounted(true);
        const savedUser = localStorage.getItem('prospect_current_user');
        if (savedUser) setCurrentUser(savedUser);

        const supabase = createClient();

        const channel = supabase
            .channel('prospects-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'prospects' },
                (payload) => {
                    const updatedProspect = mapProspect(payload.new);
                    setProspects(prev => prev.map(p => p.id === updatedProspect.id ? { ...p, ...updatedProspect } : p));

                    // Update selected prospect if it was updated by someone else
                    setSelectedProspect(prev => {
                        if (prev?.id === updatedProspect.id) {
                            return { ...prev, ...updatedProspect };
                        }
                        return prev;
                    });
                }
            )
            .subscribe();

        fetchProspects();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProspects]);

    const handleSelectUser = (user: string) => {
        setCurrentUser(user);
        localStorage.setItem('prospect_current_user', user);
    };

    const handleSelectProspect = (prospect: Prospect) => {
        setSelectedProspect(prospect);
        setIsCallModalOpen(true);
    };

    const handleToggleExpand = async (id: string) => {
        const isCurrentlyExpanded = expandedId === id;

        if (isCurrentlyExpanded) {
            // Unlocking
            setExpandedId(null);
            try {
                await fetch(`/api/prospects/${id}/lock`, {
                    method: 'DELETE',
                    body: JSON.stringify({ userName: currentUser })
                });
            } catch (err) {
                console.error('Failed to release lock:', err);
            }
        } else {
            // Locking
            try {
                const res = await fetch(`/api/prospects/${id}/lock`, {
                    method: 'POST',
                    body: JSON.stringify({ userName: currentUser })
                });

                if (res.ok) {
                    setExpandedId(id);
                } else if (res.status === 409) {
                    alert('This prospect is currently being viewed by someone else.');
                }
            } catch (err) {
                console.error('Failed to acquire lock:', err);
            }
        }
    };

    // Cleanup lock on unmount
    useEffect(() => {
        return () => {
            if (expandedId) {
                const id = expandedId;
                const user = localStorage.getItem('prospect_current_user');
                if (id && user) {
                    // Using navigator.sendBeacon or a sync request in unmount is tricky in modern browsers
                    // but we'll try a standard fetch with keepalive: true
                    fetch(`/api/prospects/${id}/lock`, {
                        method: 'DELETE',
                        body: JSON.stringify({ userName: user }),
                        keepalive: true
                    }).catch(() => { });
                }
            }
        };
    }, [expandedId]);

    const handleLogCall = async (data: {
        outcome: CallStatus;
        phoneUsed: string;
        email?: string;
        extras: { webinar: boolean; consultation: boolean };
        followUpAt?: string;
        lockoutUntil?: string;
    }) => {
        if (!selectedProspect || !currentUser) return;

        try {
            const res = await fetch(`/api/prospects/${selectedProspect.id}/call`, {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    callerName: currentUser
                })
            });

            if (!res.ok) throw new Error('Failed to log call');

            // The Realtime subscription will handle updating the list
            setIsCallModalOpen(false);
            setExpandedId(null); // Row is unlocked on call completion by backend
        } catch (error) {
            console.error('Error logging call:', error);
            alert('Failed to log call. Please try again.');
        }
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-bold tracking-tight flex items-end gap-3">
                        {currentUser ? `Calling as ${currentUser}` : 'Prospecting'}
                        {currentUser && (
                            <Button variant="link" size="sm" className="text-blue-600 h-auto p-0 text-lg font-normal pb-1" onClick={() => {
                                setCurrentUser(null);
                                localStorage.removeItem('prospect_current_user');
                            }}>(Change)</Button>
                        )}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Call queue for QOZB Developer Outreach ({totalCount} total)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchProspects} variant="outline">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <ThemeToggle />
                </div>
            </div>

            <ProspectsTable
                prospects={prospects}
                isLoading={isLoading}
                onSelectProspect={handleSelectProspect}
                expandedId={expandedId}
                onToggleExpand={handleToggleExpand}
                currentUser={currentUser}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <div className="text-sm font-medium">Page {page} of {totalPages}</div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages || isLoading}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {selectedProspect && (
                <CallModal
                    prospect={selectedProspect}
                    isOpen={isCallModalOpen}
                    onClose={() => setIsCallModalOpen(false)}
                    onLogCall={handleLogCall}
                />
            )}

            {/* User Selection Modal */}
            {mounted && !currentUser && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-bold">Who are you?</h2>
                            <p className="text-muted-foreground">Select your name to start making calls.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {['Jeff', 'Todd', 'Michael', 'Param'].map(name => (
                                <Button key={name} variant="outline" size="lg" className="h-20 text-xl" onClick={() => handleSelectUser(name)}>
                                    {name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
