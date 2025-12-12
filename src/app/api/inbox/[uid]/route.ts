import { NextRequest, NextResponse } from 'next/server';
import { ImapClient } from '@/lib/email/imap-client';
import { verifyAdmin } from '@/lib/admin/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uid } = await params;
    const uidNum = parseInt(uid);
    if (isNaN(uidNum)) {
      return NextResponse.json({ error: 'Invalid UID' }, { status: 400 });
    }

    try {
      const client = new ImapClient();
      const email = await client.getEmailDetail(uidNum);

      if (!email) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 });
      }

      return NextResponse.json({ email });
    } catch (error) {
      console.error('IMAP client error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'IMAP connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email' },
      { status: 500 }
    );
  }
}
