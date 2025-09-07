'use client';

import React from 'react';
import { NewsCardMetadata } from '@/types/listing';

interface InTheNewsSectionProps {
  newsLinks: NewsCardMetadata[];
}

const InTheNewsSection: React.FC<InTheNewsSectionProps> = ({ newsLinks }) => {
  if (!newsLinks || newsLinks.length === 0) {
    return null; // Don't render the section if there are no news links
  }

  // Determine grid columns based on the number of links
  let gridColsClass = '';
  if (newsLinks.length === 1) {
    gridColsClass = 'grid-cols-1';
  } else if (newsLinks.length === 2) {
    gridColsClass = 'grid-cols-1 md:grid-cols-2';
  } else if (newsLinks.length >= 3) {
    gridColsClass = 'grid-cols-1 md:grid-cols-3';
  }

  return (
    <section className="py-16 px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-semibold mb-12 text-center text-gray-900 dark:text-white tracking-tight">
          In The News
        </h2>
        <div className={`grid gap-8 ${gridColsClass}`}>
          {newsLinks.slice(0, 3).map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                {item.image && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img src={item.image} alt={item.title || 'News image'} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{item.source}</p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {item.title || item.url}
                    </h3>
                    {item.description && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center">
                    Read More
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InTheNewsSection;
