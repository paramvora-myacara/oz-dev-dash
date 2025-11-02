'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface ViewModeToolbarProps {
  slug: string;
  detailPage?: string;
}

export function ViewModeToolbar({ slug, detailPage }: ViewModeToolbarProps) {
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/admin');
  };

  const handleEdit = () => {
    if (detailPage) {
      router.push(`/${slug}/details/${detailPage}/edit`);
    } else {
      router.push(`/${slug}/edit`);
    }
  };

  return (
    <div className="fixed top-[80px] left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm dark:bg-black dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            View Mode
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
} 