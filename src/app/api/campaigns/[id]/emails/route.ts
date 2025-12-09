import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/campaigns/:id/emails
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') || 'staged';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createAdminClient();

    // Get total count
    const { count } = await supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', status);

    // Get paginated emails
    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', status)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emails = (data || []).map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      toEmail: row.to_email,
      fromEmail: row.from_email,
      subject: row.subject,
      body: row.body,
      status: row.status,
      scheduledFor: row.scheduled_for,
      domainIndex: row.domain_index,
      isEdited: row.is_edited,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      emails,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('GET /api/campaigns/:id/emails error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
