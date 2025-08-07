
import { X } from 'lucide-react';
import { Listing, DeveloperInfo } from '@/types/listing';


interface ContactDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerInfo: DeveloperInfo;
  listingName: string;

}

export default function ContactDeveloperModal({ isOpen, onClose, developerInfo, listingName }: ContactDeveloperModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-black dark:text-white">
                Contact the Developer
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={24} />
            </button>
        </div>
        <div className="space-y-6 text-black/70 dark:text-white/70">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {developerInfo.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-black dark:text-white">{developerInfo.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{developerInfo.role}</p>
            </div>
          </div>

          <div className="space-y-4">
           {developerInfo.phone && (<div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${developerInfo.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                {developerInfo.phone}
              </a>
            </div>)}

            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${developerInfo.email}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                {developerInfo.email}
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Feel free to reach out with any questions about The {listingName} investment opportunity.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
} 