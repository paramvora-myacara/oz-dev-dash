'use client';

import { useState, useEffect, Fragment } from 'react';
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
    expandedId: string | null;
    onToggleExpand: (id: string) => void;
    currentUser: string | null;
    search: string;
    onSearchChange: (val: string) => void;
    stateFilter: string;
    onStateFilterChange: (val: string) => void;
    statusFilters: string[];
    onStatusFiltersChange: (val: string[]) => void;
}

export default function ProspectsTable({
    prospects,
    onSelectProspect,
    isLoading,
    expandedId,
    onToggleExpand,
    currentUser,
    search,
    onSearchChange,
    stateFilter,
    onStateFilterChange,
    statusFilters,
    onStatusFiltersChange
}: ProspectsTableProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleStatusFilter = (filter: string) => {
        const next = statusFilters.includes(filter)
            ? statusFilters.filter(f => f !== filter)
            : [...statusFilters, filter];
        onStatusFiltersChange(next);
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleExpand(id);
    };

    // Helper to check lock status
    const isLocked = (prospect: Prospect) => {
        if (!mounted || !prospect.lockoutUntil) return false;
        return new Date(prospect.lockoutUntil) > new Date();
    };

    const displayProspects = prospects || [];

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search details..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={stateFilter} onValueChange={onStateFilterChange}>
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
                            onClick={() => onStatusFiltersChange([])}
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
                        ) : displayProspects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">No prospects found.</TableCell>
                            </TableRow>
                        ) : (
                            displayProspects.map((prospect) => {
                                const locked = isLocked(prospect);
                                return (
                                    <Fragment key={prospect.id}>
                                        <TableRow
                                            className={cn(
                                                "cursor-pointer hover:bg-muted/50 transition-colors",
                                                locked && "bg-muted/20"
                                            )}
                                            onClick={(e) => toggleExpand(prospect.id, e)}
                                        >
                                            <TableCell>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    {expandedId === prospect.id ?
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
                                                    {(prospect.phoneNumbers || []).length} numbers
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {prospect.lastCalledBy ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-lg">{prospect.lastCalledBy}</span>
                                                        <span className="text-base text-muted-foreground">
                                                            {/* Add logic to protect against invalid date strings if needed, assuming ISO from backend */}
                                                            {prospect.lastCalledAt && mounted && formatDateToPT(prospect.lastCalledAt)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-lg">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-col gap-1 items-start">
                                                    {prospect.viewing_by && (
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "animate-pulse mb-1",
                                                                prospect.viewing_by === currentUser
                                                                    ? "border-blue-500 text-blue-500"
                                                                    : "border-yellow-500 text-yellow-500"
                                                            )}
                                                        >
                                                            Viewing: {prospect.viewing_by === currentUser ? 'You' : prospect.viewing_by}
                                                        </Badge>
                                                    )}
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
                                                        {locked && prospect.lockoutUntil && mounted
                                                            ? `Locked until ${formatDateToPT(prospect.lockoutUntil)}`
                                                            : prospect.callStatus === 'follow_up' && prospect.followUpAt && mounted
                                                                ? `Follow up ${formatDateToPT(prospect.followUpAt)}`
                                                                : prospect.callStatus === 'pending_signup'
                                                                    ? 'Pending Signup'
                                                                    : prospect.callStatus}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                <Button
                                                    variant={locked ? "secondary" : "outline"}
                                                    disabled={locked || (!!prospect.viewing_by && prospect.viewing_by !== currentUser)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectProspect(prospect);
                                                    }}
                                                    className={cn(locked && "opacity-50 cursor-not-allowed")}
                                                >
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    {locked ? "Locked" : (prospect.viewing_by && prospect.viewing_by !== currentUser) ? "In Use" : "Log Call"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Detail Row */}
                                        {expandedId === prospect.id && (
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
                                                                    {(prospect.phoneNumbers || []).map((p, i) => (
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
                                                                                            Last: {mounted ? formatToPT(p.lastCalledAt) : ''}
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
                                                                            const value = prospect.raw?.[fieldKey] || (prospect as any)[fieldKey];
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
                                                                        <h5 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Extras Applied</h5>
                                                                        {(prospect.extras?.webinar || prospect.extras?.consultation) ? (
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {prospect.extras.webinar && (
                                                                                    <Badge className="bg-green-100 text-green-800 border-green-200">Webinar Interest</Badge>
                                                                                )}
                                                                                {prospect.extras.consultation && (
                                                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">Consultation Booked</Badge>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-muted-foreground italic">No extras selected.</p>
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
                                                                                                    {mounted ? formatToPT(call.calledAt) : ''}
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
                                    </Fragment>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-sm text-muted-foreground">
                Showing {displayProspects.length} of {prospects.length} prospects
            </div>
        </div>
    );
}
