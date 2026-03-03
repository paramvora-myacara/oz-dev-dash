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

interface PropertiesTableProps {
    onRowClick: (data: any) => void;
    currentUser?: string | null;
}

export function PropertiesTable({ onRowClick, currentUser }: PropertiesTableProps) {
    const tableState = useServerTable({ endpoint: "/api/crm/properties" });

    const bulkActions = (
        <Button size="sm" variant="outline" className="h-7 text-xs ml-2 bg-white">
            <Mail className="w-3 h-3 mr-1" /> Add to Campaign
        </Button>
    );

    const tagOptions = [
        { label: "All Properties", value: "all" },
        { label: "QOZB Projects", value: "qozb_import" },
    ];

    return (
        <CRMShell
            {...tableState}
            tagOptions={tagOptions}
            searchPlaceholder="Search properties by name..."
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
                        <TableHead>Property Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Organizations</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableState.data.map((property) => (
                        (() => {
                            const lockedByOther = !!property.viewing_by && property.viewing_by !== currentUser;
                            return (
                        <TableRow
                            key={property.id}
                            className={lockedByOther ? "opacity-60 bg-slate-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"}
                            onClick={() => !lockedByOther && onRowClick(property)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={tableState.selectedIds.has(property.id)}
                                    onCheckedChange={() =>
                                        tableState.toggleSelection(property.id)
                                    }
                                />
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <span>{property.property_name}</span>
                                    {property.viewing_by && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                            <Lock className="w-3 h-3" />
                                            {property.viewing_by === currentUser ? 'You' : property.viewing_by}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{property.address || "-"}</TableCell>
                            <TableCell>
                                {property.city && property.state
                                    ? `${property.city}, ${property.state}`
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {property.property_organizations?.slice(0, 3).map((po: any, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {po.organizations?.name}
                                            {po.role && <span className="ml-1 text-slate-400">({po.role})</span>}
                                        </Badge>
                                    ))}
                                    {property.property_organizations?.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">+{property.property_organizations.length - 3}</Badge>
                                    )}
                                    {(!property.property_organizations || property.property_organizations.length === 0) && '-'}
                                </div>
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
