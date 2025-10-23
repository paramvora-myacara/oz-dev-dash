
'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Handshake, UserCheck, FileText, Clock } from "lucide-react";
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import { getAvailableImages } from '@/utils/supabaseImages';

export default function HowToParticipatePage() {
  useEffect(() => {
    document.title = "How to Participate – OZ Recap Fund";
  }, []);

  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        const images = await getAvailableImages('oz-recap-fund-001', 'general');
        setBackgroundImages(images.slice(0, 7)); // Take the first 7 images
      } catch (error) {
        console.error('Error loading background images:', error);
      }
    }

    loadBackgroundImages();
  }, []);

  const participationSteps = [
    {
      title: "Eligibility & Onboarding",
      icon: <UserCheck className="w-8 h-8" />,
      points: [
        "Accredited investors only, pursuant to Regulation D Rule 506(c) offering standards.",
        "Structured as a Qualified Opportunity Fund (QOF) with streamlined onboarding, subscription documents, and KYC/AML compliance built to institutional expectations.",
        "Investor commitments processed through licensed broker-dealers and third-party fund administration, ensuring regulatory alignment and transparency."
      ]
    },
    {
        title: "Reporting, Liquidity, & Exit Framework",
        icon: <FileText className="w-8 h-8"/>,
        points: [
            "Annual reporting: asset-level performance, fund-level financials, and Opportunity Zone compliance certification.",
            "Distributions anticipated within 6-18 months post-investment, with projected 5-8% stabilized annual cash yield once recapitalizations are completed.",
            "Liquidity designed around OZ requirements, with primary exit via sale or refinance at Year 10+ to capture full tax-free appreciation on gains.",
            "Secondary liquidity solutions may be evaluated as the fund matures, though strategy remains anchored in long-term OZ compliance and return maximization."
        ]
    },
    {
        title: "Timeline to Deploy Gains",
        icon: <Clock className="w-8 h-8"/>,
        points: [
            "Investors have 180 days from the realization of eligible federal capital gains to subscribe into the QOF to secure deferral benefits.",
            "ACARA Management coordinates deployment into recapitalization opportunities, ensuring funds are placed into qualified projects within IRS timelines.",
            "Early commitments are directed into the fund's secured projects ($75M in equity), with additional capital allocated to pipeline opportunities under active diligence."
        ]
    }
  ];
  
  const fundDetails = [
    { label: "Fund", value: "OZ RECAP FUND, LLC, a Delaware Limited Liability Company" },
    { label: "General Partner", value: "JDP GP Holdings, LLC, an Illinois Limited Liability Company" },
    { label: "Fund Offering", value: "$40,000,000 in Investor Membership Interests" },
    { label: "Minimum Investment", value: "$250,000" },
    { label: "Term", value: "The term of this investment is expected to be 10 years with up to five (5), one (1) year extensions." },
    { label: "Closing", value: "Open until full." },
  ];

  const fundAdminDetails = [
    { label: "Capital Call Schedule", value: "Each investment to be funded up front pursuant to QOZ timelines and regulations." },
    { label: "Distributions", value: "Distributions to occur quarterly upon stabilization." },
    { label: "Fund Management Fee", value: "Annual Fund management fee of 2% of the total Fund paid to Fund Manager." },
    { label: "Investor Qualifications", value: "This offering is being made pursuant to Rule 506(c) of Regulation D under the Securities Act of 1933 and is open only to verified Accredited Investors." },
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/oz-recap-fund#investment-cards" 
          className="inline-flex items-center text-purple-300 hover:text-purple-100 mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-5xl"><Handshake className="w-12 h-12 text-purple-400" /></div>
          <div>
            <h1 className="text-5xl font-semibold text-purple-300 tracking-tight">
              How Investors Participate
            </h1>
            <p className="text-xl text-purple-200 mt-2">
              Onboarding, Reporting, and Timelines
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      <BackgroundSlideshow 
          images={backgroundImages}
          className="py-16"
          intervalMs={6000}
        >
        <HeaderContent />
      </BackgroundSlideshow>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            {participationSteps.map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex items-start space-x-6">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-300 mb-4">{step.title}</h3>
                  <ul className="space-y-3">
                    {step.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                        <span className="text-lg text-gray-600 dark:text-gray-400">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 px-8">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-8 text-center">Fund Details</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                        {fundDetails.map((item, idx) => (
                            <div key={idx}>
                                <h4 className="font-semibold text-lg text-purple-900 dark:text-purple-300">{item.label}</h4>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-6">
                        {fundAdminDetails.map((item, idx) => (
                            <div key={idx}>
                                <h4 className="font-semibold text-lg text-purple-900 dark:text-purple-300">{item.label}</h4>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
