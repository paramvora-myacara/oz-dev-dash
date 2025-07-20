// src/app/debug/page.tsx
'use client';

import ImageDebugger from '../../components/ImageDebugger';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Image Fetching Debug Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Use this page to test and debug image fetching functionality
          </p>
        </div>
        
        <ImageDebugger />
      </div>
    </div>
  );
} 