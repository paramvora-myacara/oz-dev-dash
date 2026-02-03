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
import { ProspectPhone, CallStatus } from '@/types/prospect';
import { Phone, Building, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatToPT, formatDateToPT } from '@/lib/date-utils';

interface ProspectDetailSheetProps {
    prospectPhone: ProspectPhone | null;
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
    onOpenCallModal?: (phone: ProspectPhone) => void;
}

type TabType = 'dialer' | 'research' | 'timeline';

export default function ProspectDetailSheet({
    prospectPhone,
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

    useEffect(() => {
        if (prospectPhone && isOpen) {
            setActiveTab('dialer');
        }
    }, [prospectPhone?.id, isOpen]);

    const formatStatusText = (status: string): string => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (!prospectPhone) return null;

    const property = prospectPhone.prospect;
    const isLocked = mounted && prospectPhone.lockoutUntil && new Date(prospectPhone.lockoutUntil) > new Date();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-2xl font-mono">{prospectPhone.phoneNumber}</DialogTitle>
                    <DialogDescription className="text-base">
                        {prospectPhone.contactName || prospectPhone.entityNames || 'Contact'}
                        {property && ` · ${property.propertyName}`}
                    </DialogDescription>
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {prospectPhone.labels.map(l => (
                            <Badge key={l} variant="outline" className="text-xs uppercase">
                                {l}
                            </Badge>
                        ))}
                        <Badge
                            className={cn(
                                "text-sm px-3 py-1",
                                ['follow_up', 'pending_signup'].includes(prospectPhone.callStatus) && "bg-amber-100 text-amber-800 border-amber-200",
                                prospectPhone.callStatus === 'invalid_number' && "bg-destructive text-destructive-foreground"
                            )}
                            variant={
                                prospectPhone.callStatus === 'new' ? 'outline' :
                                    prospectPhone.callStatus === 'pending_signup' ? 'default' :
                                        prospectPhone.callStatus === 'invalid_number' ? 'destructive' :
                                            ['called', 'answered'].includes(prospectPhone.callStatus) ? 'secondary' :
                                                'outline'
                            }
                        >
                            {isLocked && prospectPhone.lockoutUntil && mounted
                                ? `Locked until ${formatDateToPT(prospectPhone.lockoutUntil)}`
                                : prospectPhone.callStatus === 'follow_up' && prospectPhone.followUpAt && mounted
                                    ? `Follow up ${formatDateToPT(prospectPhone.followUpAt)}`
                                    : prospectPhone.callStatus === 'pending_signup'
                                        ? 'Pending Signup'
                                        : formatStatusText(prospectPhone.callStatus)}
                        </Badge>
                        {prospectPhone.viewing_by && (
                            <Badge variant="outline" className="animate-pulse">
                                Viewing: {prospectPhone.viewing_by === currentUser ? 'You' : prospectPhone.viewing_by}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex border-b mt-4">
                    <button
                        onClick={() => setActiveTab('dialer')}
                        className={cn(
                            "px-4 py-2 text-base font-medium border-b-2 transition-colors",
                            activeTab === 'dialer'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Phone className="h-5 w-5 inline mr-2" />
                        Dialer
                    </button>
                    <button
                        onClick={() => setActiveTab('research')}
                        className={cn(
                            "px-4 py-2 text-base font-medium border-b-2 transition-colors",
                            activeTab === 'research'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Building className="h-5 w-5 inline mr-2" />
                        Research
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={cn(
                            "px-4 py-2 text-base font-medium border-b-2 transition-colors",
                            activeTab === 'timeline'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <History className="h-5 w-5 inline mr-2" />
                        Timeline
                    </button>
                </div>

                <div className="mt-6">
                    {activeTab === 'dialer' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Contact</h3>
                            <div className="bg-muted/30 p-4 rounded-lg border space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {prospectPhone.labels.map(role => (
                                                <Badge key={role} variant="outline" className="text-xs uppercase">
                                                    {role}
                                                </Badge>
                                            ))}
                                            <span className="font-mono font-semibold text-lg">{prospectPhone.phoneNumber}</span>
                                        </div>
                                        {prospectPhone.contactName && (
                                            <div className="text-base font-medium text-foreground">{prospectPhone.contactName}</div>
                                        )}
                                        {prospectPhone.contactEmail && (
                                            <div className="text-base text-muted-foreground">{prospectPhone.contactEmail}</div>
                                        )}
                                        {prospectPhone.entityNames && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                <span className="uppercase tracking-wider opacity-70">Entity:</span> {prospectPhone.entityNames}
                                            </div>
                                        )}
                                        {prospectPhone.entityAddresses && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                <span className="uppercase tracking-wider opacity-70">Address:</span> {prospectPhone.entityAddresses}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => onOpenCallModal?.(prospectPhone)}
                                        className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-base font-semibold px-6 py-3"
                                    >
                                        <Phone className="h-5 w-5 mr-2" />
                                        Log Call
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'research' && property && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Property Details</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {[
                                    { key: 'Property Name', label: 'Property Name', value: property.propertyName },
                                    { key: 'Market', label: 'Market', value: property.market },
                                    { key: 'Address', label: 'Address', value: property.address },
                                    { key: 'City', label: 'City', value: property.city },
                                    { key: 'State', label: 'State', value: property.state },
                                    { key: 'Submarket', label: 'Submarket', value: property.submarket },
                                    { key: 'ZIP', label: 'ZIP', value: property.zip },
                                ].filter(f => f.value).map(({ key, label, value }) => (
                                    <div key={key} className="flex flex-col border-b border-border/50 pb-2">
                                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                                            {label}
                                        </span>
                                        <span className="text-base break-words">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Call History</h3>
                                <div className="bg-muted/30 p-4 rounded-lg border">
                                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                                        Extras Applied
                                    </h4>
                                    {(prospectPhone.extras?.webinar || prospectPhone.extras?.consultation) ? (
                                        <div className="flex flex-wrap gap-2">
                                            {prospectPhone.extras.webinar && (
                                                <Badge className="bg-green-100 text-green-800 border-green-200">Webinar Interest</Badge>
                                            )}
                                            {prospectPhone.extras.consultation && (
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Consultation Booked</Badge>
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
                                            <TableHead className="w-[120px]">Email Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {prospectPhone.callHistory && prospectPhone.callHistory.length > 0 ? (
                                            prospectPhone.callHistory.map((call, idx) => (
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
                                                        {call.email || <span className="text-muted-foreground italic">No email captured</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        {call.email ? (
                                                            <div className="flex flex-col gap-1">
                                                                {call.emailStatus === 'sent' && (
                                                                    <Badge variant="outline" className="w-fit bg-green-900/20 text-green-400 border-green-800/50 text-[10px] py-0 px-2 font-medium">
                                                                        Email Sent
                                                                    </Badge>
                                                                )}
                                                                {call.emailStatus === 'failed' && (
                                                                    <Badge variant="outline" className="w-fit bg-red-900/20 text-red-400 border-red-800/50 text-[10px] py-0 px-2 font-medium" title={call.emailError || 'Unknown error'}>
                                                                        Email Failed
                                                                    </Badge>
                                                                )}
                                                                {call.emailStatus === 'pending' && (
                                                                    <Badge variant="outline" className="w-fit bg-blue-900/20 text-blue-400 border-blue-800/50 text-[10px] py-0 px-2 font-medium animate-pulse">
                                                                        Sending...
                                                                    </Badge>
                                                                )}
                                                                {!call.emailStatus && (
                                                                    <span className="text-muted-foreground text-[10px] italic">Queued</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-[10px]">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground italic">
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
    );
}
