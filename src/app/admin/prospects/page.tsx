'use client';

import { useState, useEffect, useCallback } from 'react';
import ProspectsTable from '@/components/prospects/ProspectsTable';
import ProspectDetailSheet from '@/components/prospects/ProspectDetailSheet';
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
    const [selectedProspectForSheet, setSelectedProspectForSheet] = useState<Prospect | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedProspectForCall, setSelectedProspectForCall] = useState<Prospect | null>(null);
    const [preselectedPhoneForCall, setPreselectedPhoneForCall] = useState<string | undefined>(undefined);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [stateFilter, setStateFilter] = useState('ALL');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);

    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const fetchProspects = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = new URL('/api/prospects', window.location.origin);
            url.searchParams.set('page', page.toString());
            url.searchParams.set('limit', PAGE_SIZE.toString());

            if (debouncedSearch) url.searchParams.set('search', debouncedSearch);
            if (stateFilter !== 'ALL') url.searchParams.set('state', stateFilter);
            if (statusFilters.length > 0) {
                url.searchParams.set('status', statusFilters.join(','));
            }

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
    }, [page, debouncedSearch, stateFilter, statusFilters]);

    // Handle search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

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
                    setSelectedProspectForSheet(prev => {
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


    const handleOpenSheet = async (prospect: Prospect) => {
        // Locking
        try {
            const res = await fetch(`/api/prospects/${prospect.id}/lock`, {
                method: 'POST',
                body: JSON.stringify({ userName: currentUser })
            });

            if (res.ok) {
                setSelectedProspectForSheet(prospect);
                setIsSheetOpen(true);
            } else if (res.status === 409) {
                alert('This prospect is currently being viewed by someone else.');
            }
        } catch (err) {
            console.error('Failed to acquire lock:', err);
        }
    };

    const handleCloseSheet = async () => {
        if (selectedProspectForSheet) {
            // Unlocking
            try {
                await fetch(`/api/prospects/${selectedProspectForSheet.id}/lock`, {
                    method: 'DELETE',
                    body: JSON.stringify({ userName: currentUser })
                });
            } catch (err) {
                console.error('Failed to release lock:', err);
            }
        }
        setIsSheetOpen(false);
        setSelectedProspectForSheet(null);
    };

    // Cleanup lock on unmount
    useEffect(() => {
        return () => {
            if (selectedProspectForSheet) {
                const id = selectedProspectForSheet.id;
                const user = localStorage.getItem('prospect_current_user');
                if (id && user) {
                    fetch(`/api/prospects/${id}/lock`, {
                        method: 'DELETE',
                        body: JSON.stringify({ userName: user }),
                        keepalive: true
                    }).catch(() => { });
                }
            }
        };
    }, [selectedProspectForSheet]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, stateFilter, statusFilters]);

    const handleLogCall = async (data: {
        outcome: CallStatus;
        phoneUsed: string;
        email?: string;
        extras: { webinar: boolean; consultation: boolean };
        followUpAt?: string;
        lockoutUntil?: string;
    }) => {
        if (!selectedProspectForSheet || !currentUser) return;

        try {
            const res = await fetch(`/api/prospects/${selectedProspectForSheet.id}/call`, {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    callerName: currentUser
                })
            });

            if (!res.ok) throw new Error('Failed to log call');

            const { data: updatedProspect } = await res.json();

            // Update local state immediately for instant feedback
            if (updatedProspect) {
                setProspects(prev => prev.map(p => p.id === updatedProspect.id ? { ...p, ...updatedProspect } : p));

                // If this prospect is currently selected, update it too
                if (selectedProspectForSheet?.id === updatedProspect.id) {
                    setSelectedProspectForSheet({ ...selectedProspectForSheet, ...updatedProspect });
                }
            }

            // Don't close the sheet automatically - let user continue working
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
                onOpenSheet={handleOpenSheet}
                currentUser={currentUser}
                search={search}
                onSearchChange={setSearch}
                stateFilter={stateFilter}
                onStateFilterChange={setStateFilter}
                statusFilters={statusFilters}
                onStatusFiltersChange={setStatusFilters}
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

            {selectedProspectForCall && (
                <CallModal
                    prospect={selectedProspectForCall}
                    isOpen={isCallModalOpen}
                    onClose={() => {
                        setIsCallModalOpen(false);
                        setSelectedProspectForCall(null);
                        setPreselectedPhoneForCall(undefined);
                    }}
                    onLogCall={handleLogCall}
                    preselectedPhone={preselectedPhoneForCall}
                />
            )}

            <ProspectDetailSheet
                prospect={selectedProspectForSheet}
                isOpen={isSheetOpen}
                onClose={handleCloseSheet}
                currentUser={currentUser}
                onLogCall={handleLogCall}
                onOpenCallModal={(prospect, phoneNumber) => {
                    setSelectedProspectForCall(prospect);
                    setPreselectedPhoneForCall(phoneNumber);
                    setIsCallModalOpen(true);
                }}
            />

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
