import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// PATCH /api/crm/linkedin-queue/[id]
// Body: { message?: string, status?: 'queued' } (status: 'queued' = retry)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    try {
        const body = await request.json();
        const update: Record<string, unknown> = {};

        // Allow message editing only on queued items
        if (body.message !== undefined) {
            update.message = body.message;
        }

        // Retry: reset failed → queued
        if (body.status === 'queued') {
            update.status = 'queued';
            update.error = null;
            update.processed_at = null;
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('linkedin_outreach_queue')
            .update(update)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid request';
        return NextResponse.json(
            { error: message },
            { status: 400 }
        );
    }
}

// DELETE /api/crm/linkedin-queue/[id] — remove from queue
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
        .from('linkedin_outreach_queue')
        .delete()
        .eq('id', id)
        .eq('status', 'queued'); // only allow deleting queued items

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
