import Link from "next/link";
import { Target, TrendingUp, Users, Home, Building, Factory } from "lucide-react";

export default function MarketAnalysisPage() {
  const marketMetrics = [
    { label: "DFW Population", value: "7M+", description: "Metro area population leading US growth" },
    { label: "Job Growth (5-Year)", value: "602,200", description: "Net new jobs added, leading all US metros" },
    { label: "Fortune 1000 HQs", value: "43", description: "Companies headquartered in DFW" },
    { label: "Tech Jobs Added", value: "59,000", description: "New technology positions in past 5 years" },
    { label: "Annual Migration", value: "120,000+", description: "Net in-migration to Texas annually" },
    { label: "Rent Growth", value: "+42%", description: "Class A multifamily rent appreciation (5-year)" }
  ];

  const employers = [
    { name: "American Airlines", employees: "30,000+", industry: "Aviation", distance: "15 mi" },
    { name: "AT&T", employees: "25,000+", industry: "Telecommunications", distance: "12 mi" },
    { name: "Texas Instruments", employees: "15,000+", industry: "Technology", distance: "18 mi" },
    { name: "Bank of America", employees: "12,000+", industry: "Financial Services", distance: "10 mi" },
    { name: "Dallas County", employees: "14,000+", industry: "Government", distance: "8 mi" },
    { name: "Baylor Scott & White", employees: "45,000+", industry: "Healthcare", distance: "20 mi" }
  ];

  const demographics = [
    { category: "Age 25-34", percentage: "16.8%", description: "Prime renting demographic" },
    { category: "Age 35-44", percentage: "14.2%", description: "Family formation years" },
    { category: "College Educated", percentage: "38%", description: "Bachelor's degree or higher" },
    { category: "Median Household Income", percentage: "$70,663", description: "DFW metro median" }
  ];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link 
                          href="/sogood-dallas#investment-cards" 
            className="inline-flex items-center text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-5xl"><Target className="w-12 h-12 text-purple-600 dark:text-purple-400" /></div>
            <div>
              <h1 className="text-5xl font-semibold text-purple-900 dark:text-purple-300 tracking-tight">
                Market Analysis
              </h1>
              <p className="text-xl text-purple-700 dark:text-purple-400 mt-2">
                SoGood Dallas - Dallas-Fort Worth Market Overview
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Market Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {marketMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">{metric.label}</h3>
                <p className="text-4xl font-bold text-purple-900 dark:text-purple-300 mb-4">{metric.value}</p>
                <p className="text-sm text-purple-700 dark:text-purple-400">{metric.description}</p>
              </div>
            ))}
          </div>

          {/* Major Employers */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Major Employers Within 20 Miles</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Company</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Employees</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Industry</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((employer, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{employer.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.employees}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.industry}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.distance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Demographics & Market Drivers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Demographics</h3>
              <div className="space-y-6">
                {demographics.map((demo, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{demo.category}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{demo.description}</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{demo.percentage}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Economic Diversification</h3>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Technology Sector</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">One-third of Texas tech jobs located in DFW, with 59,000 new positions added in past 5 years</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Corporate Headquarters</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Home to 43 Fortune 1000 companies, including 22 Fortune 500 companies</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Population Growth</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">DFW leads all US metro areas in population growth, adding 120,000+ annually</p>
                </div>
              </div>
            </div>
          </div>

          {/* Market Opportunity */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Innovation District Opportunity</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Urban Revitalization</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transforming Dallas' southern sector with catalytic development</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Building className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mixed-Use Development</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Combining residential, commercial, and innovation spaces</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Factory className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Job Creation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Innovation center anchored by GSV Ventures creating tech ecosystem</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Value Creation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Master-planned approach maximizing long-term value appreciation</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}