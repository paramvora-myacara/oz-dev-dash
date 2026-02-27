"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useServerTable } from "../hooks/useServerTable";
import { CRMShell } from "./CRMShell";

interface PeopleTableProps {
    onRowClick: (data: any) => void;
}

export function PeopleTable({ onRowClick }: PeopleTableProps) {
    const tableState = useServerTable({ endpoint: "/api/crm/people" });

    const bulkActions = (
        <Button size="sm" variant="outline" className="h-7 text-xs ml-2 bg-white">
            <Mail className="w-3 h-3 mr-1" /> Add to Campaign
        </Button>
    );

    const tagOptions = [
        { label: "Family Offices", value: "family_office" },
        { label: "QOZBs", value: "qozb_property_contact" },
        { label: "Investor", value: "investor" },
        { label: "Developer", value: "developer" },
    ];

    const getTagBadge = (tag: string) => {
        const lower = tag.toLowerCase();
        if (lower.includes('investor')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
        if (lower.includes('developer')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' };
        if (lower.includes('family_office')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' };
        if (lower.includes('qozb')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
        return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
    };

    return (
        <CRMShell
            {...tableState}
            tagOptions={tagOptions}
            searchPlaceholder="Search people by name..."
            actions={bulkActions}
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="w-12">
                            <Checkbox
                                checked={
                                    tableState.data.length > 0 &&
                                    tableState.selectedIds.size === tableState.data.length
                                }
                                onCheckedChange={(checked) =>
                                    tableState.toggleAll(
                                        tableState.data.map((d: any) => d.id),
                                        !!checked,
                                    )
                                }
                            />
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Name</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Company</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Tags</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableState.data.map((person) => (
                        <TableRow
                            key={person.id}
                            className="cursor-pointer hover:bg-slate-50 border-slate-50 group"
                            onClick={() => onRowClick(person)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={tableState.selectedIds.has(person.id)}
                                    onCheckedChange={() => tableState.toggleSelection(person.id)}
                                />
                            </TableCell>
                            <TableCell className="font-bold text-slate-900">
                                {person.display_name}
                            </TableCell>
                            <TableCell className="font-medium text-slate-600">
                                {person.person_organizations?.[0]?.organizations?.name || "-"}
                                {person.person_organizations?.length > 1 &&
                                    ` (+${person.person_organizations.length - 1})`}
                            </TableCell>
                            <TableCell className="text-slate-500 font-medium">
                                {person.person_organizations?.[0]?.title || "-"}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1.5 flex-wrap">
                                    {(person.tags || []).map((tag: string) => {
                                        const styles = getTagBadge(tag);
                                        return (
                                            <Badge
                                                key={tag}
                                                className={`${styles.bg} ${styles.text} ${styles.border} border shadow-none px-2 py-0 text-[10px] uppercase font-bold tracking-tight rounded-md`}
                                            >
                                                {tag.replace('_', ' ')}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className="bg-slate-100 text-slate-600 shadow-none capitalize border-none font-bold text-[10px] tracking-tight">
                                    {person.lead_status || 'New'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CRMShell>
    );
}

