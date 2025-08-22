'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DDVViewModeToolbarProps {
  slug: string;
}

export function DDVViewModeToolbar({ slug }: DDVViewModeToolbarProps) {
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/admin');
  };

  const handleEditDDV = () => {
    router.push(`/${slug}/access-dd-vault/edit`);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-sm font-medium text-gray-600">
            View Mode
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEditDDV}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit DDV
          </button>
        </div>
      </div>
    </div>
  );
} 