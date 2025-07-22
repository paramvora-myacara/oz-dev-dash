'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { 
  Rocket, BarChart3, Users as UsersIcon, TrendingUp, Building, Target, Users, Expand,
  MapPin, DollarSign, Briefcase 
} from "lucide-react";
import { useRouter } from "next/navigation";
import ImageCarousel from '../../components/ImageCarousel';
import { getRandomImages } from '../../utils/supabaseImages';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal, ConfirmationModal } from '@/components/AuthModal';


function MarshallStLouisPage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const router = useRouter();
  const {
    isAuthModalOpen,
    isConfirmationModalOpen,
    authError,
    isLoading,
    handleRequestVaultAccess,
    handleSignInOrUp,
    closeModal,
  } = useAuth();
  
  // Load hero images
  useEffect(() => {
    async function loadHeroImages() {
      try {
        const images = await getRandomImages('marshall-st-louis-001', 'general', 5);
        setHeroImages(images);
      } catch (error) {
        console.error('Error loading hero images:', error);
      }
    }

    loadHeroImages();
  }, []);

  // Store scroll position before navigation and restore on return
  useEffect(() => {
    // Save scroll position before leaving the page
    const handleBeforeUnload = () => {
      sessionStorage.setItem('dashboardScrollPosition', window.scrollY.toString());
    };

    // Save scroll position on scroll (debounced)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem('dashboardScrollPosition', window.scrollY.toString());
      }, 100);
    };

    // Handle browser back/forward navigation
    const handlePopState = () => {
      setTimeout(() => {
        const savedScrollPosition = sessionStorage.getItem('dashboardScrollPosition');
        if (savedScrollPosition) {
          window.scrollTo(0, parseInt(savedScrollPosition));
        }
      }, 100);
    };

    // Check if we're returning from a detail page (has #investment-cards hash)
    if (window.location.hash === '#investment-cards') {
      // Coming from a detail page, scroll to investment cards
      setTimeout(() => {
        const cardsSection = document.getElementById('investment-cards');
        if (cardsSection) {
          cardsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Regular page load, restore scroll position
      const savedScrollPosition = sessionStorage.getItem('dashboardScrollPosition');
      if (savedScrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition));
        }, 100);
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const tickerMetrics = [
    { label: "10-Yr Equity Multiple", value: "4.29x", change: "+329%" },
    { label: "IRR Target", value: "17.7%", change: "Strong" },
    { label: "Preferred Return", value: "8%", change: "Guaranteed" },
    { label: "Min Investment", value: "$250K", change: "Minimum" },
    { label: "Total Units", value: "177", change: "508 Beds" },
    { label: "Location", value: "St. Louis, MO", change: "Prime Location" },
    { label: "Hold Period", value: "10 Years", change: "OZ Qualified" },
    { label: "Tax Benefit", value: "100%", change: "Tax-Free Exit" }
  ];

  const compellingReasons = [
    {
      title: "Strategic University Location",
      description: "Located just 600 feet from St. Louis University with 15,200 students experiencing record enrollment growth. Adjacent to the $300M City Foundry mixed-use development.",
      icon: <Rocket className="w-12 h-12" />,
      highlight: "600ft from SLU Campus",
      gradient: "from-orange-50/20 via-orange-100/20 to-red-200/20 dark:from-orange-900/10 dark:via-orange-800/10 dark:to-red-900/10",
      textColor: "text-orange-900 dark:text-orange-200",
      accentColor: "text-orange-800 dark:text-orange-300",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Strong Housing Demand",
      description: "SLU has achieved record enrollment for 2023 and 2024, up nearly 25% since 2020, creating critical student housing undersupply in the market.",
      icon: <BarChart3 className="w-12 h-12" />,
      highlight: "Critical Housing Shortage",
      gradient: "from-blue-50/20 via-blue-100/20 to-indigo-200/20 dark:from-blue-900/10 dark:via-blue-800/10 dark:to-indigo-900/10",
      textColor: "text-blue-900 dark:text-blue-200",
      accentColor: "text-blue-800 dark:text-blue-300",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Innovation District Proximity",
      description: "0.5 miles from Cortex Innovation District (200-acre tech hub with 5,700+ jobs) and 0.6 miles from BJC/Washington University Medical Campus ($1B expansion).",
      icon: <UsersIcon className="w-12 h-12" />,
      highlight: "Tech & Medical Hub Access",
      gradient: "from-purple-50/20 via-purple-100/20 to-pink-200/20 dark:from-purple-900/10 dark:via-purple-800/10 dark:to-pink-900/10",
      textColor: "text-purple-900 dark:text-purple-200",
      accentColor: "text-purple-800 dark:text-purple-300",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  const investmentCards = [
    {
      id: "financial-returns",
      title: "Financial Returns",
      icon: <TrendingUp className="w-10 h-10" />,
      keyMetrics: [
        { label: "10-Yr Equity Multiple", value: "4.29x" },
        { label: "IRR Target", value: "17.7%" },
        { label: "Preferred Return", value: "8%" }
      ],
      summary: "Projected pre-tax returns for OZ investors over 10-year hold",
      gradient: "from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20",
      textColor: "text-emerald-900 dark:text-emerald-300",
      accentColor: "text-emerald-700 dark:text-emerald-400"
    },
    {
      id: "property-overview", 
      title: "Property Overview",
      icon: <Building className="w-10 h-10" />,
      keyMetrics: [
        { label: "Total Units", value: "177" },
        { label: "Bedrooms", value: "508" },
        { label: "Occupancy", value: "May 2025" }
      ],
      summary: "The Marshall St. Louis – Student housing adjacent to SLU campus",
      gradient: "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
      textColor: "text-indigo-900 dark:text-indigo-300",
      accentColor: "text-indigo-700 dark:text-indigo-400"
    },
    {
      id: "market-analysis",
      title: "Market Analysis", 
      icon: <Target className="w-10 h-10" />,
      keyMetrics: [
        { label: "SLU Enrollment", value: "15,200+" },
        { label: "Growth Rate", value: "25%" },
        { label: "Pre-Lease Rate", value: ">60%" }
      ],
      summary: "Strong market fundamentals driven by university growth",
      gradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20", 
      textColor: "text-purple-900 dark:text-purple-300",
      accentColor: "text-purple-700 dark:text-purple-400"
    },
    {
      id: "sponsor-profile",
      title: "Sponsor Profile",
      icon: <Users className="w-10 h-10" />,
      keyMetrics: [
        { label: "Fund Name", value: "Aptitude St. Louis LLC" },
        { label: "Developer", value: "Aptitude Development" },
        { label: "Track Record", value: "20+ Years Experience" }
      ],
      summary: "Experienced team with proven student housing development expertise",
      gradient: "from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20",
      textColor: "text-orange-900 dark:text-orange-300",
      accentColor: "text-orange-700 dark:text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1920px] mx-auto">
        {/* Header with Title */}
        <header className="relative z-30 p-4 md:p-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Portfolio
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white tracking-tight mb-6">
              The Marshall St. Louis
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm">
                <MapPin className="w-4 h-4" />
                St. Louis, MO
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <DollarSign className="w-4 h-4" />
                $250K Minimum Investment
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <Briefcase className="w-4 h-4" />
                Aptitude St. Louis LLC
              </span>
            </div>
          </div>
        </header>

        {/* Hero Image Section */}
        <section className="h-[30vh] sm:h-[40vh] md:h-[50vh] relative overflow-hidden px-4 md:px-8">
          <div className="absolute inset-0">
            {heroImages.length > 0 ? (
              <ImageCarousel
                images={heroImages}
                className="h-full rounded-3xl"
                intervalMs={4000}
                autoplay={true}
              />
            ) : (
              <Image
                src="/property-hero.jpg"
                alt="The Marshall St. Louis - Premium Student Housing Property"
                fill
                className="object-cover rounded-3xl"
                priority
              />
            )}
          </div>
        </section>

        {/* Stock Market Ticker */}
        <section className="py-4 md:py-6 bg-white dark:bg-black">
          <Marquee 
            speed={50}
            gradient={false}
            pauseOnHover={true}
            className="text-sm sm:text-base md:text-lg font-mono tracking-wider uppercase text-black dark:text-white"
          >
            {tickerMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap mx-4 sm:mx-6">
                <span className="font-bold text-red-500">{metric.label}:</span>
                <span className="font-bold text-green-500">{metric.value}</span>
                <span className="text-xs bg-black/10 dark:bg-white/10 px-2 sm:px-3 py-1 rounded-full font-sans text-black/60 dark:text-white/60 normal-case">
                  {metric.change}
                </span>
                <span className="text-black/40 dark:text-white/40 text-xl">•</span>
              </div>
            ))}
          </Marquee>
        </section>

        {/* Three Compelling Reasons Cards */}
        <section className="py-12 md:py-20 px-4 md:px-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 md:mb-16 text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black dark:text-white mb-6 tracking-tight">
                <span className="text-blue-500">OZ</span>zie AI <em>Says</em>
              </h2>
              <p className="text-xl md:text-2xl text-black/70 dark:text-white/70 font-light max-w-3xl mx-auto">
                Upon reviewing this deal, here are the top 3 reasons to invest in this project
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {compellingReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className={`relative flex flex-col items-center justify-center text-center rounded-3xl p-10 min-h-[340px] transition-all duration-500 animate-fadeIn
                    bg-white/10 dark:bg-white/5 backdrop-blur-xl
                    border border-white/30 dark:border-white/10
                    shadow-2xl hover:shadow-[0_8px_40px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.08)]
                    hover:scale-[1.03]`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Icon */}
                  <div className={`mb-8 flex items-center justify-center w-16 h-16 rounded-full
                    ${reason.iconColor} bg-white/30 dark:bg-white/10 shadow-lg text-4xl`}>
                    {reason.icon}
                  </div>
                  {/* Title */}
                  <h3 className={`text-2xl md:text-3xl font-extrabold mb-3 tracking-tight ${reason.textColor}`}>{reason.title}</h3>
                  {/* Description */}
                  <p className={`text-base md:text-lg font-light ${reason.accentColor} opacity-90`}>{reason.description}</p>
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
              <div className="prose prose-xl max-w-none text-black dark:text-white">
                <p className="text-2xl leading-relaxed mb-6 italic font-light">
                  &quot;What if we could capitalize on America&apos;s student housing crisis while generating exceptional returns for our investors?&quot;
                </p>
                <p className="mb-6 font-light text-lg">
                  This question sparked the vision for <strong>The Marshall St. Louis</strong> — a transformative student housing development 
                  that stands at the intersection of unprecedented opportunity and critical market need. Located just 600 feet 
                  from St. Louis University&apos;s main campus, we&apos;re not just building student housing — we&apos;re architecting the future of university life.
                </p>
                <p className="mb-6 font-light text-lg">
                  Our <strong>177-unit development</strong> delivers 508 premium bedrooms directly adjacent to one of the nation&apos;s most prestigious universities. 
                  With SLU enrollment hitting record highs and a critical housing shortage, The Marshall represents the rare convergence 
                  where student demand meets institutional-quality development in a qualified Opportunity Zone.
                </p>
                <p className="font-semibold text-xl text-black dark:text-white">
                  With construction 99% complete, &gt;60% pre-leased, and Opportunity Zone incentives offering tax-free growth potential, 
                  The Marshall St. Louis represents the ideal intersection where exceptional returns meet transformative tax benefits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Cards Section */}
        <section id="investment-cards" className="py-8 md:py-16 px-4 md:px-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black dark:text-white mb-4">
                Due Diligence Vault
              </h2>
              <p className="text-lg md:text-xl text-black/70 dark:text-white/70 font-light max-w-3xl mx-auto">
                Click any card to learn more and access documentation
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {investmentCards.map((card, idx) => (
                <Link
                  key={idx}
                  href={`/marshall-st-louis/details/${card.id}`}
                  className={`glass-card rounded-3xl p-8 bg-gradient-to-br ${card.gradient} border border-gray-200 dark:border-white/20 shadow-md dark:shadow-xl shadow-gray-200/50 dark:shadow-white/5 hover:shadow-lg dark:hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fadeIn group relative overflow-hidden`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 dark:from-white/[0.04] dark:to-white/[0.02] pointer-events-none" />
                  <div className="relative flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`${card.textColor}`}>{card.icon}</div>
                      <h3 className={`text-2xl font-semibold ${card.textColor}`}>
                        {card.title}
                      </h3>
                    </div>
                    <Expand className={`w-6 h-6 ${card.textColor} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  
                  <div className="space-y-8 mb-6 flex-1">
                    {card.keyMetrics.map((metric, metricIdx) => (
                      <div key={metricIdx} className="flex items-center justify-between">
                        <span className={`text-lg font-medium ${card.accentColor}`}>
                          {metric.label}
                        </span>
                        <span className="text-xl font-semibold text-black dark:text-white">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <p className={`text-base leading-relaxed font-light ${card.accentColor}`}>
                    {card.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Buttons */}
        <section className="py-8 md:py-16 px-4 md:px-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-center">
            <button
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
              onClick={handleRequestVaultAccess}
            >
              Request Vault Access
            </button>
            <button
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
              onClick={() => setShowContactModal(true)}
            >
              Contact the Developer
            </button>
          </div>
        </section>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        onSubmit={handleSignInOrUp}
        isLoading={isLoading}
        authError={authError}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}

export default function InvestmentDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarshallStLouisPage />
    </Suspense>
  )
}