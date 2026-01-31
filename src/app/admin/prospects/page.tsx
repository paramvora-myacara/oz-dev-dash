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

    const fetchProspects = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/mock-prospects');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProspects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProspects();
    }, []);

    const handleSelectProspect = (prospect: Prospect) => {
        setSelectedProspect(prospect);
        setIsCallModalOpen(true);
    };

    const handleLogCall = (data: {
        outcome: CallStatus;
        phoneUsed: string;
        notes: string;
        extras: { webinar: boolean; consultation: boolean };
        followUpDate?: string;
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

        const updatedProspect = {
            ...selectedProspect,
            phoneNumbers: updatedPhoneNumbers,
            callStatus: data.outcome,
            callNotes: data.notes,
            lastCalledAt: new Date().toISOString()
        };
        setProspects(prev => prev.map(p => p.id === updatedProspect.id ? updatedProspect : p));
        setSelectedProspect(updatedProspect);

        // Close modal
        console.log('Call Logged:', data);
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Prospecting</h1>
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
        </div>
    );
}
