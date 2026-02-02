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
import { Prospect } from '@/types/prospect';
import { ChevronsRight, Search } from 'lucide-react';
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
    isLoading: boolean;
    onOpenSheet: (prospect: Prospect) => void;
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
    isLoading,
    onOpenSheet,
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


    const handleRowClick = (prospect: Prospect, e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenSheet(prospect);
    };

    // Helper to format status text
    const formatStatusText = (status: string): string => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
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
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                    <MultiSelect
                        options={[
                            { value: 'NEVER_CONTACTED', label: 'Never Contacted' },
                            { value: 'PENDING_SIGNUP', label: 'Pending Signup' },
                            { value: 'FOLLOW_UP', label: 'Follow Up' },
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

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[40%]">Business</TableHead>
                            <TableHead className="w-[100px]">State</TableHead>
                            <TableHead className="w-[150px]">Last Call</TableHead>
                            <TableHead className="w-[180px]">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Loading prospects...</TableCell>
                            </TableRow>
                        ) : displayProspects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No prospects found.</TableCell>
                            </TableRow>
                        ) : (
                            displayProspects.map((prospect) => {
                                const locked = isLocked(prospect);
                                return (
                                    <TableRow
                                        key={prospect.id}
                                        className={cn(
                                            "cursor-pointer hover:bg-muted/50 transition-colors",
                                            locked && "bg-muted/20"
                                        )}
                                        onClick={(e) => handleRowClick(prospect, e)}
                                    >
                                        <TableCell>
                                            <ChevronsRight className="h-4 w-4 text-muted-foreground" />
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
                                                            ['follow_up', 'pending_signup'].includes(prospect.callStatus) && "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
                                                            prospect.callStatus === 'invalid_number' && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        )}
                                                        variant={
                                                            prospect.callStatus === 'new' ? 'outline' :
                                                                prospect.callStatus === 'follow_up' ? 'outline' : // Use outline + custom class
                                                                    prospect.callStatus === 'pending_signup' ? 'default' :
                                                                        prospect.callStatus === 'invalid_number' ? 'destructive' :
                                                                            ['called', 'answered'].includes(prospect.callStatus) ? 'secondary' :
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
                                                                    : formatStatusText(prospect.callStatus)}
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
                Showing {displayProspects.length} of {prospects.length} prospects
            </div>
        </div>
    );
}
