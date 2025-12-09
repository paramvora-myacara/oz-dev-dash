import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase
    const campaigns = (data || []).map(row => ({
      id: row.id,
      name: row.name,
      templateSlug: row.template_slug,
      sections: row.sections,
      subjectLine: row.subject_line,
      emailFormat: row.email_format,
      status: row.status,
      totalRecipients: row.total_recipients,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateSlug, sections, subjectLine, emailFormat } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name,
        template_slug: templateSlug || null,
        sections: sections || [],
        subject_line: subjectLine || { mode: 'static', content: '' },
        email_format: emailFormat || 'text',
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

