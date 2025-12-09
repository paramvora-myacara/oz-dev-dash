import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/campaigns/:id/emails/:emailId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; emailId: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId, emailId } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('id', emailId)
      .eq('campaign_id', campaignId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      campaignId: data.campaign_id,
      toEmail: data.to_email,
      fromEmail: data.from_email,
      subject: data.subject,
      body: data.body,
      status: data.status,
      scheduledFor: data.scheduled_for,
      domainIndex: data.domain_index,
      isEdited: data.is_edited,
      metadata: data.metadata,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('GET /api/campaigns/:id/emails/:emailId error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/campaigns/:id/emails/:emailId
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; emailId: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId, emailId } = await params;
    const body = await request.json();
    
    const supabase = createAdminClient();

    // Only allow editing staged emails
    const { data: existing } = await supabase
      .from('email_queue')
      .select('status')
      .eq('id', emailId)
      .eq('campaign_id', campaignId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (existing.status !== 'staged') {
      return NextResponse.json(
        { error: 'Can only edit staged emails' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, any> = { is_edited: true };
    if (body.subject !== undefined) updates.subject = body.subject;
    if (body.body !== undefined) updates.body = body.body;

    const { data, error } = await supabase
      .from('email_queue')
      .update(updates)
      .eq('id', emailId)
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      campaignId: data.campaign_id,
      toEmail: data.to_email,
      fromEmail: data.from_email,
      subject: data.subject,
      body: data.body,
      status: data.status,
      scheduledFor: data.scheduled_for,
      domainIndex: data.domain_index,
      isEdited: data.is_edited,
      metadata: data.metadata,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('PUT /api/campaigns/:id/emails/:emailId error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/campaigns/:id/emails/:emailId (reject email)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; emailId: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId, emailId } = await params;
    const supabase = createAdminClient();

    // Mark as rejected instead of deleting
    const { error } = await supabase
      .from('email_queue')
      .update({ status: 'rejected' })
      .eq('id', emailId)
      .eq('campaign_id', campaignId)
      .eq('status', 'staged');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/campaigns/:id/emails/:emailId error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
