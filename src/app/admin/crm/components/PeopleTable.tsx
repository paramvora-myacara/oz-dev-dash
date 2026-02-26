'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PeopleTableProps {
    onRowClick: (data: any) => void;
}

export function PeopleTable({ onRowClick }: PeopleTableProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/crm/people')
            .then(res => res.json())
            .then(d => {
                setData(d || []);
                setLoading(false);
            })
            .catch((e) => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((person) => (
                        <TableRow key={person.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => onRowClick(person)}>
                            <TableCell className="font-medium">{person.display_name}</TableCell>
                            <TableCell>
                                {person.person_organizations?.[0]?.organizations?.name || '-'}
                                {person.person_organizations?.length > 1 && ` (+${person.person_organizations.length - 1})`}
                            </TableCell>
                            <TableCell>
                                {person.person_organizations?.[0]?.title || '-'}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {person.person_emails?.map((pe: any, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs">{pe.emails.address}</Badge>
                                    ))}
                                    {person.person_phones?.map((pp: any, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">{pp.phones.number}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge>{person.lead_status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No people found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
