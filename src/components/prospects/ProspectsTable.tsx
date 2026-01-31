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
import { ChevronDown, ChevronUp, Phone, Mail, Building, MapPin, User, History, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

    // Client-side filtering for the mock
    const filteredProspects = prospects.filter(p => {
        const matchesSearch =
            p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            p.propertyName.toLowerCase().includes(search.toLowerCase());
        const matchesState = stateFilter === 'ALL' || p.state === stateFilter;
        return matchesSearch && matchesState;
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
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All States</SelectItem>
                        {US_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[50%]">Business</TableHead>
                            <TableHead className="w-[100px]">State</TableHead>
                            <TableHead className="w-[100px]">Phones</TableHead>
                            <TableHead className="w-[180px]">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">Loading prospects...</TableCell>
                            </TableRow>
                        ) : filteredProspects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No prospects found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredProspects.map((prospect) => (
                                <>
                                    <TableRow
                                        key={prospect.id}
                                        className="cursor-pointer hover:bg-muted/50"
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
                                        <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                            <Badge className="text-sm px-3 py-1" variant={
                                                prospect.callStatus === 'new' ? 'outline' :
                                                    ['called', 'answered', 'voicemail', 'follow_up'].includes(prospect.callStatus) ? 'secondary' :
                                                        prospect.callStatus === 'closed' ? 'default' : 'destructive'
                                            }>
                                                {prospect.callStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <Button
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectProspect(prospect);
                                                }}
                                            >
                                                <Phone className="h-4 w-4 mr-2" />
                                                Log Call
                                            </Button>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expanded Detail Row */}
                                    {expandedIds.has(prospect.id) && (
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={6} className="p-0">
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
                                                                                        Last: {new Date(p.lastCalledAt).toLocaleDateString()}
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
                                                                {Object.entries(prospect.raw || {}).map(([key, value]) => {
                                                                    // Filter out empty values and keys that are already shown in the phone section
                                                                    if (!value || value.trim() === '') return null;

                                                                    const hiddenKeys = [
                                                                        'Phone Number',
                                                                        'Owner Contact Phone Number', 'Owner Contact First Name', 'Owner Contact Last Name', 'Owner Contact Email',
                                                                        'Manager Contact Phone Number', 'Manager Contact First Name', 'Manager Contact Last Name', 'Manager Contact Email',
                                                                        'Trustee Contact Phone Number', 'Trustee Contact First Name', 'Trustee Contact Last Name', 'Trustee Contact Email',
                                                                        // Entity Details moved to phone info
                                                                        'Owner', 'Owner Address', 'Owner City', 'Owner State', 'Owner ZIP',
                                                                        'Manager', 'Manager Address', 'Manager City', 'Manager State', 'Manager ZIP',
                                                                        'Trustee', 'Trustee Address', 'Trustee City', 'Trustee State', 'Trustee ZIP'
                                                                    ];
                                                                    if (hiddenKeys.includes(key)) return null;

                                                                    return (
                                                                        <div key={key} className="flex flex-col border-b border-border/50 pb-1">
                                                                            <span className="text-muted-foreground font-medium mb-0.5">{key}</span>
                                                                            <span className="break-words">{value}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))
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
