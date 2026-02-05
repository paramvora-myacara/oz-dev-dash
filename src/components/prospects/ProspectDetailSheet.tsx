import { useState, useEffect } from 'react';
import { STATE_MAPPING } from '@/lib/api/contacts/utils';
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
import { AggregatedProspectPhone, CallStatus } from '@/types/prospect';
import { Phone, Building, History, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatToPT, formatDateToPT } from '@/lib/date-utils';

interface ProspectDetailSheetProps {
    prospectPhone: AggregatedProspectPhone | null;
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
        skipEmail?: boolean;
    }) => void;
    onOpenCallModal?: (phone: AggregatedProspectPhone) => void;
}

type TabType = 'properties' | 'timeline';

export default function ProspectDetailSheet({
    prospectPhone,
    isOpen,
    onClose,
    currentUser,
    onLogCall,
    onOpenCallModal,
}: ProspectDetailSheetProps) {
    const [activeTab, setActiveTab] = useState<TabType>('properties');
    const [mounted, setMounted] = useState(false);
    const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (prospectPhone && isOpen) {
            setActiveTab('properties');
        }
    }, [prospectPhone?.id, isOpen]);

    const formatStatusText = (status: string): string => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (!prospectPhone) return null;

    // Use the first property as a fallback for the header if needed, or show count
    const primaryProperty = prospectPhone.properties[0];
    const isLocked = mounted && prospectPhone.lockoutUntil && new Date(prospectPhone.lockoutUntil) > new Date();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center gap-4">
                        <DialogTitle className="text-2xl font-mono">{prospectPhone.phoneNumber}</DialogTitle>
                        <Button
                            size="sm"
                            onClick={() => onOpenCallModal?.(prospectPhone)}
                            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-sm font-semibold h-8 px-4"
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Log Call
                        </Button>
                    </div>
                    <div className="mt-2 text-foreground">
                        <div className="text-3xl font-bold">
                            {prospectPhone.allContactNames?.length > 0
                                ? prospectPhone.allContactNames.join(' / ')
                                : 'Contact'}
                        </div>
                        <div className="text-xl font-semibold text-muted-foreground mt-1">
                            {prospectPhone.allEntityNames?.length > 0
                                ? prospectPhone.allEntityNames.join(' / ')
                                : '-'}
                        </div>
                        <DialogDescription className="text-lg mt-2">
                            {prospectPhone.propertyCount} {prospectPhone.propertyCount === 1 ? 'Property' : 'Properties'}
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {prospectPhone.allContactEmails?.map(email => (
                            <div key={email} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                {email}
                            </div>
                        ))}
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
                        onClick={() => setActiveTab('properties')}
                        className={cn(
                            "px-4 py-2 text-base font-medium border-b-2 transition-colors",
                            activeTab === 'properties'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Building className="h-5 w-5 inline mr-2" />
                        Properties ({prospectPhone.properties.length})
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

                    {activeTab === 'properties' && (
                        <div className="space-y-6">
                            {/* Market Presence Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Market Presence</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(
                                        prospectPhone.properties.reduce((acc, p) => {
                                            const s = p.state || 'Unknown';
                                            acc[s] = (acc[s] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>)
                                    )
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 3)
                                        .map(([stateCode, count]) => (
                                            <div key={stateCode} className="bg-muted/30 border rounded-xl p-4 flex flex-col items-center text-center">
                                                <span className="text-xl font-bold">
                                                    {STATE_MAPPING[stateCode.toUpperCase()] || stateCode}
                                                </span>
                                                <span className="text-lg font-medium text-muted-foreground">
                                                    {count} {count === 1 ? 'Property' : 'Properties'}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Key Entities Section */}
                            <div className="pt-2">
                                {Object.entries(
                                    prospectPhone.properties.reduce((acc, p) => {
                                        if (p.entityNames) {
                                            acc[p.entityNames] = (acc[p.entityNames] || 0) + 1;
                                        }
                                        return acc;
                                    }, {} as Record<string, number>)
                                )
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 1)
                                    .map(([entity, count]) => (
                                        <div key={entity} className="text-xl font-semibold">
                                            <span className="text-muted-foreground">Key Entity —</span>{' '}
                                            <span className="text-foreground font-bold">{entity}</span>{' '}
                                            <span className="text-muted-foreground">— {count} {count === 1 ? 'Property' : 'Properties'}</span>
                                        </div>
                                    ))}
                            </div>

                            {/* Collapsible Associated Properties */}
                            <div className="space-y-4">
                                <button
                                    onClick={() => setIsPropertiesExpanded(!isPropertiesExpanded)}
                                    className="flex items-center gap-2 group py-2"
                                >
                                    <h3 className="text-lg font-semibold">Associated Properties ({prospectPhone.properties.length})</h3>
                                    <div className="bg-muted group-hover:bg-muted-foreground/10 p-1 rounded-full transition-colors">
                                        {isPropertiesExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </button>

                                {isPropertiesExpanded && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {prospectPhone.properties.map((prop, idx) => (
                                            <div key={idx} className="bg-muted/10 border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="text-lg font-bold">{prop.propertyName}</h4>
                                                    <div className="flex items-center gap-2">
                                                        {prop.labels?.map(label => (
                                                            <Badge key={label} variant="outline" className="text-sm uppercase font-bold px-2 h-7">
                                                                {label}
                                                            </Badge>
                                                        ))}
                                                        <Badge variant="secondary" className="text-sm px-2 h-7">{formatStatusText(prop.callStatus)}</Badge>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                        <span>
                                                            {prop.address}<br />
                                                            {prop.city}, {prop.state ? (STATE_MAPPING[prop.state.toUpperCase()] || prop.state) : ''} {prop.zip}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">State:</span>
                                                            <span>{prop.state ? (STATE_MAPPING[prop.state.toUpperCase()] || prop.state) : '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground underline decoration-dotted cursor-help" title="The company or entity associated with this specific property record">Entity:</span>
                                                            <span className="font-medium text-right">{prop.entityNames || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                            <TableHead className="w-[140px]">Contact</TableHead>
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
                                                    <TableCell className="text-sm font-medium">
                                                        {call.email ? (
                                                            prospectPhone.properties.find(p => p.contactEmail === call.email)?.contactName ||
                                                            prospectPhone.allContactNames.find(n => n.toLowerCase().includes((call.email || '').split('@')[0].toLowerCase())) ||
                                                            call.email
                                                        ) : (
                                                            prospectPhone.contactName || 'Unknown'
                                                        )}
                                                    </TableCell>
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
        </Dialog >
    );
}

