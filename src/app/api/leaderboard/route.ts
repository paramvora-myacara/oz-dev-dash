import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Fetch aggregated stats manually since we can't use detailed group-by via simple SDK
    // We will fetch raw logs for the LAST 30 DAYS (to keep it performant for now)
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

    const leaderboard: Record<string, any> = {};

    calls.forEach((call: any) => {
        const caller = call.caller_name || 'Unknown';
        if (!leaderboard[caller]) {
            leaderboard[caller] = {
                caller,
                totalCalls: 0,
                connected: 0,
                emailsSent: 0,
                lastCall: null,
                outcomes: {}
            };
        }

        const stats = leaderboard[caller];
        stats.totalCalls++;

        if (call.outcome === 'answered') stats.connected++;
        // Check if email was sent (assuming email_status 'sent' or non-null indicates attempt)
        // Adjust logic based on your schema. For now, we'll check if email_status is present/sent.
        if (call.email_status === 'sent') stats.emailsSent++;

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

    const data = Object.values(leaderboard).sort((a: any, b: any) => b.totalCalls - a.totalCalls);

    return NextResponse.json({ data });
}
