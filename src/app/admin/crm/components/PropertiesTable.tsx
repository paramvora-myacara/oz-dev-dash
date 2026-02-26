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
import { Skeleton } from "@/components/ui/skeleton";

interface PropertiesTableProps {
    onRowClick: (data: any) => void;
}

export function PropertiesTable({ onRowClick }: PropertiesTableProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/crm/properties')
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
                        <TableHead>Property Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead># People</TableHead>
                        <TableHead>QOZB Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((property) => (
                        <TableRow key={property.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => onRowClick(property)}>
                            <TableCell className="font-medium">{property.property_name}</TableCell>
                            <TableCell>
                                {property.address || '-'}
                            </TableCell>
                            <TableCell>
                                {property.city && property.state ? `${property.city}, ${property.state}` : '-'}
                            </TableCell>
                            <TableCell>
                                {property.person_properties?.length || 0}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                                {property.details?.submarket ? `Submarket: ${property.details.submarket}` : '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No properties found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
