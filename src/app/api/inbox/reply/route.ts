import { NextRequest, NextResponse } from 'next/server';
import { sendReply } from '@/lib/email/reply-service';
import { verifyAdmin } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, from, subject, originalMessageId, body } = await request.json();

    if (!to || !from || !subject || !originalMessageId || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sendReply({ to, from, subject, originalMessageId, body });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reply API error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
