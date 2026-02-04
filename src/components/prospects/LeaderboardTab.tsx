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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CallHistoryTable, { CallLog } from './CallHistoryTable';
import { ChevronDown, ChevronRight, BarChart3, Clock, PhoneIncoming, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateToPT } from '@/lib/date-utils';

interface CallerStats {
    caller: string;
    totalCalls: number;
    connected: number;
    emailsSent: number;
    lastCall: string | null;
    outcomes: Record<string, number>;
}

export default function LeaderboardTab() {
    const [stats, setStats] = useState<CallerStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCaller, setExpandedCaller] = useState<string | null>(null);
    const [callerHistory, setCallerHistory] = useState<Record<string, CallLog[]>>({});
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/leaderboard');
            if (res.ok) {
                const { data } = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCaller = async (caller: string) => {
        if (expandedCaller === caller) {
            setExpandedCaller(null);
            return;
        }

        setExpandedCaller(caller);

        // Fetch history if not already loaded
        if (!callerHistory[caller]) {
            setIsLoadingHistory(true);
            try {
                const res = await fetch(`/api/call-history?caller=${encodeURIComponent(caller)}&limit=20`);
                if (res.ok) {
                    const { data } = await res.json();
                    setCallerHistory(prev => ({ ...prev, [caller]: data }));
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsLoadingHistory(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calls (30d)</CardTitle>
                        <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.reduce((acc, curr) => acc + curr.totalCalls, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Connects</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.reduce((acc, curr) => acc + curr.connected, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Answered calls
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.reduce((acc, curr) => acc + curr.emailsSent, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Caller Leaderboard</CardTitle>
                    <CardDescription>Performance metrics for the last 30 days. Click a row to see detailed history.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Caller</TableHead>
                                <TableHead className="text-right">Total Calls</TableHead>
                                <TableHead className="text-right">Connected</TableHead>
                                <TableHead className="text-right">Connection Rate</TableHead>
                                <TableHead className="text-right">Emails Sent</TableHead>
                                <TableHead className="text-right">Last Active</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">Loading stats...</TableCell>
                                </TableRow>
                            ) : stats.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">No data found.</TableCell>
                                </TableRow>
                            ) : (
                                stats.map((stat) => (
                                    <>
                                        <TableRow
                                            key={stat.caller}
                                            className={cn(
                                                "cursor-pointer hover:bg-muted/50 transition-colors",
                                                expandedCaller === stat.caller && "bg-muted/50 border-b-0"
                                            )}
                                            onClick={() => toggleCaller(stat.caller)}
                                        >
                                            <TableCell>
                                                {expandedCaller === stat.caller ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-lg">{stat.caller}</TableCell>
                                            <TableCell className="text-right text-lg">{stat.totalCalls}</TableCell>
                                            <TableCell className="text-right text-lg text-green-600 font-semibold">{stat.connected}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary">
                                                    {stat.totalCalls > 0
                                                        ? `${Math.round((stat.connected / stat.totalCalls) * 100)}%`
                                                        : '0%'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-lg">{stat.emailsSent}</TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                {stat.lastCall ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDateToPT(stat.lastCall)}
                                                    </div>
                                                ) : '-'}
                                            </TableCell>
                                        </TableRow>
                                        {expandedCaller === stat.caller && (
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableCell colSpan={7} className="p-4">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-semibold text-sm text-muted-foreground">
                                                                Recent Activity for {stat.caller}
                                                            </h4>
                                                            <Button size="sm" variant="outline" asChild>
                                                                <a href={`/admin/call-history?caller=${stat.caller}`} target="_blank" rel="noopener noreferrer">
                                                                    View Full History
                                                                </a>
                                                            </Button>
                                                        </div>
                                                        <div className="bg-background rounded-md border shadow-sm">
                                                            <CallHistoryTable
                                                                calls={callerHistory[stat.caller] || []}
                                                                isLoading={isLoadingHistory}
                                                            />
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
                </CardContent>
            </Card>
        </div>
    );
}
