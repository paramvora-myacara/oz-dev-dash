import Link from "next/link";

export default function InvestmentTermsPage() {
  const investmentStructure = [
    { term: "Minimum Investment", value: "$250,000", description: "Per accredited investor" },
    { term: "Maximum Investment", value: "$2,500,000", description: "Individual investor cap" },
    { term: "Total Equity Target", value: "$28,800,000", description: "Total fundraising goal" },
    { term: "Fund Structure", value: "Delaware LLC", description: "Tax-efficient structure" }
  ];

  const timeline = [
    { phase: "Capital Raising", duration: "Q4 2024 - Q2 2025", status: "Active" },
    { phase: "Property Acquisition", duration: "Q2 2025", status: "Pending" },
    { phase: "Stabilization Period", duration: "Q2 2025 - Q4 2025", status: "Planned" },
    { phase: "Hold Period", duration: "Q2 2025 - Q2 2030", status: "Planned" },
    { phase: "Exit Strategy", duration: "Q2 2030", status: "Planned" }
  ];

  const feeStructure = [
    { type: "Acquisition Fee", rate: "1.0%", basis: "Of acquisition price", description: "One-time fee at closing" },
    { type: "Asset Management Fee", rate: "1.5%", basis: "Annual on invested capital", description: "Quarterly payments" },
    { type: "Promote Structure", rate: "20%", basis: "Above 8% preferred return", description: "Waterfall distribution" },
    { type: "Disposition Fee", rate: "1.0%", basis: "Of gross sales price", description: "At time of sale" }
  ];

  const distributions = [
    { priority: "1st", description: "Return of Capital", allocation: "100% to Limited Partners" },
    { priority: "2nd", description: "8% Preferred Return", allocation: "100% to Limited Partners" },
    { priority: "3rd", description: "Catch-up to 10%", allocation: "100% to General Partner" },
    { priority: "4th", description: "Remaining Profits", allocation: "80% LP / 20% GP" }
  ];

  const riskFactors = [
    "Market risk and potential for rental rate decline",
    "Interest rate fluctuations affecting financing costs",
    "Construction and development risks during value-add phase",
    "Concentration risk in single asset investment",
    "Liquidity constraints - no public market for interests",
    "General economic conditions affecting real estate markets"
  ];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link href="/" className="inline-flex items-center text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 mb-8">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-5xl">💼</div>
            <div>
              <h1 className="text-5xl font-semibold text-orange-900 dark:text-orange-300 tracking-tight">
                Investment Terms
              </h1>
              <p className="text-xl text-orange-700 dark:text-orange-400 mt-2">
                Detailed investment structure and legal framework
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Investment Structure */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Investment Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investmentStructure.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.term}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                  </div>
                  <span className="text-lg font-bold text-orange-900 dark:text-orange-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Investment Timeline</h3>
            <div className="space-y-4">
              {timeline.map((phase, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      phase.status === 'Active' ? 'bg-green-500' :
                      phase.status === 'Pending' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{phase.phase}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{phase.duration}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    phase.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    phase.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {phase.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Structure */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Fee Structure</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Fee Type</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Rate</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Basis</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructure.map((fee, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{fee.type}</td>
                      <td className="py-3 text-orange-900 dark:text-orange-300 font-medium">{fee.rate}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{fee.basis}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{fee.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribution Waterfall */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Distribution Waterfall</h3>
            <div className="space-y-4">
              {distributions.map((dist, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-orange-200 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-900 dark:text-orange-300">{dist.priority}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{dist.description}</h4>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{dist.allocation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Terms & Legal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Legal Terms</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fund Life</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">5 years + 2 year extensions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Governing Law</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Delaware</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax Status</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Pass-through entity</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Investor Rights</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Limited voting rights</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transfer Restrictions</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">GP consent required</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Investor Qualifications</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 mt-0.5">✓</div>
                  <span className="text-gray-600 dark:text-gray-400">Accredited Investor status required</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 mt-0.5">✓</div>
                  <span className="text-gray-600 dark:text-gray-400">Minimum net worth $1M+ (excluding primary residence)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 mt-0.5">✓</div>
                  <span className="text-gray-600 dark:text-gray-400">Annual income $200K+ individual / $300K+ joint</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 mt-0.5">✓</div>
                  <span className="text-gray-600 dark:text-gray-400">Sophisticated investor with real estate experience</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 mt-0.5">✓</div>
                  <span className="text-gray-600 dark:text-gray-400">Ability to bear economic risk of investment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Risk Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskFactors.map((risk, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="text-red-500 mt-0.5 text-sm">⚠️</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{risk}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Important:</strong> This is not an offer to sell securities. Any investment will be made only through a private placement memorandum and subscription agreement. Prospective investors should carefully review all risk factors and consult with their financial, legal, and tax advisors.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 