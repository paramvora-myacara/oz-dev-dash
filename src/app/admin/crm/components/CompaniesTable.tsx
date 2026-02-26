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

interface CompaniesTableProps {
    onRowClick: (data: any) => void;
}

export function CompaniesTable({ onRowClick }: CompaniesTableProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/crm/companies')
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
                        <TableHead>Company Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead># People</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((company) => (
                        <TableRow key={company.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => onRowClick(company)}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>
                                {company.org_type || '-'}
                            </TableCell>
                            <TableCell>
                                {company.city && company.state ? `${company.city}, ${company.state}` : company.address || '-'}
                            </TableCell>
                            <TableCell>
                                {company.person_organizations?.length || 0}
                            </TableCell>
                            <TableCell>
                                <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                                    {company.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No companies found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
