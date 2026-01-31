'use client';

import { useState, useEffect } from 'react';
import ProspectsTable from '@/components/prospects/ProspectsTable';
import CallModal from '@/components/prospects/CallModal';
import { Prospect, CallStatus } from '@/types/prospect';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';

export default function ProspectsPage() {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);

    const [currentUser, setCurrentUser] = useState<string | null>(null);

    const fetchProspects = async () => {
        setIsLoading(true);
        try {
            // Restore user from local storage
            const savedUser = localStorage.getItem('prospect_current_user');
            if (savedUser) setCurrentUser(savedUser);

            // Check local storage first for persistence during dev
            const saved = localStorage.getItem('prospects_mock_data');
            if (saved) {
                setProspects(JSON.parse(saved));
                setIsLoading(false);
                return;
            }

            const res = await fetch('/api/mock-prospects');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProspects(data);
            localStorage.setItem('prospects_mock_data', JSON.stringify(data));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProspects();
    }, []);

    const handleSelectUser = (user: string) => {
        setCurrentUser(user);
        localStorage.setItem('prospect_current_user', user);
    };

    const handleSelectProspect = (prospect: Prospect) => {
        setSelectedProspect(prospect);
        setIsCallModalOpen(true);
    };

    const handleLogCall = (data: {
        outcome: CallStatus;
        phoneUsed: string;
        email?: string;
        extras: { webinar: boolean; consultation: boolean };
        followUpDate?: string;
        lockoutUntil?: string;
    }) => {
        if (!selectedProspect) return;

        // Optimistic update for UI mock
        const updatedPhoneNumbers = selectedProspect.phoneNumbers.map(p => {
            if (p.number === data.phoneUsed) {
                return {
                    ...p,
                    lastCalledAt: new Date().toISOString(),
                    callCount: (p.callCount || 0) + 1
                };
            }
            return p;
        });

        const newCallEntry = {
            id: Math.random().toString(36).substring(7),
            callerId: currentUser || 'unknown',
            callerName: currentUser || 'Unknown',
            outcome: data.outcome,
            phoneUsed: data.phoneUsed,
            email: data.email,
            calledAt: new Date().toISOString()
        };

        const updatedProspect = {
            ...selectedProspect,
            phoneNumbers: updatedPhoneNumbers,
            callStatus: data.outcome,
            ownerEmail: data.email !== undefined ? data.email : selectedProspect.ownerEmail, // Update email if provided (including empty string)
            lastCalledAt: new Date().toISOString(),
            lastCalledBy: currentUser || 'Unknown',
            lockoutUntil: data.lockoutUntil || selectedProspect.lockoutUntil, // Preserve or update lockout
            followUpDate: data.followUpDate, // Save follow up date if provided
            extras: data.extras, // Save checkboxes (webinar, etc)
            callHistory: [...(selectedProspect.callHistory || []), newCallEntry] // Append to history
        };

        const newProspects = prospects.map(p => p.id === updatedProspect.id ? updatedProspect : p);
        setProspects(newProspects);
        localStorage.setItem('prospects_mock_data', JSON.stringify(newProspects));
        setSelectedProspect(updatedProspect);

        // Close modal
        console.log('Call Logged:', data);
    };

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
                        Call queue for QOZB Developer Outreach
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchProspects} variant="outline">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh List
                    </Button>
                    <ThemeToggle />
                </div>
            </div>

            <ProspectsTable
                prospects={prospects}
                isLoading={isLoading}
                onSelectProspect={handleSelectProspect}

            />

            {selectedProspect && (
                <CallModal
                    prospect={selectedProspect}
                    isOpen={isCallModalOpen}
                    onClose={() => setIsCallModalOpen(false)}
                    onLogCall={handleLogCall}
                />
            )}

            {/* User Selection Modal */}
            {!currentUser && (
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
