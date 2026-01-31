'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Prospect } from '@/types/prospect';
import { ChevronDown, ChevronUp, Phone, Mail, Building, MapPin, User, History, Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatToPT, formatDateToPT } from '@/lib/date-utils';

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
];

interface ProspectsTableProps {
    prospects: Prospect[];
    onSelectProspect: (prospect: Prospect) => void;
    isLoading: boolean;
}

export default function ProspectsTable({ prospects, onSelectProspect, isLoading }: ProspectsTableProps) {
    const [search, setSearch] = useState('');
    const [stateFilter, setStateFilter] = useState('ALL');
    const [statusFilters, setStatusFilters] = useState<string[]>([]); // Array of 'AVAILABLE', 'LOCKED', 'FOLLOW_UP'
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleStatusFilter = (filter: string) => {
        setStatusFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    // Helper to check lock status
    const isLocked = (prospect: Prospect) => {
        if (!prospect.lockoutUntil) return false;
        return new Date(prospect.lockoutUntil) > new Date();
    };

    // Client-side filtering for the mock
    const filteredProspects = prospects.filter(p => {
        const matchesSearch =
            p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            p.propertyName.toLowerCase().includes(search.toLowerCase());
        const matchesState = stateFilter === 'ALL' || p.state === stateFilter;

        const locked = isLocked(p);
        const matchesStatus =
            statusFilters.length === 0 ||
            (statusFilters.includes('AVAILABLE') && !locked) ||
            (statusFilters.includes('LOCKED') && locked) ||
            (statusFilters.includes('FOLLOW_UP') && p.callStatus === 'follow_up') ||
            (statusFilters.includes('PENDING_SIGNUP') && p.callStatus === 'pending_signup');

        return matchesSearch && matchesState && matchesStatus;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search details..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All States</SelectItem>
                        {US_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-medium text-muted-foreground mr-1">Status:</span>
                    <Button
                        variant={statusFilters.includes('AVAILABLE') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleStatusFilter('AVAILABLE')}
                        className="h-9 px-4"
                    >
                        Available
                    </Button>
                    <Button
                        variant={statusFilters.includes('LOCKED') ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => toggleStatusFilter('LOCKED')}
                        className={cn("h-9 px-4", statusFilters.includes('LOCKED') && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                    >
                        Locked
                    </Button>
                    <Button
                        variant={statusFilters.includes('FOLLOW_UP') ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => toggleStatusFilter('FOLLOW_UP')}
                        className={cn("h-9 px-4",
                            statusFilters.includes('FOLLOW_UP') && "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800"
                        )}
                    >
                        Follow Up
                    </Button>
                    <Button
                        variant={statusFilters.includes('PENDING_SIGNUP') ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => toggleStatusFilter('PENDING_SIGNUP')}
                        className={cn("h-9 px-4",
                            statusFilters.includes('PENDING_SIGNUP') && "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800"
                        )}
                    >
                        Pending Signup
                    </Button>
                    {statusFilters.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusFilters([])}
                            className="h-8 text-xs text-muted-foreground underline-offset-4 hover:underline px-2"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[40%]">Business</TableHead>
                            <TableHead className="w-[100px]">State</TableHead>
                            <TableHead className="w-[100px]">Phones</TableHead>
                            <TableHead className="w-[150px]">Last Call</TableHead>
                            <TableHead className="w-[180px]">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">Loading prospects...</TableCell>
                            </TableRow>
                        ) : filteredProspects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">No prospects found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredProspects.map((prospect) => {
                                const locked = isLocked(prospect);
                                return (
                                    <>
                                        <TableRow
                                            key={prospect.id}
                                            className={cn(
                                                "cursor-pointer hover:bg-muted/50 transition-colors",
                                                locked && "bg-muted/20"
                                            )}
                                            onClick={(e) => toggleExpand(prospect.id, e)}
                                        >
                                            <TableCell>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    {expandedIds.has(prospect.id) ?
                                                        <ChevronUp className="h-4 w-4" /> :
                                                        <ChevronDown className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="font-medium text-lg truncate" title={prospect.propertyName}>
                                                    {prospect.propertyName}
                                                </div>
                                                <div className="text-base text-muted-foreground truncate">{prospect.address}, {prospect.city}</div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className="text-sm px-3 py-1">{prospect.state}</Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-base text-muted-foreground">
                                                    {prospect.phoneNumbers.length} numbers
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {prospect.lastCalledBy ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-lg">{prospect.lastCalledBy}</span>
                                                        <span className="text-base text-muted-foreground">
                                                            {/* Add logic to protect against invalid date strings if needed, assuming ISO from backend */}
                                                            {prospect.lastCalledAt && formatDateToPT(prospect.lastCalledAt)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-lg">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-col gap-1 items-start">
                                                    <Badge
                                                        className={cn("text-sm px-3 py-1",
                                                            ['follow_up', 'pending_signup'].includes(prospect.callStatus) && "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
                                                        )}
                                                        variant={
                                                            prospect.callStatus === 'new' ? 'outline' :
                                                                prospect.callStatus === 'follow_up' ? 'outline' : // Use outline + custom class
                                                                    prospect.callStatus === 'pending_signup' ? 'default' :
                                                                        ['called', 'answered', 'invalid_number'].includes(prospect.callStatus) ? 'secondary' :
                                                                            prospect.callStatus === 'closed' ? 'default' :
                                                                                locked ? 'destructive' : 'destructive'
                                                        }
                                                    >
                                                        {locked && prospect.lockoutUntil
                                                            ? `Locked until ${formatDateToPT(prospect.lockoutUntil)}`
                                                            : prospect.callStatus === 'follow_up' && prospect.followUpDate
                                                                ? `Follow up ${formatDateToPT(prospect.followUpDate)}`
                                                                : prospect.callStatus === 'pending_signup'
                                                                    ? 'Pending Signup'
                                                                    : prospect.callStatus}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                <Button
                                                    variant={locked ? "secondary" : "outline"}
                                                    disabled={locked}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectProspect(prospect);
                                                    }}
                                                    className={cn(locked && "opacity-50 cursor-not-allowed")}
                                                >
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    {locked ? "Locked" : "Log Call"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Detail Row */}
                                        {expandedIds.has(prospect.id) && (
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableCell colSpan={7} className="p-0">
                                                    <div className="p-4 space-y-6">

                                                        {/* Contact & Phone Stats */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-3">
                                                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                                                    <Phone className="h-4 w-4" /> Phone Numbers
                                                                </h4>
                                                                <div className="grid gap-2">
                                                                    {prospect.phoneNumbers.map((p, i) => (
                                                                        <div key={i} className="flex flex-col bg-background p-3 rounded-md border text-lg gap-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Badge variant="outline" className="w-16 justify-center text-sm uppercase">
                                                                                        {p.label}
                                                                                    </Badge>
                                                                                    <span className="font-mono font-medium">{p.number}</span>
                                                                                </div>
                                                                                {p.lastCalledAt ? (
                                                                                    <div className="flex items-center gap-2 text-base text-muted-foreground">
                                                                                        <span>Called {p.callCount}x</span>
                                                                                        <Badge variant="secondary" className="text-sm">
                                                                                            Last: {formatToPT(p.lastCalledAt)}
                                                                                            {prospect.lastCalledBy && ` by ${prospect.lastCalledBy}`}
                                                                                        </Badge>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-base text-muted-foreground italic">Never called</span>
                                                                                )}
                                                                            </div>

                                                                            {/* Associated Contact Details */}
                                                                            <div className="pl-[72px] text-lg flex flex-col gap-1">
                                                                                {(p.contactName || p.contactEmail) && (
                                                                                    <div className="text-muted-foreground font-medium">
                                                                                        {p.contactName && <div>{p.contactName}</div>}
                                                                                        {p.contactEmail && <div>{p.contactEmail}</div>}
                                                                                    </div>
                                                                                )}

                                                                                {/* Extra Entity Details */}
                                                                                {p.details && Object.entries(p.details).map(([k, v]) => {
                                                                                    if (!v || v.trim() === '') return null;
                                                                                    return (
                                                                                        <div key={k} className="text-muted-foreground">
                                                                                            <span className="text-base uppercase tracking-wider opacity-70 mr-1">{k}:</span>
                                                                                            <span>{v}</span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Full CSV Data Grid */}
                                                            <div className="space-y-3">
                                                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                                                    <Building className="h-4 w-4" /> Full Project Details
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base">
                                                                    {(() => {
                                                                        // Whitelist of fields to show (using exact CSV column names)
                                                                        const allowedFields = [
                                                                            'Property Name',
                                                                            'Market',
                                                                            'Address',
                                                                            'City',
                                                                            'State',
                                                                            'Completion Date',
                                                                            'Impr. Rating',  // Fixed: CSV uses "Impr. Rating" not "Impra Rating"
                                                                            'Loc. Rating',    // Fixed: CSV uses "Loc. Rating" not "Location Rating"
                                                                            'Owner Website',
                                                                            'Manager Website'
                                                                        ];

                                                                        // Map of field names to display labels (if different from CSV key)
                                                                        const fieldLabels: Record<string, string> = {
                                                                            'Property Name': 'Property Name',
                                                                            'Market': 'Market',
                                                                            'Address': 'Address',
                                                                            'City': 'City',
                                                                            'State': 'State',
                                                                            'Completion Date': 'Completion Date',
                                                                            'Impr. Rating': 'Impra Rating',      // Display as "Impra Rating"
                                                                            'Loc. Rating': 'Location Rating',     // Display as "Location Rating"
                                                                            'Owner Website': 'Owner Website',
                                                                            'Manager Website': 'Manager Website'
                                                                        };

                                                                        return allowedFields.map((fieldKey) => {
                                                                            const value = prospect.raw?.[fieldKey];
                                                                            // Only show if value exists and is not empty
                                                                            if (!value || value.trim() === '') return null;

                                                                            const displayLabel = fieldLabels[fieldKey] || fieldKey;
                                                                            return (
                                                                                <div key={fieldKey} className="flex flex-col border-b border-border/50 pb-1">
                                                                                    <span className="text-muted-foreground font-medium mb-0.5">{displayLabel}</span>
                                                                                    <span className="break-words">{value}</span>
                                                                                </div>
                                                                            );
                                                                        });
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Call Activity Section */}
                                                        <div className="pt-6 border-t border-border/50">
                                                            <h4 className="font-semibold text-xl mb-4 flex items-center gap-2">
                                                                <History className="h-5 w-5" /> Call Activity
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                {/* Last Call Notes */}
                                                                <div className="md:col-span-1 space-y-4">
                                                                    <div className="bg-background p-4 rounded-lg border shadow-sm">
                                                                        <h5 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact Email</h5>
                                                                        {prospect.ownerEmail ? (
                                                                            <p className="text-lg">{prospect.ownerEmail}</p>
                                                                        ) : (
                                                                            <p className="text-muted-foreground italic">No email on record.</p>
                                                                        )}

                                                                        {(prospect.extras?.webinar || prospect.extras?.consultation) && (
                                                                            <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                                                                {prospect.extras.webinar && (
                                                                                    <Badge className="bg-green-100 text-green-800 border-green-200">Webinar Interest</Badge>
                                                                                )}
                                                                                {prospect.extras.consultation && (
                                                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">Consultation Booked</Badge>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Call History Timeline */}
                                                                <div className="md:col-span-2 space-y-4">
                                                                    <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                                                                        <div className="max-h-[300px] overflow-y-auto">
                                                                            <Table>
                                                                                <TableHeader className="bg-muted/50 sticky top-0">
                                                                                    <TableRow>
                                                                                        <TableHead className="w-[120px]">Date</TableHead>
                                                                                        <TableHead className="w-[100px]">Caller</TableHead>
                                                                                        <TableHead className="w-[120px]">Outcome</TableHead>
                                                                                        <TableHead>Email</TableHead>
                                                                                    </TableRow>
                                                                                </TableHeader>
                                                                                <TableBody>
                                                                                    {prospect.callHistory && prospect.callHistory.length > 0 ? (
                                                                                        [...prospect.callHistory].reverse().map((call, idx) => (
                                                                                            <TableRow key={call.id || idx}>
                                                                                                <TableCell className="text-sm font-medium">
                                                                                                    {formatToPT(call.calledAt)}
                                                                                                </TableCell>
                                                                                                <TableCell className="text-sm">{call.callerName}</TableCell>
                                                                                                <TableCell>
                                                                                                    <Badge variant="outline" className="text-[10px] uppercase px-1 py-0 h-4">
                                                                                                        {call.outcome?.replace('_', ' ')}
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell className="text-sm truncate max-w-[200px]" title={call.email}>
                                                                                                    {call.email || '-'}
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        ))
                                                                                    ) : (
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                                                                                                No previous history recorded.
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    )}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-sm text-muted-foreground">
                Showing {filteredProspects.length} of {prospects.length} prospects
            </div>
        </div>
    );
}
