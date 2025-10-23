
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { 
  Rocket, BarChart3, Users as UsersIcon, TrendingUp, Building, Target, Users, Expand,
  MapPin, DollarSign, Briefcase, ShieldCheck, Zap, Handshake
} from "lucide-react";
import { useRouter } from "next/navigation";
import ImageCarousel from '@/components/ImageCarousel';
import Lightbox from '@/components/Lightbox';
import { getAvailableImages } from '@/utils/supabaseImages';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal, ConfirmationModal } from '@/components/AuthModal';


function OzRecapFundPage() {

  const [showContactModal, setShowContactModal] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
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
        const images = await getAvailableImages('oz-recap-fund-001', 'general');
        setHeroImages(images.slice(0, 5)); // Take the first 5 images
      } catch (error) {
        console.error('Error loading hero images:', error);
      }
    }

    loadHeroImages();
  }, []);

  const handleImageClick = (index: number) => {
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  const tickerMetrics = [
    { label: "Target Net IRR", value: "15%", change: "Post-Tax" },
    { label: "Targeted Equity Multiple", value: "2.5x+", change: "Significant Upside" },
    { label: "Preferred Return", value: "8%", change: "Accrued" },
    { label: "Min Investment", value: "$250K", change: "Accredited" },
    { label: "Deals in Fund", value: "3", change: "Multifamily" },
    { label: "Geography Mix", value: "CO & AZ", change: "Growth Markets" },
    { label: "Hold Period", value: "10+ Years", change: "OZ Qualified" },
    { label: "Management Fee", value: "2%", change: "Annual" }
  ];

  const compellingReasons = [
    {
      title: "De-Risked OZ Strategy",
      description: "Invest in newly built, Class-A multifamily properties below replacement cost. No development or construction risk.",
      icon: <ShieldCheck className="w-12 h-12" />,
      highlight: "No Development Risk",
      gradient: "from-blue-50/20 via-blue-100/20 to-indigo-200/20 dark:from-blue-900/10 dark:via-blue-800/10 dark:to-indigo-900/10",
      textColor: "text-blue-900 dark:text-blue-200",
      accentColor: "text-blue-800 dark:text-blue-300",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Powerful Tax Advantages",
      description: "A fully compliant Opportunity Zone fund offering tax deferral, reduction, and tax-free growth on your investment after a 10-year hold.",
      icon: <Zap className="w-12 h-12" />,
      highlight: "Tax-Free Appreciation",
      gradient: "from-orange-50/20 via-orange-100/20 to-red-200/20 dark:from-orange-900/10 dark:via-orange-800/10 dark:to-red-900/10",
      textColor: "text-orange-900 dark:text-orange-200",
      accentColor: "text-orange-800 dark:text-orange-300",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Strong Return Fundamentals",
      description: "Targeting a 15% Net IRR and 2.5x equity multiple with immediate cash flow and an investor-favorable structure. Sponsored by an experienced team with a $700M portfolio.",
      icon: <TrendingUp className="w-12 h-12" />,
      highlight: "15% Target IRR",
      gradient: "from-purple-50/20 via-purple-100/20 to-pink-200/20 dark:from-purple-900/10 dark:via-purple-800/10 dark:to-pink-900/10",
      textColor: "text-purple-900 dark:text-purple-200",
      accentColor: "text-purple-800 dark:text-purple-300",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  const investmentCards = [
    {
      id: "fund-structure",
      title: "Fund Structure",
      icon: <BarChart3 className="w-10 h-10" />,
      keyMetrics: [
        { label: "Target Capital Raise", value: "$40M" },
        { label: "Target Net IRR", value: "15%" },
        { label: "Target Equity Multiple", value: "2.5x+" }
      ],
      summary: "A Qualified Opportunity Fund with an investor-favorable promote structure.",
      gradient: "from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20",
      textColor: "text-emerald-900 dark:text-emerald-300",
      accentColor: "text-emerald-700 dark:text-emerald-400"
    },
    {
      id: "portfolio-projects", 
      title: "Portfolio Projects",
      icon: <Building className="w-10 h-10" />,
      keyMetrics: [
        { label: "Total Projects", value: "3" },
        { label: "Total Units", value: "614" },
        { label: "Asset Type", value: "Multifamily" }
      ],
      summary: "A portfolio of newly built, stabilized Class-A properties in high-growth markets.",
      gradient: "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
      textColor: "text-indigo-900 dark:text-indigo-300",
      accentColor: "text-indigo-700 dark:text-indigo-400"
    },
    {
      id: "how-investors-participate",
      title: "How Investors Participate", 
      icon: <Handshake className="w-10 h-10" />,
      keyMetrics: [
        { label: "Investor Type", value: "Accredited" },
        { label: "Minimum Investment", value: "$250,000" },
        { label: "Deployment Timeline", value: "180 Days" }
      ],
      summary: "Streamlined onboarding for accredited investors to deploy capital gains.",
      gradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20", 
      textColor: "text-purple-900 dark:text-purple-300",
      accentColor: "text-purple-700 dark:text-purple-400"
    },
    {
      id: "sponsor-profile",
      title: "Sponsor & Management",
      icon: <Users className="w-10 h-10" />,
      keyMetrics: [
        { label: "Developer/Sponsor", value: "JDP" },
        { label: "Fund Management", value: "ACARA" },
        { label: "Portfolio Value", value: "~$700M" }
      ],
      summary: "Vertically integrated team with deep expertise in development and OZ compliance.",
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

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white tracking-tight mb-6">
              OZ Recap Fund, LLC
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm">
                <MapPin className="w-4 h-4" />
                Colorado & Arizona
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <DollarSign className="w-4 h-4" />
                $250K Minimum Investment
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <Briefcase className="w-4 h-4" />
                ACARA Management
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
                onImageClick={handleImageClick}
              />
            ) : (
              <div className="bg-gray-200 dark:bg-gray-800 h-full rounded-3xl animate-pulse" />
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
                <span className="font-bold text-black dark:text-white">{metric.label}:</span>
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
              <div className="text-black dark:text-white">
                <p className="text-2xl leading-relaxed mb-8 italic font-light text-center">
                  &quot;A unique Opportunity Zone strategy focused on de-risked, newly built assets with strong cash flow and significant upside.&quot;
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg font-light">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span>Opportunity Zone <strong>Compliant</strong> Fund</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span>Newly Built <strong>Class-A</strong> Multifamily Properties</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span>Cash Flow <strong>Day One</strong></span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span>Deliverable <strong>Below</strong> Replacement Cost</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span><strong>No</strong> Development or Construction <strong>Risk</strong></span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span><strong>Experienced</strong> Sponsor (1,700+ Units)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span><strong>Strong Return</strong> Fundamentals</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span>Investor <strong>Favorable Structure</strong></span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span><strong>Professional</strong> OZ Management</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                    <span>Cycle-Driven <strong>Investment Thesis</strong></span>
                  </li>
                </ul>
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
                  href={`/oz-recap-fund/details/${card.id}`}
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
              onClick={() => handleRequestVaultAccess('oz-recap-fund')}
            >
              Request Vault Access
            </button>
            <a
              href={`${process.env.NEXT_PUBLIC_SCHEDULE_CALL_LINK}?endpoint=/oz-recap-fund`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
            >
              Schedule a Call
            </a>
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
      {isLightboxOpen && (
        <Lightbox
          images={heroImages}
          startIndex={lightboxStartIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}

export default function InvestmentDashboard() {
useEffect(() => {
    document.title = "OZ Recap Fund";
  }, []);  
return (
    <Suspense fallback={<div>Loading...</div>}>
      <OzRecapFundPage />
    </Suspense>
  )
}
