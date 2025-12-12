'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Mail } from 'lucide-react';
import { EmailSummary, EmailDetail as EmailDetailType } from '@/lib/email/imap-client';
import { EmailListItem } from '@/components/inbox/EmailListItem';
import { EmailDetail } from '@/components/inbox/EmailDetail';

export default function InboxPage() {
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetailType | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/inbox');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Failed to load emails:', error);
      setEmails([]); // Ensure emails is always an array
      setError(error instanceof Error ? error.message : 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const loadEmailDetail = async (uid: number) => {
    try {
      const response = await fetch(`/api/inbox/${uid}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSelectedEmail(data.email || null);
      setReplyText('');
    } catch (error) {
      console.error('Failed to load email:', error);
      setSelectedEmail(null);
    }
  };

  const sendReply = async () => {
    if (!selectedEmail || !replyText.trim()) return;

    try {
      setSending(true);
      await fetch('/api/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmail.from,
          from: selectedEmail.to,
          subject: `Re: ${selectedEmail.subject}`,
          originalMessageId: selectedEmail.messageId,
          body: replyText,
        }),
      });

      setReplyText('');
      // Optionally refresh emails to show updated status
      await loadEmails();
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const syncInbox = async () => {
    try {
      setSyncing(true);
      await loadEmails();
    } catch (error) {
      console.error('Failed to sync inbox:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading inbox...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/campaigns"
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← Back to Campaigns
          </Link>
          <h1 className="text-2xl font-bold">Email Inbox</h1>
        </div>
        <button
          onClick={syncInbox}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Email List */}
        <div className="w-96 border-r border-gray-200 bg-white overflow-y-auto">
          {error ? (
            <div className="p-8 text-center text-red-600">
              <p className="mb-4">Error loading emails</p>
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={loadEmails}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Mail size={48} className="mx-auto mb-4 opacity-50" />
              <p>No emails in inbox</p>
            </div>
          ) : (
            <div>
              {emails.map((email) => (
                <EmailListItem
                  key={email.uid}
                  email={email}
                  isSelected={selectedEmail?.uid === email.uid}
                  onClick={() => loadEmailDetail(email.uid)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Email Detail */}
        <EmailDetail
          email={selectedEmail}
          replyText={replyText}
          onReplyTextChange={setReplyText}
          onSendReply={sendReply}
          isSending={sending}
        />
      </div>
    </div>
  );
}
