'use client';

import { useState, useEffect, useCallback } from 'react';
import ProspectsTable from '@/components/prospects/ProspectsTable';
import ProspectDetailSheet from '@/components/prospects/ProspectDetailSheet';
import CallModal from '@/components/prospects/CallModal';
import AddContactModal from '@/components/prospects/AddContactModal';
import { ProspectPhone, CallStatus, CallHistory } from '@/types/prospect';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mapProspectPhone } from '@/utils/prospect-phone-mapping';
import { createClient } from '@/utils/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

const PAGE_SIZE = 50;

export default function ProspectsPage() {
    const [prospectPhones, setProspectPhones] = useState<ProspectPhone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPhoneForSheet, setSelectedPhoneForSheet] = useState<ProspectPhone | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedPhoneForCall, setSelectedPhoneForCall] = useState<ProspectPhone | null>(null);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [stateFilter, setStateFilter] = useState('ALL');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);

    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [tempSelectedUser, setTempSelectedUser] = useState<string | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [mounted, setMounted] = useState(false);

    const fetchProspectPhones = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = new URL('/api/prospect-phones', window.location.origin);
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
            setProspectPhones(result.data);
            setTotalCount(result.count);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch, stateFilter, statusFilters]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setMounted(true);
        const savedUser = localStorage.getItem('prospect_current_user');
        if (savedUser) {
            setCurrentUser(savedUser);
            setIsPasswordVerified(true);
        }

        const supabase = createClient();

        const channel = supabase
            .channel('prospect-phones-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'prospect_phones' },
                (payload) => {
                    const dbRow = payload.new as any;
                    if (!dbRow) return;

                    const updated = mapProspectPhone(dbRow);

                    const mergeUpdate = (p: ProspectPhone) => {
                        if (p.id !== updated.id) return p;
                        // Preserve joined data (prospect, callHistory) that isn't in the realtime payload
                        return {
                            ...p,
                            ...updated,
                            prospect: p.prospect,
                            callHistory: p.callHistory
                        };
                    };

                    setProspectPhones(prev => prev.map(mergeUpdate));
                    setSelectedPhoneForSheet(prev => prev ? mergeUpdate(prev) : null);
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'prospect_calls' },
                (payload) => {
                    const newCall = payload.new as any;
                    const mappedCall: CallHistory = {
                        id: newCall.id,
                        callerName: newCall.caller_name,
                        outcome: newCall.outcome,
                        phoneUsed: newCall.phone_used,
                        email: newCall.email_captured,
                        calledAt: newCall.called_at,
                        emailStatus: newCall.email_status,
                        emailError: newCall.email_error
                    };

                    const addCallToHistory = (p: ProspectPhone) => {
                        if (p.id !== newCall.prospect_phone_id) return p;
                        // Avoid duplicates if already added via API response
                        if (p.callHistory?.some(c => c.id === mappedCall.id)) return p;

                        const newHistory = [mappedCall, ...(p.callHistory || [])];
                        return { ...p, callHistory: newHistory };
                    };

                    setProspectPhones(prev => prev.map(addCallToHistory));
                    setSelectedPhoneForSheet(prev => prev ? addCallToHistory(prev) : null);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'prospect_calls' },
                (payload) => {
                    const updatedCall = payload.new as any;
                    const status = updatedCall.email_status;
                    const error = updatedCall.email_error;

                    const updateCallInHistory = (p: ProspectPhone) => {
                        if (p.id !== updatedCall.prospect_phone_id) return p;
                        const newHistory = p.callHistory?.map(c =>
                            c.id === updatedCall.id ? { ...c, emailStatus: status, emailError: error } : c
                        );
                        return { ...p, callHistory: newHistory };
                    };

                    setProspectPhones(prev => prev.map(updateCallInHistory));
                    setSelectedPhoneForSheet(prev => prev ? updateCallInHistory(prev) : null);
                }
            )
            .subscribe();

        fetchProspectPhones();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProspectPhones]);

    const handleSelectUser = (user: string) => {
        setTempSelectedUser(user);
        setPasswordInput('');
        setPasswordError(false);
    };

    const handleVerifyPassword = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!tempSelectedUser) return;

        const expectedPassword = tempSelectedUser.toLowerCase();
        if (passwordInput === expectedPassword) {
            setCurrentUser(tempSelectedUser);
            setIsPasswordVerified(true);
            localStorage.setItem('prospect_current_user', tempSelectedUser);
            setTempSelectedUser(null);
            setPasswordInput('');
            setPasswordError(false);
        } else {
            setPasswordError(true);
        }
    };

    const handleOpenSheet = async (phone: ProspectPhone) => {
        try {
            const res = await fetch(`/api/prospect-phones/${phone.id}/lock`, {
                method: 'POST',
                body: JSON.stringify({ userName: currentUser })
            });

            if (res.ok) {
                const { data } = await res.json();
                setSelectedPhoneForSheet(data);
                setIsSheetOpen(true);
            } else if (res.status === 409) {
                alert('This contact is currently being viewed by someone else.');
            }
        } catch (err) {
            console.error('Failed to acquire lock:', err);
        }
    };

    const handleCloseSheet = async () => {
        if (selectedPhoneForSheet) {
            try {
                await fetch(`/api/prospect-phones/${selectedPhoneForSheet.id}/lock`, {
                    method: 'DELETE',
                    body: JSON.stringify({ userName: currentUser })
                });
            } catch (err) {
                console.error('Failed to release lock:', err);
            }
        }
        setIsSheetOpen(false);
        setSelectedPhoneForSheet(null);
    };

    useEffect(() => {
        return () => {
            if (selectedPhoneForSheet) {
                const id = selectedPhoneForSheet.id;
                const user = localStorage.getItem('prospect_current_user');
                if (id && user) {
                    fetch(`/api/prospect-phones/${id}/lock`, {
                        method: 'DELETE',
                        body: JSON.stringify({ userName: user }),
                        keepalive: true
                    }).catch(() => { });
                }
            }
        };
    }, [selectedPhoneForSheet]);

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
        if (!selectedPhoneForSheet || !currentUser) return;

        try {
            const res = await fetch(`/api/prospect-phones/${selectedPhoneForSheet.id}/call`, {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    callerName: currentUser
                })
            });

            if (!res.ok) throw new Error('Failed to log call');

            const { data: updatedPhone } = await res.json();

            if (updatedPhone) {
                setProspectPhones(prev => prev.map(p => p.id === updatedPhone.id ? { ...p, ...updatedPhone } : p));

                if (selectedPhoneForSheet?.id === updatedPhone.id) {
                    setSelectedPhoneForSheet({ ...selectedPhoneForSheet, ...updatedPhone });
                }
            }
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
                        {currentUser && isPasswordVerified ? `Calling as ${currentUser}` : 'Prospecting'}
                        {currentUser && isPasswordVerified && (
                            <Button variant="link" size="sm" className="text-blue-600 h-auto p-0 text-lg font-normal pb-1" onClick={() => {
                                setCurrentUser(null);
                                setIsPasswordVerified(false);
                                localStorage.removeItem('prospect_current_user');
                            }}>(Change)</Button>
                        )}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Call queue for QOZB Developer Outreach ({totalCount} total)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchProspectPhones} variant="outline">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        Add Contact
                    </Button>
                    <ThemeToggle />
                </div>
            </div>

            <ProspectsTable
                prospectPhones={prospectPhones}
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

            {totalPages > 1 && (
                <div className="flex justify-between py-4 border-t">
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

            {selectedPhoneForCall && (
                <CallModal
                    prospectPhone={selectedPhoneForCall}
                    isOpen={isCallModalOpen}
                    onClose={() => {
                        setIsCallModalOpen(false);
                        setSelectedPhoneForCall(null);
                    }}
                    onLogCall={handleLogCall}
                    callerName={currentUser || undefined}
                />
            )}

            <ProspectDetailSheet
                prospectPhone={selectedPhoneForSheet}
                isOpen={isSheetOpen}
                onClose={handleCloseSheet}
                currentUser={currentUser}
                onLogCall={handleLogCall}
                onOpenCallModal={(phone) => {
                    setSelectedPhoneForCall(phone);
                    setIsCallModalOpen(true);
                }}
            />

            <AddContactModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchProspectPhones();
                    setIsAddModalOpen(false);
                }}
                onSelectMatch={handleOpenSheet}
            />

            {mounted && (!currentUser || !isPasswordVerified) && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
                        {!tempSelectedUser ? (
                            <>
                                <div className="space-y-2 text-center">
                                    <h2 className="text-2xl font-bold">Who are you?</h2>
                                    <p className="text-muted-foreground">Select your name to start making calls.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Jeff', 'Todd', 'Michael', 'Param', 'Aryan'].map(name => (
                                        <Button key={name} variant="outline" size="lg" className="h-20 text-xl" onClick={() => handleSelectUser(name)}>
                                            {name}
                                        </Button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="float-left -ml-2 h-8"
                                        onClick={() => setTempSelectedUser(null)}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                                    </Button>
                                    <div className="clear-both pt-2">
                                        <h2 className="text-2xl font-bold">Hello {tempSelectedUser}</h2>
                                        <p className="text-muted-foreground">Please enter your password to continue.</p>
                                    </div>
                                </div>
                                <form onSubmit={handleVerifyPassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <input
                                            type="password"
                                            className={`w-full p-3 bg-background border rounded-md focus:outline-none focus:ring-2 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                                            placeholder="Enter password"
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            autoFocus
                                        />
                                        {passwordError && (
                                            <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full py-6 text-lg">
                                        Verify & Start
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
