import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';

export interface EmailSummary {
  uid: number;
  messageId: string;
  from: string;
  fromName?: string;
  subject: string;
  date: Date;
  seen: boolean;
}

export interface EmailDetail extends EmailSummary {
  to: string;
  body: string;
  html?: string;
}

export class ImapClient {
  private client: ImapFlow;

  constructor() {
    const user = process.env.MXROUTE_IMAP_USER;
    const pass = process.env.MXROUTE_IMAP_PASS;

    if (!user || !pass) {
      throw new Error('MX Route IMAP credentials not configured. Please set MXROUTE_IMAP_USER and MXROUTE_IMAP_PASS environment variables.');
    }

    this.client = new ImapFlow({
      host: 'heracles.mxrouting.net',
      port: 993,
      secure: true,
      auth: {
        user,
        pass,
      },
      logger: false,
    });
  }

  async getEmails(limit: number = 50): Promise<EmailSummary[]> {
    await this.client.connect();

    const mailbox = await this.client.getMailboxLock('INBOX');
    if (!mailbox) {
      await this.client.logout();
      return [];
    }

    try {
      // Get mailbox status to check message count
      const status = await this.client.status('INBOX', { messages: true });
      if (!status.messages || status.messages === 0) {
        mailbox.release();
        await this.client.logout();
        return [];
      }

      // Get recent messages (avoid fetching negative ranges)
      const startSeq = Math.max(1, status.messages - limit + 1);
      const messages = await this.client.fetch(
        `${startSeq}:${status.messages}`,
        {
          uid: true,
          envelope: true,
          flags: true,
        }
      );

      const emails: EmailSummary[] = [];
      for await (const message of messages) {
        emails.push({
          uid: message.uid,
          messageId: message.envelope?.messageId || '',
          from: message.envelope?.from?.[0]?.address || '',
          fromName: message.envelope?.from?.[0]?.name || '',
          subject: message.envelope?.subject || '(No Subject)',
          date: message.envelope?.date || new Date(),
          seen: message.flags?.has('\\Seen') || false,
        });
      }

      return emails.reverse(); // Newest first
    } finally {
      mailbox.release();
      await this.client.logout();
    }
  }

  async getEmailDetail(uid: number): Promise<EmailDetail | null> {
    await this.client.connect();

    const mailbox = await this.client.getMailboxLock('INBOX');

    try {
      // Use UID-based fetch to avoid sequence number mismatches
      const message = await this.client.fetchOne(
        uid,
        {
          envelope: true,
          flags: true,
          source: true
        },
        {
          uid: true
        }
      );

      if (!message || !('source' in message) || !message.source) {
        return null;
      }

      const parsed: ParsedMail = await simpleParser(message.source);

      const emailDetail: EmailDetail = {
        uid: 'uid' in message ? message.uid : uid,
        messageId: parsed.messageId || '',
        from: message.envelope?.from?.[0]?.address || '',
        fromName: message.envelope?.from?.[0]?.name || '',
        to: message.envelope?.to?.[0]?.address || '',
        subject: parsed.subject || '(No Subject)',
        date: parsed.date || new Date(),
        seen: 'flags' in message && message.flags?.has('\\Seen') || false,
        body: parsed.text || '',
        html: parsed.html || undefined,
      };

      // Mark as read when opened (using UID)
      if (!('flags' in message) || !message.flags?.has('\\Seen')) {
        await this.client.messageFlagsSet(uid, ['\\Seen'], { uid: true });
      }

      return emailDetail;
    } finally {
      mailbox.release();
      await this.client.logout();
    }
  }
}
