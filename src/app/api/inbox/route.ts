import { NextRequest, NextResponse } from 'next/server';
import { ImapClient } from '@/lib/email/imap-client';
import { verifyAdmin } from '@/lib/admin/auth';

export async function GET(request: NextRequest) {
  try {
    // Admin check
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    try {
      const client = new ImapClient();
      const emails = await client.getEmails(limit);
      return NextResponse.json({ emails });
    } catch (error) {
      console.error('IMAP client error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'IMAP connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Inbox API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
