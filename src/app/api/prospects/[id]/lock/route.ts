import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { mapProspect } from '@/utils/prospect-mapping';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userName } = await request.json();

    if (!userName) {
        return NextResponse.json({ error: 'User name is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Clear any existing locks for this user (Single Lock Policy)
    await supabase
        .from('prospects')
        .update({
            viewing_by: null,
            viewing_since: null
        })
        .eq('viewing_by', userName);

    // 2. Optimistic lock: only update if viewing_by is null
    const { data, error } = await supabase
        .from('prospects')
        .update({
            viewing_by: userName,
            viewing_since: new Date().toISOString()
        })
        .eq('id', id)
        .is('viewing_by', null)
        .select()
        .single();

    if (error) {
        console.error('Error acquiring lock:', error);
        return NextResponse.json({ error: 'Could not acquire lock. It may be locked by someone else.' }, { status: 409 });
    }

    return NextResponse.json({ success: true, data: mapProspect(data) });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userName } = await request.json();

    const supabase = await createClient();

    // Only the user who owns the lock can release it
    const { error } = await supabase
        .from('prospects')
        .update({
            viewing_by: null,
            viewing_since: null
        })
        .eq('id', id)
        .eq('viewing_by', userName);

    if (error) {
        console.error('Error releasing lock:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
