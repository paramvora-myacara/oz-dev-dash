
'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Users, Briefcase, Star } from "lucide-react";
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import { getAvailableImages, getSupabaseImageUrl } from '@/utils/supabaseImages';

export default function SponsorProfilePage() {
  useEffect(() => {
    document.title = "Sponsor Profile – OZ Recap Fund";
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

  const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  const acaraManagement = {
    name: "ACARA Management™",
    role: "Compliance, Deployment, and Management",
    descriptionPoints: [
      "ACARA Management™ delivers accredited investors exclusive access to recapitalized Opportunity Zone projects with proven fundamentals.",
      "Our vertically integrated platform combines deep expertise in institutional brokerage, law, tax advisory, and capital markets, giving investors confidence that every layer of the recapitalization process is managed with precision and discipline."
    ],
    team: [
      { name: "Todd Vitzthum", title: "Managing Partner", roleDetail: "Corporate Commercial Real Estate", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/fund-manager', 'todd.jpg') },
      { name: "Michael Krueger", title: "Managing Partner", roleDetail: "Partner / Corporate & Securities Law, Lucosky Brookman, LLP", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/fund-manager', 'michael.jpg') },
      { name: "Dr. Jeff Richmond", title: "Managing Partner", roleDetail: "Operations", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/fund-manager', 'jeff.jpg') },
    ]
  };

  const jdp = {
    name: "Jackson Dearborn Partners (JDP)",
    role: "Developer / Sponsor",
    descriptionPoints: [
        "Jackson Dearborn Partners was founded in 2014 to develop and acquire a nationwide portfolio of multifamily and student housing properties.",
        "The partners have been working together since 2007 and formalized the partnership to bring construction, management, acquisition, and development services all under one roof.",
        "With a current portfolio valuation of nearly $700 million, JDP opened an office in Scottsdale, AZ in 2020 and Denver, CO in 2021 to service development growth in Colorado and Arizona, the two primary focus markets."
    ],
    team: [
        { name: "Ryan Tobias", title: "Managing Partner", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'ryan.png') },
        { name: "Chris Saunders", title: "Managing Partner", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'chris.png') },
        { name: "Shaun Buss", title: "Managing Partner", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'shaun.png') },
        { name: "Todd Giampetroni", title: "Acquisitions", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'todd.png') },
        { name: "Garrett Kerr", title: "Finance", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'garrett.png') },
        { name: "Nick Griffin", title: "Creative", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'nick.png') },
        { name: "Mark Czys", title: "Investor Relations", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'mark.png') },
        { name: "Dane Olmstead", title: "Development", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'dane.png') },
        { name: "Shannon Collins", title: "Acquisitions", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'shannon.png') },
        { name: "Raymond Zanca", title: "Head of Capital Markets", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'raymond.png') },
        { name: "Sean Lyons", title: "Investor Relations", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'sean.png') },
        { name: "Jake Berhorst", title: "Senior Analyst", image: getSupabaseImageUrl('oz-recap-fund-001', 'sponsor-profile/developer-sponsor', 'jake.png') },
    ]
  };

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/oz-recap-fund#investment-cards" 
          className="inline-flex items-center text-orange-300 hover:text-orange-100 mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-5xl"><Users className="w-12 h-12 text-orange-400" /></div>
          <div>
            <h1 className="text-5xl font-semibold text-orange-300 tracking-tight">
              Sponsor & Management
            </h1>
            <p className="text-xl text-orange-200 mt-2">
              Experienced Team with a Proven Track Record
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
          <div className="grid grid-cols-1 gap-12">
            
            {/* ACARA Management Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left side: Description */}
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <Star className="w-8 h-8 text-orange-500" />
                    <div>
                      <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-300">{acaraManagement.name}</h2>
                      <p className="text-lg font-semibold text-orange-700 dark:text-orange-400">{acaraManagement.role}</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {acaraManagement.descriptionPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                        <span className="text-lg text-gray-600 dark:text-gray-400">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Right side: Team grid */}
                <div>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-8 text-center">
                    {acaraManagement.team.map((member, idx) => (
                      <div key={idx}>
                        <div className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden bg-gray-200">
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover scale-110" />
                        </div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{member.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{member.roleDetail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* JDP Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left side: Description */}
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <Briefcase className="w-8 h-8 text-orange-500" />
                    <div>
                      <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-300">{jdp.name}</h2>
                      <p className="text-lg font-semibold text-orange-700 dark:text-orange-400">{jdp.role}</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {jdp.descriptionPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-4 mt-[10px] flex-shrink-0" />
                        <span className="text-lg text-gray-600 dark:text-gray-400">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Right side: Team grid */}
                <div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-center">
                    {jdp.team.map((member, idx) => (
                      <div key={idx}>
                        <div className="w-16 h-16 rounded-full mx-auto mb-1 overflow-hidden bg-gray-200">
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover scale-110" />
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
