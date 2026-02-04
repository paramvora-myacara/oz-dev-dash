import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // 1. Fetch aggregated call logs for the LAST 30 DAYS
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: calls, error } = await supabase
        .from('prospect_calls')
        .select('*')
        .gte('called_at', thirtyDaysAgo.toISOString())
        .order('called_at', { ascending: false });

    if (error) {
        console.error('Leaderboard DB Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Fetch Aggregated Pending Signups Snapshot
    const { data: pendingStats, error: pendingError } = await supabase
        .rpc('get_pending_signups_by_caller', { p_last_days: 30 });

    if (pendingError) {
        console.error('Pending Signups RPC Error:', pendingError);
        // Continue without crashing, just showing 0
    }

    const leaderboard: Record<string, any> = {};

    // Initialize leaderboard with calls data
    calls.forEach((call: any) => {
        const caller = call.caller_name || 'Unknown';
        if (!leaderboard[caller]) {
            leaderboard[caller] = {
                caller,
                totalCalls: 0,
                connected: 0,
                pendingSignups: 0, // Changed from emailsSent
                lastCall: null,
                outcomes: {}
            };
        }

        const stats = leaderboard[caller];
        stats.totalCalls++;

        if (call.outcome === 'answered') stats.connected++;

        // Track last call
        const callTime = new Date(call.called_at).getTime();
        const currentLast = stats.lastCall ? new Date(stats.lastCall).getTime() : 0;
        if (callTime > currentLast) {
            stats.lastCall = call.called_at;
        }

        // Breakdown
        const outcome = call.outcome || 'unknown';
        stats.outcomes[outcome] = (stats.outcomes[outcome] || 0) + 1;
    });

    // Merge Pending Signups
    if (pendingStats) {
        pendingStats.forEach((p: any) => {
            const caller = p.caller_name || 'Unknown';
            if (!leaderboard[caller]) {
                leaderboard[caller] = {
                    caller,
                    totalCalls: 0,
                    connected: 0,
                    pendingSignups: 0,
                    lastCall: null,
                    outcomes: {}
                };
            }
            leaderboard[caller].pendingSignups = p.pending_count;
        });
    }

    const data = Object.values(leaderboard).sort((a: any, b: any) => b.totalCalls - a.totalCalls);

    return NextResponse.json({ data });
}
