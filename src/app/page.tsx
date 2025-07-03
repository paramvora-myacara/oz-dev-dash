import Image from "next/image";
import Link from "next/link";

export default function InvestmentDashboard() {
  const tickerMetrics = [
    { label: "10-Yr Equity Multiple", value: "2.8–3.2x", change: "+12%" },
    { label: "3-Yr Equity Multiple", value: "2.1x", change: "+8%" },
    { label: "Preferred Return", value: "7%", change: "Guaranteed" },
    { label: "Min Investment", value: "$250K", change: "Minimum" },
    { label: "Total Units", value: "439", change: "Phase I & II" },
    { label: "Location", value: "Mesa, AZ", change: "Prime Location" },
    { label: "Hold Period", value: "10 Years", change: "OZ Qualified" },
    { label: "Tax Benefit", value: "100%", change: "Tax-Free Exit" }
  ];

  const compellingReasons = [
    {
      title: "100% Tax-Free Growth",
      description: "Opportunity Zone benefits provide complete federal tax exemption on investment appreciation after 10-year hold period.",
      icon: "🚀",
      highlight: "Tax-Free Exit",
      gradient: "from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
      textColor: "text-emerald-900 dark:text-emerald-300"
    },
    {
      title: "Massive Housing Shortage",
      description: "Arizona faces 56,000+ unit housing deficit. Mesa is one of the fastest-growing cities with sustained population growth driving demand.",
      icon: "📊",
      highlight: "56K+ Unit Shortage",
      gradient: "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
      textColor: "text-indigo-900 dark:text-indigo-300"
    },
    {
      title: "Prime Transit Location",
      description: "Located directly adjacent to Country Club & Main Street Light Rail Station, providing unmatched regional connectivity and transit access.",
      icon: "🚆",
      highlight: "Light Rail Adjacent",
      gradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
      textColor: "text-purple-900 dark:text-purple-300"
    }
  ];

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
        { label: "Population Growth", value: "500K+" },
        { label: "Major Employers", value: "Banner, Boeing" }
      ],
      summary: "Phoenix-Mesa market with strong demographic drivers",
      gradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20", 
      textColor: "text-purple-900 dark:text-purple-300"
    },
    {
      id: "sponsor-profile",
      title: "Sponsor Profile",
      icon: "👥",
      keyMetrics: [
        { label: "Todd Vitzthum", value: "ACARA Management" },
        { label: "Jeff Richmond", value: "Operations & Strategy" },
        { label: "Michael Krueger", value: "Legal & Compliance" }
      ],
      summary: "Experienced team with proven OZ development expertise",
      gradient: "from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20",
      textColor: "text-orange-900 dark:text-orange-300"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header with Title */}
      <header className="absolute top-0 left-0 z-30 p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-white drop-shadow-lg tracking-tight">
          ACARA Opportunity Zone Fund I LLC
        </h1>
        <p className="text-lg text-white/90 mt-2 drop-shadow-md font-light">
          Premium Multifamily Investment Opportunity
        </p>
      </header>

      {/* Hero Image Section */}
      <section className="h-[50vh] relative overflow-hidden">
        <div className="absolute inset-0 p-8">
          <Image
            src="/property-hero.jpg"
            alt="The Edge on Main - Premium Multifamily Property"
            fill
            className="object-cover rounded-3xl"
            priority
          />
        </div>
      </section>

      {/* Stock Market Ticker */}
      <section className="py-6 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-hidden">
            <div className="flex animate-scroll">
              <div className="flex space-x-12 text-black dark:text-white whitespace-nowrap font-mono text-lg tracking-wider uppercase">
                {[...tickerMetrics, ...tickerMetrics].map((metric, idx) => (
                  <div key={idx} className="flex items-center space-x-3 whitespace-nowrap">
                    <span className="font-bold text-red-500">{metric.label}:</span>
                    <span className="font-bold text-green-500">{metric.value}</span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full font-sans text-gray-600 dark:text-gray-400 normal-case">
                      {metric.change}
                    </span>
                    <span className="text-gray-400 text-xl">•</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Compelling Reasons Cards */}
      <section className="py-16 px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-semibold text-center mb-12 text-black dark:text-white tracking-tight">
            Why Invest in The Edge on Main
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {compellingReasons.map((reason, idx) => (
              <div
                key={idx}
                className="glass-card bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-3xl p-8 h-full hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${idx * 200}ms` }}
              >
                <div className="text-5xl mb-6">{reason.icon}</div>
                <div className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70 mb-4">
                  {reason.highlight}
                </div>
                <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  {reason.title}
                </h3>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-lg font-light">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-16 px-8 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-semibold mb-8 text-black dark:text-white text-center tracking-tight">
            Executive Summary
          </h2>
          <div className="prose prose-lg max-w-none text-black/70 dark:text-white/70">
            <p className="text-xl leading-relaxed mb-6 italic">
              "What if we could solve Arizona's housing crisis while creating generational wealth for our investors?"
            </p>
            <p className="mb-6">
              This question sparked the vision for <strong>The Edge on Main</strong> — a transformative development 
              that stands at the intersection of unprecedented opportunity and pressing social need. In the heart 
              of Mesa, where the city's ambitious light rail expansion meets a community hungry for quality housing, 
              we're not just building apartments — we're architecting the future.
            </p>
            <p className="mb-6">
              Our <strong>two-phase journey</strong> delivers 439 new multifamily units directly adjacent to Mesa's 
              light rail station. Phase I introduces 161 residences with retail frontage, while Phase II adds 278 
              additional homes including family-sized layouts. This isn't just convenience — it's a lifestyle 
              transformation that connects residents to opportunity across the Phoenix Valley.
            </p>
            <p className="font-semibold text-lg">
              With all entitlements secured and Opportunity Zone incentives offering tax-free growth potential, 
              The Edge on Main represents the rare convergence where profit meets purpose in one of America's 
              fastest-growing markets.
            </p>
          </div>
        </div>
      </section>

      {/* Investment Cards Section */}
      <section className="py-16 px-4 bg-white dark:bg-black">
        <div className="max-w-8xl mx-auto">
          <h2 className="text-5xl font-semibold text-center mb-12 text-black dark:text-white tracking-tight">
            Investment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {investmentCards.map((card, idx) => (
              <Link key={card.id} href={`/details/${card.id}`}>
                <div
                  className={`glass-card bg-gradient-to-br ${card.gradient} border border-black/10 dark:border-white/10 rounded-2xl p-10 lg:p-12 h-full min-h-[320px] hover:scale-[1.03] transition-all duration-300 cursor-pointer animate-fadeIn`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{card.icon}</div>
                      <h3 className={`text-2xl font-bold ${card.textColor}`}>
                        {card.title}
                      </h3>
                    </div>
                    <svg 
                      className={`w-6 h-6 ${card.textColor} opacity-60`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <div className="space-y-0 mb-6">
                    {card.keyMetrics.map((metric, metricIdx) => (
                      <div key={metricIdx} className="flex justify-between items-center h-16">
                        <span className={`text-lg font-medium ${card.textColor} opacity-80`}>
                          {metric.label}
                        </span>
                        <span className={`text-2xl font-semibold ${card.textColor} text-right`}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <p className={`text-sm leading-relaxed font-light ${card.textColor} opacity-70`}>
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
