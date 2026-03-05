import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface RetryFailedRequestBody {
    sender_account?: string;
}

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = (await request.json()) as RetryFailedRequestBody;

        const senderAccount = body?.sender_account?.trim();
        const filters: Record<string, string> = { status: 'failed' };

        if (senderAccount && senderAccount !== 'all') {
            filters.sender_account = senderAccount;
        }

        const query = supabase
            .from('linkedin_outreach_queue')
            .update({
                status: 'queued',
                error: null,
                processed_at: null,
            })
            .match(filters)
            .select('id, sender_account');

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            status: 'ok',
            retried_count: data?.length ?? 0,
            sender_account: senderAccount || null,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid request';
        return NextResponse.json(
            { error: message },
            { status: 400 }
        );
    }
}
