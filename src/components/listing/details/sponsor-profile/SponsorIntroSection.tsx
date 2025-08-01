import React from 'react';
import { Users } from 'lucide-react';

const SponsorIntroSection: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{data.sponsorName}</h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        {data.content.paragraphs.map((p: string, i: number) => (
          <p key={i} className="text-lg text-gray-600 dark:text-gray-400 mb-6 last:mb-0">{p}</p>
        ))}
      </div>
      <div className="space-y-4">
        {data.content.highlights.type === 'icons' && data.content.highlights.items.map((item: any, i: number) => (
          <div key={i} className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-orange-500" />
            <span className="text-gray-900 dark:text-gray-100">{item.text}</span>
          </div>
        ))}
         {data.content.highlights.type === 'list' && (
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Investment Strategy</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  {data.content.highlights.items.map((item: any, i: number) => (
                    <li key={i}>• {item.text}</li>
                  ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  </div>
);

export default SponsorIntroSection; 