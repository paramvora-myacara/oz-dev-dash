'use client';

import { useState, useEffect } from 'react';
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
import { MultiSelect } from '@/components/ui/multi-select';
import { AggregatedProspectPhone } from '@/types/prospect';
import { ChevronsRight, Search, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateToPT } from '@/lib/date-utils';

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
];

interface ProspectsTableProps {
    prospectPhones: AggregatedProspectPhone[];
    isLoading: boolean;
    onOpenSheet: (phone: AggregatedProspectPhone) => void;
    currentUser: string | null;
    search: string;
    onSearchChange: (val: string) => void;
    stateFilter: string;
    onStateFilterChange: (val: string) => void;
    statusFilters: string[];
    onStatusFiltersChange: (val: string[]) => void;
    roleFilters: string[];
    onRoleFiltersChange: (val: string[]) => void;
    minProperties: number;
    onMinPropertiesChange: (val: number) => void;
}

export default function ProspectsTable({
    prospectPhones,
    isLoading,
    onOpenSheet,
    currentUser,
    search,
    onSearchChange,
    stateFilter,
    onStateFilterChange,
    statusFilters,
    onStatusFiltersChange,
    roleFilters,
    onRoleFiltersChange,
    minProperties,
    onMinPropertiesChange
}: ProspectsTableProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRowClick = (phone: AggregatedProspectPhone, e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenSheet(phone);
    };

    const formatStatusText = (status: string): string => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const isLocked = (phone: AggregatedProspectPhone) => {
        if (!mounted || !phone.lockoutUntil) return false;
        return new Date(phone.lockoutUntil) > new Date();
    };

    const displayPhones = prospectPhones || [];

    // Derive aggregated state/market from properties if needed
    // The current AggregatedProspectPhone doesn't have a top-level state/market, 
    // but the API query filters by state so usually they match.
    // If mixed, we can show "Mixed" or checks.

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search phone, property, entity..."
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

                <Select value={minProperties.toString()} onValueChange={(val) => onMinPropertiesChange(parseInt(val))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Property Count" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">All Properties</SelectItem>
                        <SelectItem value="2">At least 2</SelectItem>
                        <SelectItem value="5">At least 5</SelectItem>
                        <SelectItem value="10">At least 10</SelectItem>
                        <SelectItem value="20">At least 20</SelectItem>
                        <SelectItem value="50">At least 50</SelectItem>
                        <SelectItem value="100">At least 100</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Role:</span>
                    <MultiSelect
                        options={[
                            { value: 'Owner', label: 'Owner' },
                            { value: 'Manager', label: 'Manager' },
                            { value: 'Property', label: 'Property' },
                        ]}
                        selected={roleFilters}
                        onSelectionChange={onRoleFiltersChange}
                        placeholder="Filter by role..."
                        className="w-[180px]"
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                    <MultiSelect
                        options={[
                            { value: 'NEVER_CONTACTED', label: 'Never Contacted' },
                            { value: 'PENDING_SIGNUP', label: 'Pending Signup' },
                            { value: 'FOLLOW_UP', label: 'Follow Up' },
                            { value: 'NO_ANSWER', label: 'No Answer' },
                            { value: 'LOCKED', label: 'Locked' },
                            { value: 'INVALID_NUMBER', label: 'Invalid Number' },
                        ]}
                        selected={statusFilters}
                        onSelectionChange={onStatusFiltersChange}
                        placeholder="Filter by status..."
                        className="w-[200px]"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[20%]">Phone</TableHead>
                            <TableHead className="w-[10%]">Count</TableHead>
                            <TableHead className="w-[120px]">Role</TableHead>
                            <TableHead className="w-[100px]">State</TableHead>
                            <TableHead className="w-[140px]">Last Call</TableHead>
                            <TableHead className="w-[150px]">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">Loading prospects...</TableCell>
                            </TableRow>
                        ) : displayPhones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">No prospects found.</TableCell>
                            </TableRow>
                        ) : (
                            displayPhones.map((phone) => {
                                const locked = isLocked(phone);
                                // The firstProp variable is no longer needed after removing the Entity / Property column.

                                // Determine State display
                                const uniqueStates = Array.from(new Set(phone.properties.map(p => p.state).filter(Boolean)));
                                const displayState = uniqueStates.length > 1 ? 'Mixed' : uniqueStates[0] || '-';

                                return (
                                    <TableRow
                                        key={phone.id}
                                        className={cn(
                                            "cursor-pointer hover:bg-muted/50 transition-colors",
                                            locked && "bg-muted/20"
                                        )}
                                        onClick={(e) => handleRowClick(phone, e)}
                                    >
                                        <TableCell>
                                            <ChevronsRight className="h-4 w-4 text-muted-foreground" />
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="font-mono font-medium text-lg truncate" title={phone.phoneNumber}>
                                                {phone.phoneNumber}
                                            </div>
                                            <div className="text-base text-muted-foreground truncate">
                                                {phone.contactName || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className="text-base px-3 py-1 font-semibold bg-background border-2">
                                                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                                {phone.propertyCount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                {phone.labels.map(label => (
                                                    <Badge key={label} variant="outline" className="text-xs uppercase tracking-wider font-bold h-6 px-2">
                                                        {label}
                                                    </Badge>
                                                ))}
                                                {phone.labels.length === 0 && <span className="text-muted-foreground">-</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                                {displayState}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {phone.lastCalledBy ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-lg">{phone.lastCalledBy}</span>
                                                    <span className="text-base text-muted-foreground">
                                                        {phone.lastCalledAt && mounted && formatDateToPT(phone.lastCalledAt)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-lg">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-col gap-1 items-start">
                                                {phone.viewing_by && (
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "animate-pulse mb-1",
                                                            phone.viewing_by === currentUser
                                                                ? "border-blue-500 text-blue-500"
                                                                : "border-yellow-500 text-yellow-500"
                                                        )}
                                                    >
                                                        Viewing: {phone.viewing_by === currentUser ? 'You' : phone.viewing_by}
                                                    </Badge>
                                                )}
                                                <Badge
                                                    className={cn("text-sm px-3 py-1",
                                                        ['follow_up', 'pending_signup'].includes(phone.callStatus) && "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
                                                        phone.callStatus === 'invalid_number' && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    )}
                                                    variant={
                                                        phone.callStatus === 'new' ? 'outline' :
                                                            phone.callStatus === 'follow_up' ? 'outline' :
                                                                phone.callStatus === 'pending_signup' ? 'default' :
                                                                    phone.callStatus === 'invalid_number' ? 'destructive' :
                                                                        ['called', 'answered'].includes(phone.callStatus) ? 'secondary' :
                                                                            phone.callStatus === 'closed' ? 'default' :
                                                                                locked ? 'destructive' : 'destructive'
                                                    }
                                                >
                                                    {locked && phone.lockoutUntil && mounted
                                                        ? `Locked until ${formatDateToPT(phone.lockoutUntil)}`
                                                        : phone.callStatus === 'follow_up' && phone.followUpAt && mounted
                                                            ? `Follow up ${formatDateToPT(phone.followUpAt)}`
                                                            : phone.callStatus === 'pending_signup'
                                                                ? 'Pending Signup'
                                                                : formatStatusText(phone.callStatus)}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-sm text-muted-foreground">
                Showing {displayPhones.length} of {prospectPhones.length} contacts
            </div>
        </div>
    );
}
