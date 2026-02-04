'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDateToPT } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { CallStatus } from '@/types/prospect';

export interface CallLog {
    id: string;
    called_at: string;
    caller_name: string;
    outcome: CallStatus;
    phone_used: string;
    email_captured?: string;
    email_status?: string;
    email_error?: string;
    prospects?: {
        property_name: string;
        city: string;
        state: string;
    };
}

interface CallHistoryTableProps {
    calls: CallLog[];
    isLoading: boolean;
}

export default function CallHistoryTable({ calls, isLoading }: CallHistoryTableProps) {
    const formatStatusText = (status: string): string => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">Date</TableHead>
                        <TableHead className="w-[120px]">Caller</TableHead>
                        <TableHead className="w-[150px]">Outcome</TableHead>
                        <TableHead className="w-[250px]">Property</TableHead>
                        <TableHead className="w-[150px]">Phone</TableHead>
                        <TableHead>Email Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">Loading history...</TableCell>
                        </TableRow>
                    ) : calls.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">No calls found.</TableCell>
                        </TableRow>
                    ) : (
                        calls.map((call) => (
                            <TableRow key={call.id}>
                                <TableCell className="font-mono text-sm">
                                    {formatDateToPT(call.called_at)}
                                </TableCell>
                                <TableCell>{call.caller_name}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={call.outcome === 'invalid_number' ? 'destructive' : 'outline'}
                                        className={cn(
                                            "text-xs uppercase px-2 py-1",
                                            call.outcome === 'answered' && "bg-green-100 text-green-800 border-green-200",
                                            call.outcome === 'no_answer' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                                            call.outcome === 'invalid_number' && "bg-destructive text-destructive-foreground"
                                        )}
                                    >
                                        {formatStatusText(call.outcome)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium truncate max-w-[220px]">
                                            {call.prospects?.property_name || '-'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {call.prospects?.city}, {call.prospects?.state}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{call.phone_used}</TableCell>
                                <TableCell>
                                    {call.email_status ? (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[10px] uppercase",
                                                call.email_status === 'sent' && "bg-green-50 text-green-700 border-green-200",
                                                call.email_status === 'failed' && "bg-red-50 text-red-700 border-red-200"
                                            )}
                                        >
                                            {call.email_status}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
