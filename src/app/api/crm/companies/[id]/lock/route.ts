import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userName } = await request.json();

  if (!userName) {
    return NextResponse.json({ error: 'User name is required' }, { status: 400 });
  }

  const supabase = await createClient();

  await supabase
    .from('organizations')
    .update({ viewing_by: null, lockout_until: null })
    .eq('viewing_by', userName);

  const { data: existing } = await supabase
    .from('organizations')
    .select('viewing_by')
    .eq('id', id)
    .not('viewing_by', 'is', null)
    .neq('viewing_by', userName)
    .maybeSingle();

  if (existing?.viewing_by) {
    return NextResponse.json(
      { error: `This organization is currently being viewed by ${existing.viewing_by}.`, viewing_by: existing.viewing_by },
      { status: 409 },
    );
  }

  console.log('Attempting to lock organization:', { id, userName });

  const { data, error } = await supabase
    .from('organizations')
    .update({ viewing_by: userName })
    .eq('id', id)
    .select('id, viewing_by, lockout_until')
    .single();

  if (error) {
    console.error('Error locking organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userName } = await request.json();
  const supabase = await createClient();

  const { error } = await supabase
    .from('organizations')
    .update({ viewing_by: null, lockout_until: null })
    .eq('id', id)
    .eq('viewing_by', userName);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
