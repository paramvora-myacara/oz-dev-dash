import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // 1. Fetch aggregated call logs for the LAST 30 DAYS
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch calls ONLY from new activities table
    const { data: activities, error: activityError } = await supabase
        .from('activities')
        .select('metadata, timestamp')
        .eq('type', 'call_logged')
        .gte('timestamp', thirtyDaysAgo.toISOString());

    if (activityError) {
        console.error('Activity Fetch Error:', activityError);
        return NextResponse.json({ error: activityError.message }, { status: 500 });
    }

    // 2. Fetch Pending Signups ONLY from new person_phones table
    const { data: pendingStats, error: pendingError } = await supabase
        .from('person_phones')
        .select('last_called_by')
        .eq('call_status', 'pending_signup')
        .gte('last_called_at', thirtyDaysAgo.toISOString());

    if (pendingError) {
        console.error('Pending Stats Fetch Error:', pendingError);
    }

    const leaderboard: Record<string, any> = {};

    const getStats = (caller: string) => {
        const name = caller || 'Unknown';
        if (!leaderboard[name]) {
            leaderboard[name] = {
                caller: name,
                totalCalls: 0,
                connected: 0,
                pendingSignups: 0,
                lastCall: null,
                outcomes: {}
            };
        }
        return leaderboard[name];
    };

    // Process Activities
    activities?.forEach((activity: any) => {
        const m = activity.metadata || {};
        const stats = getStats(m.caller_name);
        stats.totalCalls++;

        const outcome = m.outcome || 'unknown';
        if (outcome === 'answered') stats.connected++;

        const callTime = new Date(activity.timestamp).getTime();
        const currentLast = stats.lastCall ? new Date(stats.lastCall).getTime() : 0;
        if (callTime > currentLast) stats.lastCall = activity.timestamp;

        stats.outcomes[outcome] = (stats.outcomes[outcome] || 0) + 1;
    });

    // Merge Pending Signups
    pendingStats?.forEach((p: any) => {
        const stats = getStats(p.last_called_by);
        stats.pendingSignups++;
    });

    const data = Object.values(leaderboard).sort((a: any, b: any) => b.totalCalls - a.totalCalls);

    return NextResponse.json({ data });
}
