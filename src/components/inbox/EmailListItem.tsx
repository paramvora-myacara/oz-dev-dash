import { Mail, MailOpen } from 'lucide-react';
import { EmailSummary } from '@/lib/email/imap-client';

interface EmailListItemProps {
  email: EmailSummary;
  isSelected: boolean;
  onClick: () => void;
}

export function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-blue-300' : ''
      } ${!email.seen ? 'bg-white font-medium' : 'bg-gray-50'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {email.seen ? (
              <MailOpen size={16} className="text-gray-400" />
            ) : (
              <Mail size={16} className="text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-900 truncate">
              {email.fromName || email.from}
            </span>
          </div>
          <h3 className="text-sm text-gray-800 truncate mb-1">
            {email.subject}
          </h3>
          <p className="text-xs text-gray-500">
            {new Date(email.date).toLocaleDateString()} {new Date(email.date).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
