'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Prospect, CallStatus } from '@/types/prospect';
import { Phone, Building, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatToPT, formatDateToPT } from '@/lib/date-utils';

interface ProspectDetailSheetProps {
    prospect: Prospect | null;
    isOpen: boolean;
    onClose: () => void;
    currentUser: string | null;
    onLogCall: (data: {
        outcome: CallStatus;
        phoneUsed: string;
        email?: string;
        extras: { webinar: boolean; consultation: boolean };
        followUpAt?: string;
        lockoutUntil?: string;
    }) => void;
    onOpenCallModal?: (prospect: Prospect) => void;
}

type TabType = 'dialer' | 'research' | 'timeline';

interface GroupedContact {
    number: string;
    roles: string[];
    contactName?: string;
    contactEmail?: string;
    details?: Record<string, string>;
    lastCalledAt?: string;
    callCount?: number;
    lastCalledBy?: string;
}

export default function ProspectDetailSheet({
    prospect,
    isOpen,
    onClose,
    currentUser,
    onLogCall,
    onOpenCallModal,
}: ProspectDetailSheetProps) {
    const [activeTab, setActiveTab] = useState<TabType>('dialer');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset tab when prospect changes
    useEffect(() => {
        if (prospect && isOpen) {
            setActiveTab('dialer');
        }
    }, [prospect?.id, isOpen]);

    // Helper to format status text
    const formatStatusText = (status: string): string => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Deduplicate contacts by grouping phone numbers
    const getGroupedContacts = (): GroupedContact[] => {
        if (!prospect?.phoneNumbers) return [];

        const grouped = new Map<string, GroupedContact>();

        prospect.phoneNumbers.forEach((p) => {
            const key = p.number;
            if (grouped.has(key)) {
                const existing = grouped.get(key)!;
                if (!existing.roles.includes(p.label)) {
                    existing.roles.push(p.label);
                }
                // Merge details if they exist
                if (p.details) {
                    existing.details = { ...existing.details, ...p.details };
                }
                // Use the most recent call info
                if (p.lastCalledAt && (!existing.lastCalledAt || p.lastCalledAt > existing.lastCalledAt)) {
                    existing.lastCalledAt = p.lastCalledAt;
                    existing.callCount = p.callCount;
                }
            } else {
                grouped.set(key, {
                    number: p.number,
                    roles: [p.label],
                    contactName: p.contactName,
                    contactEmail: p.contactEmail,
                    details: p.details,
                    lastCalledAt: p.lastCalledAt,
                    callCount: p.callCount,
                    lastCalledBy: prospect.lastCalledBy,
                });
            }
        });

        return Array.from(grouped.values());
    };


    if (!prospect) return null;

    const groupedContacts = getGroupedContacts();
    const isLocked = mounted && prospect.lockoutUntil && new Date(prospect.lockoutUntil) > new Date();

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {/* Persistent Header */}
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-2xl">{prospect.propertyName}</DialogTitle>
                        <DialogDescription className="text-base">
                            {prospect.address}, {prospect.city}, {prospect.state}
                        </DialogDescription>
                        <div className="flex items-center gap-2 pt-2">
                            <Badge
                                className={cn(
                                    "text-sm px-3 py-1",
                                    ['follow_up', 'pending_signup'].includes(prospect.callStatus) && "bg-amber-100 text-amber-800 border-amber-200",
                                    prospect.callStatus === 'invalid_number' && "bg-destructive text-destructive-foreground"
                                )}
                                variant={
                                    prospect.callStatus === 'new' ? 'outline' :
                                    prospect.callStatus === 'pending_signup' ? 'default' :
                                    prospect.callStatus === 'invalid_number' ? 'destructive' :
                                    ['called', 'answered'].includes(prospect.callStatus) ? 'secondary' :
                                    'outline'
                                }
                            >
                                {isLocked && prospect.lockoutUntil && mounted
                                    ? `Locked until ${formatDateToPT(prospect.lockoutUntil)}`
                                    : prospect.callStatus === 'follow_up' && prospect.followUpAt && mounted
                                        ? `Follow up ${formatDateToPT(prospect.followUpAt)}`
                                        : prospect.callStatus === 'pending_signup'
                                            ? 'Pending Signup'
                                            : formatStatusText(prospect.callStatus)}
                            </Badge>
                            {prospect.viewing_by && (
                                <Badge variant="outline" className="animate-pulse">
                                    Viewing: {prospect.viewing_by === currentUser ? 'You' : prospect.viewing_by}
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Tabs */}
                    <div className="flex border-b mt-4">
                        <button
                            onClick={() => setActiveTab('dialer')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'dialer'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Phone className="h-4 w-4 inline mr-2" />
                            Dialer
                        </button>
                        <button
                            onClick={() => setActiveTab('research')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'research'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Building className="h-4 w-4 inline mr-2" />
                            Research
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'timeline'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <History className="h-4 w-4 inline mr-2" />
                            Timeline
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        {/* Dialer Tab */}
                        {activeTab === 'dialer' && (
                            <div className="space-y-6">
                                {/* Contact Cards */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Contacts</h3>
                                    <div className="space-y-3">
                                        {groupedContacts.map((contact, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-muted/30 p-4 rounded-lg border space-y-2"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {contact.roles.map((role) => (
                                                                <Badge
                                                                    key={role}
                                                                    variant="outline"
                                                                    className="text-xs uppercase"
                                                                >
                                                                    {role}
                                                                </Badge>
                                                            ))}
                                                            <span className="font-mono font-semibold text-lg">
                                                                {contact.number}
                                                            </span>
                                                        </div>
                                                        {contact.contactName && (
                                                            <div className="text-sm font-medium text-foreground">
                                                                {contact.contactName}
                                                            </div>
                                                        )}
                                                        {contact.contactEmail && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {contact.contactEmail}
                                                            </div>
                                                        )}
                                                        {contact.details && Object.entries(contact.details).map(([k, v]) => {
                                                            if (!v || v.trim() === '') return null;
                                                            return (
                                                                <div key={k} className="text-xs text-muted-foreground mt-1">
                                                                    <span className="uppercase tracking-wider opacity-70">{k}:</span> {v}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        {contact.lastCalledAt && (
                                                            <div className="text-xs text-muted-foreground text-right">
                                                                <div>Called {contact.callCount}x</div>
                                                                <div className="mt-1">
                                                                    Last: {mounted ? formatToPT(contact.lastCalledAt) : ''}
                                                                    {contact.lastCalledBy && ` by ${contact.lastCalledBy}`}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <Button
                                                            size="lg"
                                                            onClick={() => {
                                                                if (onOpenCallModal && prospect) {
                                                                    onOpenCallModal(prospect);
                                                                }
                                                            }}
                                                            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-base font-semibold px-6 py-3"
                                                        >
                                                            <Phone className="h-5 w-5 mr-2" />
                                                            Log Call
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Research Tab */}
                        {activeTab === 'research' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Project Details</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                    {(() => {
                                        const allowedFields = [
                                            'Property Name',
                                            'Market',
                                            'Address',
                                            'City',
                                            'State',
                                            'Completion Date',
                                            'Impr. Rating',
                                            'Loc. Rating',
                                            'Owner Website',
                                            'Manager Website'
                                        ];

                                        const fieldLabels: Record<string, string> = {
                                            'Property Name': 'Property Name',
                                            'Market': 'Market',
                                            'Address': 'Address',
                                            'City': 'City',
                                            'State': 'State',
                                            'Completion Date': 'Completion Date',
                                            'Impr. Rating': 'Impra Rating',
                                            'Loc. Rating': 'Location Rating',
                                            'Owner Website': 'Owner Website',
                                            'Manager Website': 'Manager Website'
                                        };

                                        return allowedFields.map((fieldKey) => {
                                            const value = prospect.raw?.[fieldKey] || (prospect as any)[fieldKey];
                                            if (!value || value.trim() === '') return null;

                                            const displayLabel = fieldLabels[fieldKey] || fieldKey;
                                            const isUrl = fieldKey.includes('Website') && (value.startsWith('http') || value.includes('.'));
                                            
                                            return (
                                                <div key={fieldKey} className="flex flex-col border-b border-border/50 pb-2">
                                                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                                                        {displayLabel}
                                                    </span>
                                                    {isUrl ? (
                                                        <a
                                                            href={value.startsWith('http') ? value : `https://${value}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline break-words"
                                                        >
                                                            {value}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm break-words">{value}</span>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Timeline Tab */}
                        {activeTab === 'timeline' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Call History</h3>
                                    <div className="bg-muted/30 p-4 rounded-lg border">
                                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                                            Extras Applied
                                        </h4>
                                        {(prospect.extras?.webinar || prospect.extras?.consultation) ? (
                                            <div className="flex flex-wrap gap-2">
                                                {prospect.extras.webinar && (
                                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                                        Webinar Interest
                                                    </Badge>
                                                )}
                                                {prospect.extras.consultation && (
                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                                        Consultation Booked
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No extras selected.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[140px]">Date</TableHead>
                                                <TableHead className="w-[100px]">Caller</TableHead>
                                                <TableHead className="w-[180px]">Outcome</TableHead>
                                                <TableHead>Email</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {prospect.callHistory && prospect.callHistory.length > 0 ? (
                                                [...prospect.callHistory].reverse().map((call, idx) => (
                                                    <TableRow key={call.id || idx}>
                                                        <TableCell className="text-sm font-medium">
                                                            {mounted ? formatToPT(call.calledAt) : ''}
                                                        </TableCell>
                                                        <TableCell className="text-sm">{call.callerName}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={call.outcome === 'invalid_number' ? 'destructive' : 'outline'}
                                                                className={cn(
                                                                    "text-xs uppercase px-2 py-1",
                                                                    call.outcome === 'invalid_number' && "bg-destructive text-destructive-foreground"
                                                                )}
                                                            >
                                                                {call.outcome ? formatStatusText(call.outcome) : ''}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm truncate max-w-[200px]" title={call.email}>
                                                            {call.email || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground italic">
                                                        No previous history recorded.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </>
    );
}
