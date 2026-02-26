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
        { label: "All Contacts", value: "all" },
        { label: "Family Offices", value: "family_office" },
        { label: "QOZBs", value: "qozb_property_contact" },
    ];

    return (
        <CRMShell
            {...tableState}
            tagOptions={tagOptions}
            searchPlaceholder="Search people by name..."
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
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableState.data.map((person) => (
                        <TableRow
                            key={person.id}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                            onClick={() => onRowClick(person)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={tableState.selectedIds.has(person.id)}
                                    onCheckedChange={() => tableState.toggleSelection(person.id)}
                                />
                            </TableCell>
                            <TableCell className="font-medium">
                                {person.display_name}
                            </TableCell>
                            <TableCell>
                                {person.person_organizations?.[0]?.organizations?.name || "-"}
                                {person.person_organizations?.length > 1 &&
                                    ` (+${person.person_organizations.length - 1})`}
                            </TableCell>
                            <TableCell>
                                {person.person_organizations?.[0]?.title || "-"}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {person.person_emails?.map((pe: any, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {pe.emails.address}
                                        </Badge>
                                    ))}
                                    {person.person_phones?.map((pp: any, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {pp.phones.number}
                                        </Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge>{person.lead_status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CRMShell>
    );
}
