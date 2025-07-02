import Image from "next/image";
import Link from "next/link";

export default function InvestmentDashboard() {
  const investmentCards = [
    {
      id: "financial-returns",
      title: "Financial Returns",
      icon: "📈",
      keyMetrics: [
        { label: "10-Yr Equity Multiple", value: "2.8–3.2x" },
        { label: "3-Yr Equity Multiple", value: "2.1x" },
        { label: "Preferred Return", value: "7%" }
      ],
      summary: "Projected post-construction returns for OZ investors",
      gradient: "from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
      textColor: "text-emerald-900 dark:text-emerald-300"
    },
    {
      id: "property-overview", 
      title: "Property Overview",
      icon: "🏢",
      keyMetrics: [
        { label: "Total Units", value: "439" },
        { label: "Location", value: "Mesa, AZ" },
        { label: "Delivery", value: "2027" }
      ],
      summary: "The Edge on Main – 2-phase, transit-oriented development",
      gradient: "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
      textColor: "text-indigo-900 dark:text-indigo-300"
    },
    {
      id: "market-analysis",
      title: "Market Analysis", 
      icon: "🎯",
      keyMetrics: [
        { label: "Housing Shortage", value: "56K+ units" },
        { label: "Occupancy", value: "96%" },
        { label: "Rent Growth", value: "+8% YoY" }
      ],
      summary: "Phoenix-Mesa market with strong demand drivers",
      gradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20", 
      textColor: "text-purple-900 dark:text-purple-300"
    },
    {
      id: "investment-terms",
      title: "Investment Terms",
      icon: "💼",
      keyMetrics: [
        { label: "Min Investment", value: "$250K" },
        { label: "Hold Period", value: "10 Years" },
        { label: "Promote", value: "20% > 7%" }
      ],
      summary: "Tax-advantaged OZ structure with 7% preferred return",
      gradient: "from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20",
      textColor: "text-orange-900 dark:text-orange-300"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Hero Section with Property Image - 60% of viewport */}
      <section className="h-[60vh] relative overflow-hidden">
        {/* Property Image Background */}
        <div className="absolute inset-0">
          <Image
            src="/property-hero.jpg"
            alt="The Edge on Main - Premium Multifamily Property"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70 z-10" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white max-w-4xl px-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h1 className="text-5xl md:text-6xl font-semibold mb-4 tracking-tight">
                ACARA Opportunity Zone Fund I LLC
              </h1>
              <p className="text-xl md:text-2xl font-light opacity-90 mb-6">
                Premium Multifamily Investment Opportunity
              </p>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <span className="text-brand-accent">●</span>
                <span className="text-lg">Mesa, Arizona</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Cards Section - 40% of viewport */}
      <section className="h-[40vh] px-8 py-8">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
            {investmentCards.map((card, idx) => (
              <Link key={card.id} href={`/details/${card.id}`}>
                <div
                  className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-8 lg:p-10 h-full min-h-[260px] hover:scale-[1.03] transition-transform duration-300 cursor-pointer border border-black/5 dark:border-white/5 shadow-sm hover:shadow-lg animate-fadeIn`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{card.icon}</div>
                    <svg 
                      className={`w-5 h-5 ${card.textColor} opacity-60`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <h3 className={`text-xl font-semibold ${card.textColor} mb-4`}>
                    {card.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {card.keyMetrics.map((metric, metricIdx) => (
                      <div key={metricIdx} className="flex justify-between items-center">
                        <span className={`text-base ${card.textColor} opacity-70`}>
                          {metric.label}
                        </span>
                        <span className={`text-xl font-bold ${card.textColor}`}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <p className={`text-xs ${card.textColor} opacity-60 leading-relaxed`}>
                    {card.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
