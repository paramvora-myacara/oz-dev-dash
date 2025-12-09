import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/campaigns/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      templateSlug: data.template_slug,
      sections: data.sections,
      subjectLine: data.subject_line,
      emailFormat: data.email_format,
      status: data.status,
      totalRecipients: data.total_recipients,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error('GET /api/campaigns/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/campaigns/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const supabase = createAdminClient();

    // Build update object (only include provided fields)
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.templateSlug !== undefined) updates.template_slug = body.templateSlug;
    if (body.sections !== undefined) updates.sections = body.sections;
    if (body.subjectLine !== undefined) updates.subject_line = body.subjectLine;
    if (body.emailFormat !== undefined) updates.email_format = body.emailFormat;
    if (body.status !== undefined) updates.status = body.status;

    // If status is being changed to 'draft', delete all staged emails
    if (body.status === 'draft') {
      await supabase
        .from('email_queue')
        .delete()
        .eq('campaign_id', id)
        .eq('status', 'staged');
      
      // Reset recipient count
      updates.total_recipients = 0;
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Campaign not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      templateSlug: data.template_slug,
      sections: data.sections,
      subjectLine: data.subject_line,
      emailFormat: data.email_format,
      status: data.status,
      totalRecipients: data.total_recipients,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error('PUT /api/campaigns/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/campaigns/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Delete associated queued emails first
    await supabase
      .from('email_queue')
      .delete()
      .eq('campaign_id', id);

    // Delete campaign
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/campaigns/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

