import { Reply, Mail } from 'lucide-react';
import { EmailDetail as EmailDetailType } from '@/lib/email/imap-client';

interface EmailDetailProps {
  email: EmailDetailType | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSendReply: () => void;
  isSending: boolean;
}

export function EmailDetail({ email, replyText, onReplyTextChange, onSendReply, isSending }: EmailDetailProps) {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Mail size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select an email to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Email Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {email.subject}
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>From:</strong> {email.fromName ? `${email.fromName} <${email.from}>` : email.from}</p>
          <p><strong>To:</strong> {email.to}</p>
          <p><strong>Date:</strong> {new Date(email.date).toLocaleString()}</p>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 p-6 bg-white overflow-auto">
        <div className="prose prose-sm max-w-none">
          {email.html ? (
            <div dangerouslySetInnerHTML={{ __html: email.html }} />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {email.body}
            </pre>
          )}
        </div>
      </div>

      {/* Reply Form */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Reply size={16} />
          <span className="font-medium text-sm">Reply</span>
        </div>
        <textarea
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
          placeholder="Type your reply..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={onSendReply}
            disabled={!replyText.trim() || isSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}
