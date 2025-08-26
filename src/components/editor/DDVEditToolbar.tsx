'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DDVEditToolbarProps {
  slug: string;
}

export function DDVEditToolbar({ slug }: DDVEditToolbarProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/admin');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-sm font-medium text-gray-600">
            Editing Mode
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Right side - Empty for balance */}
          <div className="w-24"></div>
        </div>
      </div>
    </div>
  );
} 