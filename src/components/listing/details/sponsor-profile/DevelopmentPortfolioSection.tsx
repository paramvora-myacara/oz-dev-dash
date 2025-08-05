import React from 'react';

const DevelopmentPortfolioSection: React.FC<{ data: any }> = ({ data }) => (
   <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Development Portfolio</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Project Name</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Location</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Units</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Year</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Status</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Returns/Focus</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((project: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{project.name}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{project.location}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{project.units}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{project.year}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : project.status === 'Operating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-orange-600 dark:text-orange-400">{project.returnsOrFocus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.investmentPhilosophy && (
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.investmentPhilosophy.title}</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {data.investmentPhilosophy.description}
            </p>
          </div>
        )}
      </div>
);

export default DevelopmentPortfolioSection; 