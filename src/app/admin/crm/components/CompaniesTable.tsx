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
import { Lock, Mail } from "lucide-react";
import { useServerTable } from "../hooks/useServerTable";
import { CRMShell } from "./CRMShell";

interface CompaniesTableProps {
    onRowClick: (data: any) => void;
    currentUser?: string | null;
}

export function CompaniesTable({ onRowClick, currentUser }: CompaniesTableProps) {
    const tableState = useServerTable({ endpoint: "/api/crm/companies" });

    const bulkActions = (
        <Button size="sm" variant="outline" className="h-7 text-xs ml-2 bg-white">
            <Mail className="w-3 h-3 mr-1" /> Add to Campaign
        </Button>
    );

    const tagOptions = [
        { label: "All Companies", value: "all" },
        { label: "Family Offices", value: "family_office" },
        { label: "QOZBs Entities", value: "qozb_entity" },
    ];

    return (
        <CRMShell
            {...tableState}
            tagOptions={tagOptions}
            searchPlaceholder="Search companies by name..."
            actions={bulkActions}
        >
            <Table>
                <TableHeader>
                    <TableRow>
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
                        <TableHead>Company Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableState.data.map((company) => (
                        (() => {
                            const lockedByOther = !!company.viewing_by && company.viewing_by !== currentUser;
                            return (
                        <TableRow
                            key={company.id}
                            className={lockedByOther ? "opacity-60 bg-slate-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"}
                            onClick={() => !lockedByOther && onRowClick(company)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={tableState.selectedIds.has(company.id)}
                                    onCheckedChange={() => tableState.toggleSelection(company.id)}
                                />
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <span>{company.name}</span>
                                    {company.viewing_by && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                            <Lock className="w-3 h-3" />
                                            {company.viewing_by === currentUser ? 'You' : company.viewing_by}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{company.org_type || "-"}</TableCell>
                            <TableCell>
                                {company.city && company.state
                                    ? `${company.city}, ${company.state}`
                                    : company.address || "-"}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        company.status === "active" ? "default" : "secondary"
                                    }
                                >
                                    {company.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                            );
                        })()
                    ))}
                </TableBody>
            </Table>
        </CRMShell>
    );
}
