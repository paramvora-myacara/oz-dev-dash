'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Users, Award, TrendingUp, Building } from "lucide-react";
import BackgroundSlideshow from '../../../../components/BackgroundSlideshow';
import { getRandomImages } from '../../../../utils/supabaseImages';

export default function SponsorProfilePage() {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBackgroundImages() {
      try {
        console.log('[SponsorProfile] Starting to load background images...');
        // Get random 7 images for background slideshow
        const images = await getRandomImages('sogood-dallas-001', 'general', 7);
        console.log('[SponsorProfile] Loaded images:', images);
        setBackgroundImages(images);
      } catch (error) {
        console.error('[SponsorProfile] Error loading background images:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBackgroundImages();
  }, []);

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/sogood-dallas#investment-cards" 
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
              Sponsor Profile
            </h1>
            <p className="text-xl text-orange-200 mt-2">
              Hoque Global - Experienced Development Team
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const trackRecord = [
    { value: "14 Acres", description: "Owned land in downtown Dallas" },
    { value: "$3.7B", description: "Kay Bailey Hutchison Convention Center expansion nearby" },
    { value: "35,264 SF", description: "Innovation center pre-leased to GSV Ventures" },
    { value: "Master Plan", description: "Six additional phases planned for future OZ investment" }
  ];

  const teamMembers = [
    {
      name: "Mike Hoque",
      title: "Founder & Chairman, Hoque Global",
      experience: "20+ years",
      background: "Board member of Downtown Dallas Inc., Top 40 Under 40 business innovator, 2020 Dallas 500 Business Leader"
    },
    {
      name: "Arthur Santa-Maria",
      title: "Vice President, Hoque Global",
      experience: "15+ years",
      background: "Former Trammell Crow Company, CBRE, and JLL. MBA from UT Dallas, downtown Dallas resident since 2006"
    },
    {
      name: "Steven Shelley",
      title: "Partner, HG Residential Concept",
      experience: "15+ years",
      background: "5,000+ multifamily units developed, $2B+ transaction history, former Pillar Income Asset Management"
    }
  ];

  const projects = [
    {
      name: "SoGood Phase I",
      location: "Dallas, TX",
      units: "116",
      year: "2025",
      status: "Planning",
      returns: "Innovation Center"
    },
    {
      name: "SoGood Phase II",
      location: "Dallas, TX", 
      units: "272",
      year: "2025",
      status: "Planning",
      returns: "Retail Anchor"
    },
    {
      name: "RideCentric",
      location: "DFW Metro",
      units: "N/A",
      year: "1998",
      status: "Completed",
      returns: "Transportation"
    },
    {
      name: "iDesign Meetings",
      location: "DFW Metro",
      units: "N/A", 
      year: "2010",
      status: "Completed",
      returns: "Hospitality"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header with Background Slideshow */}
      {loading ? (
        <section className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/sogood-dallas#investment-cards" 
              className="inline-flex items-center text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 mb-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </Link>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl"><Users className="w-12 h-12 text-orange-600 dark:text-orange-400" /></div>
              <div>
                <h1 className="text-5xl font-semibold text-orange-900 dark:text-orange-300 tracking-tight">
                  Sponsor Profile
                </h1>
                <p className="text-xl text-orange-700 dark:text-orange-400 mt-2">
                  Hoque Global - Experienced Development Team
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : backgroundImages.length > 0 ? (
        <BackgroundSlideshow 
          images={backgroundImages}
          className="py-16"
          intervalMs={6000}
        >
          <HeaderContent />
        </BackgroundSlideshow>
      ) : (
        <section className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/sogood-dallas#investment-cards" 
              className="inline-flex items-center text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 mb-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </Link>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl"><Users className="w-12 h-12 text-orange-600 dark:text-orange-400" /></div>
              <div>
                <h1 className="text-5xl font-semibold text-orange-900 dark:text-orange-300 tracking-tight">
                  Sponsor Profile
                </h1>
                <p className="text-xl text-orange-700 dark:text-orange-400 mt-2">
                  Hoque Global - Experienced Development Team
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Sponsor Overview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Partnership Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">Hoque Global (Developer)</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Diversified investment company with primary focus on catalytic enterprises in real estate. Parent company of HG Real Estate Solutions, DRG Concepts, iDesign Meetings and RideCentric.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Recognized leader in revitalization, redevelopment, and re-energization of properties with a focus on community impact and sustainable urban development.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">ACARA Management (Fund Manager)</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Provides accredited investors with direct investment opportunities in the multifamily industry through partnerships with top-tier development sponsors.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Vertically integrated platform capturing layers of profit from site selection to management, providing strong long-term cash flow for investors.
                </p>
              </div>
            </div>
          </div>

          {/* Track Record */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {trackRecord.map((record, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-4xl font-bold text-orange-900 dark:text-orange-300 mb-4">{record.value}</p>
                <p className="text-sm text-orange-700 dark:text-orange-400">{record.description}</p>
              </div>
            ))}
          </div>

          {/* Key Team Members */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Leadership Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{member.name}</h4>
                  <p className="text-orange-600 dark:text-orange-400 font-medium mb-2">{member.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{member.experience} experience</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.background}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Projects */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Portfolio</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Project Name</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Location</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Units</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Year</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Status</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{project.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{project.location}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{project.units}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{project.year}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          project.status === 'Completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-orange-600 dark:text-orange-400">{project.returns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitive Advantages */}
          <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Competitive Advantages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Land Ownership</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Hoque Global already owns all 14 acres, eliminating acquisition risk and streamlining development</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tax Abatements</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Property tax abatement through Public Facility Corporation already established</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Pre-Leased Anchor</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Innovation center fully pre-leased to GSV Ventures, providing stable cash flow</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Local Expertise</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Deep Dallas market knowledge and established relationships with city officials</p>
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