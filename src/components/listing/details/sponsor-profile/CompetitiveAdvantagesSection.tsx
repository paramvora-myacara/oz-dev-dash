import React from 'react';
import { Users } from 'lucide-react';

const CompetitiveAdvantagesSection: React.FC<{ data: any }> = ({ data }) => (
   <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Competitive Advantages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {data.advantages.slice(0,2).map((advantage: any, i: number) => (
              <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{advantage.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{advantage.description}</p>
                  </div>
                </div>
            ))}
          </div>
          <div className="space-y-4">
             {data.advantages.slice(2,4).map((advantage: any, i: number) => (
              <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{advantage.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{advantage.description}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
);

export default CompetitiveAdvantagesSection; 