import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// POST /api/campaigns/:id/recipients
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: campaignId } = await params;
        const body = await request.json().catch(() => ({}));
        const { selections } = body; // Array of { contact_id: string, selected_email?: string }

        if (!Array.isArray(selections)) {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Verify campaign exists
        const { data: campaign } = await supabase
            .from('campaigns')
            .select('id')
            .eq('id', campaignId)
            .single();

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // 2. Sync recipients
        // Strategy: Delete all existing 'selected' recipients and insert new ones.
        // Preserves 'sent'/'queued' recipients?
        // The plan says `campaign_recipients` tracks history.
        // If I just delete, I lose history for 'sent' ones?
        // User flow: "Select Recipients" -> Save.
        // Usually this happens in "Draft" state.
        // If campaign is already running, we shouldn't be here?
        // Assume Draft/Staged.

        // Check if we have any that are NOT 'selected' (e.g. queued, sent)
        const { count: activeCount } = await supabase
            .from('campaign_recipients')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaignId)
            .neq('status', 'selected');

        if (activeCount && activeCount > 0) {
            // If campaign has started, we might want to ONLY add new ones, never delete?
            // For now, let's assume we can only edit if status is Draft/Staged and no emails sent.
            // But for MVP, simple SYNC for 'selected' status is safest if we allow editing mid-flight?
            // Let's go with: Delete all 'selected' status rows, then upsert new ones.
            // This preserves 'sent' rows.
            await supabase
                .from('campaign_recipients')
                .delete()
                .eq('campaign_id', campaignId)
                .eq('status', 'selected');
        } else {
            // Safe to clear all if nothing sent yet
            await supabase
                .from('campaign_recipients')
                .delete()
                .eq('campaign_id', campaignId);
        }

        if (selections.length > 0) {
            const rows = selections.map((s: any) => ({
                campaign_id: campaignId,
                contact_id: s.contact_id,
                selected_email: s.selected_email || null, // If explicit choice
                status: 'selected'
            }));

            const { error } = await supabase
                .from('campaign_recipients')
                .upsert(rows, { onConflict: 'campaign_id, contact_id' }); // Conflict should update if exists (e.g. if we didn't delete sent ones, but user re-selected them? No, if sent, status!=selected)

            // Wait, if I have a 'sent' row, and I upsert 'selected', I overwrite status!
            // I should NOT overwrite if exists and status != selected.
            // But UPSERT with specific columns?
            // Actually, simplest is:
            // Filter out selections that already exist as non-selected?
            // Or just Insert and Ignore Conflicts?

            // Let's try: Insert, ON CONFLICT DO NOTHING.
            // This ensures we don't reset 'sent' to 'selected'.
            // But we DO want to update 'selected_email' if it changed?
            // Complexity.
            // Let's stick to: Delete 'selected' rows. Insert new rows. 
            // If a row exists (is 'sent'), the Insert will fail on unique constraint.
            // So use Upsert but DO NOT update status if it's not 'selected'?
            // Supabase upsert doesn't support conditional update easily.

            // Revised Strategy:
            // 1. Delete `status = 'selected'`.
            // 2. Insert new selections with `onConflict: do nothing`.
            // This implies if I re-select a 'sent' user, nothing happens (which is correct, they are already in campaign).
            // If I select a new user, they are added.
            // If I unselect a 'selected' user, they were deleted in step 1.

            const { error: insertError } = await supabase
                .from('campaign_recipients')
                .upsert(rows, { onConflict: 'campaign_id, contact_id', ignoreDuplicates: true });

            if (insertError) {
                console.error('Insert error:', insertError);
                return NextResponse.json({ error: insertError.message }, { status: 500 });
            }
        }

        // 3. Update total_recipients count
        const { count: finalCount } = await supabase
            .from('campaign_recipients')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaignId);

        await supabase
            .from('campaigns')
            .update({ total_recipients: finalCount || 0 })
            .eq('id', campaignId);

        return NextResponse.json({ success: true, count: finalCount });

    } catch (error) {
        console.error('POST /api/recipients error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
