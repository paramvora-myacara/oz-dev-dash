import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import ThemeToggle from "../components/theme-toggle";

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
      gradient: "from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20",
      textColor: "text-emerald-900 dark:text-emerald-300",
      accentColor: "text-emerald-700 dark:text-emerald-400"
    },
    {
      title: "Massive Housing Shortage",
      description: "Arizona faces 56,000+ unit housing deficit. Mesa is one of the fastest-growing cities with sustained population growth driving demand.",
      icon: "📊",
      highlight: "56K+ Unit Shortage",
      gradient: "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
      textColor: "text-indigo-900 dark:text-indigo-300",
      accentColor: "text-indigo-700 dark:text-indigo-400"
    },
    {
      title: "Prime Transit Location",
      description: "Located directly adjacent to Country Club & Main Street Light Rail Station, providing unmatched regional connectivity and transit access.",
      icon: "🚆",
      highlight: "Light Rail Adjacent",
      gradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
      textColor: "text-purple-900 dark:text-purple-300",
      accentColor: "text-purple-700 dark:text-purple-400"
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
      gradient: "from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20",
      textColor: "text-emerald-900 dark:text-emerald-300",
      accentColor: "text-emerald-700 dark:text-emerald-400"
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
      textColor: "text-indigo-900 dark:text-indigo-300",
      accentColor: "text-indigo-700 dark:text-indigo-400"
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
      textColor: "text-purple-900 dark:text-purple-300",
      accentColor: "text-purple-700 dark:text-purple-400"
    },
    {
      id: "sponsor-profile",
      title: "Sponsor Profile",
      icon: "👥",
      keyMetrics: [
        { label: "Fund Name", value: "ACARA OZ Fund I" },
        { label: "Developer", value: "Juniper Mountain Capital" },
        { label: "Track Record", value: "1,158+ Units Delivered" }
      ],
      summary: "Experienced team with proven OZ development expertise",
      gradient: "from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20",
      textColor: "text-orange-900 dark:text-orange-300",
      accentColor: "text-orange-700 dark:text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header with Title */}
      <header className="absolute top-0 left-0 right-0 z-30 p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-black dark:text-white drop-shadow-lg tracking-tight">
              ACARA Opportunity Zone Fund I LLC
            </h1>
            <p className="text-lg text-black/70 dark:text-white/70 mt-2 drop-shadow-md font-light">
              Premium Multifamily Investment Opportunity
            </p>
          </div>
          <ThemeToggle />
        </div>
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
        <Marquee 
          speed={50}
          gradient={false}
          pauseOnHover={true}
          className="text-black dark:text-white font-mono text-lg tracking-wider uppercase"
        >
          {tickerMetrics.map((metric, idx) => (
            <div key={idx} className="flex items-center space-x-3 whitespace-nowrap mx-6">
              <span className="font-bold text-red-500">{metric.label}:</span>
              <span className="font-bold text-green-500">{metric.value}</span>
              <span className="text-xs bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full font-sans text-black/60 dark:text-white/60 normal-case">
                {metric.change}
              </span>
              <span className="text-black/40 dark:text-white/40 text-xl">•</span>
            </div>
          ))}
        </Marquee>
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
                className={`glass-card rounded-3xl p-8 bg-gradient-to-br ${reason.gradient} border border-black/10 dark:border-white/10 hover:scale-[1.02] transition-all duration-300 animate-fadeIn flex flex-col`}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="text-5xl mb-6">{reason.icon}</div>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 ${reason.textColor} mb-4`}>
                  {reason.highlight}
                </div>
                <h3 className={`text-2xl font-semibold ${reason.textColor} mb-4`}>
                  {reason.title}
                </h3>
                <p className={`${reason.accentColor} leading-relaxed text-lg font-light`}>
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
          <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-black/10 dark:border-white/10">
            <div className="prose prose-lg max-w-none text-black/70 dark:text-white/70">
              <p className="text-xl leading-relaxed mb-6 italic font-light">
                &quot;What if we could solve Arizona&apos;s housing crisis while creating generational wealth for our investors?&quot;
              </p>
              <p className="mb-6 font-light">
                This question sparked the vision for <strong>The Edge on Main</strong> — a transformative development 
                that stands at the intersection of unprecedented opportunity and pressing social need. In the heart 
                of Mesa, where the city&apos;s ambitious light rail expansion meets a community hungry for quality housing, 
                we&apos;re not just building apartments — we&apos;re architecting the future.
              </p>
              <p className="mb-6 font-light">
                Our <strong>two-phase journey</strong> delivers 439 new multifamily units directly adjacent to Mesa&apos;s 
                light rail station. Phase I introduces 161 residences with retail frontage, while Phase II adds 278 
                additional homes including family-sized layouts. This isn&apos;t just convenience — it&apos;s a lifestyle 
                transformation that connects residents to opportunity across the Phoenix Valley.
              </p>
              <p className="font-semibold text-lg text-black dark:text-white">
                With all entitlements secured and Opportunity Zone incentives offering tax-free growth potential, 
                The Edge on Main represents the rare convergence where profit meets purpose in one of America&apos;s 
                fastest-growing markets.
              </p>
            </div>
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
                  className={`glass-card rounded-3xl p-8 bg-gradient-to-br ${card.gradient} border border-black/10 dark:border-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-fadeIn flex flex-col h-full min-h-[320px]`}
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
                  
                  <div className="space-y-4 mb-6 flex-1">
                    {card.keyMetrics.map((metric, metricIdx) => (
                      <div key={metricIdx} className="flex items-center justify-between">
                        <span className={`text-base font-medium ${card.accentColor}`}>
                          {metric.label}
                        </span>
                        <span className="text-lg font-semibold text-black dark:text-white">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <p className={`text-sm leading-relaxed font-light ${card.accentColor}`}>
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
