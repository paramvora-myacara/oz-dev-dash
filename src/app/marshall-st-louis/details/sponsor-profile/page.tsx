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
        const images = await getRandomImages('marshall-st-louis-001', 'general', 7);
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

  const trackRecord = [
    { label: "Years of Experience", value: "20+", description: "Combined experience in student housing development" },
    { label: "Total Investment", value: "$30.1M", description: "Capital requirement for The Marshall project" },
    { label: "Construction Progress", value: "99%", description: "Project completion as of December 2024" },
    { label: "Pre-Lease Rate", value: ">60%", description: "Strong leasing momentum before completion" }
  ];

  const teamMembers = [
    {
      name: "Todd Vitzthum",
      title: "President, ACARA",
      experience: "20+ years",
      background: "Corporate commercial real estate expert with extensive experience in institutional investments and fund management."
    },
    {
      name: "Jeff Richmond", 
      title: "Partner, ACARA",
      experience: "15+ years",
      background: "Business development specialist with deep expertise in opportunity zone investments and investor relations."
    },
    {
      name: "Aptitude Development Team",
      title: "Development Sponsor",
      experience: "10+ years",
      background: "Specialized student housing developers with proven track record in university-adjacent properties and complex urban developments."
    }
  ];

  const projects = [
    {
      name: "The Marshall St. Louis",
      location: "St. Louis, MO",
      units: "177 units / 508 beds",
      year: "2025",
      status: "Under Construction",
      returns: "17.7% IRR Target"
    },
    {
      name: "University Housing Portfolio",
      location: "Various Markets",
      units: "Multiple Projects",
      year: "2018-2023",
      status: "Completed",
      returns: "Strong Performance"
    },
    {
      name: "Mixed-Use Developments",
      location: "Secondary Markets",
      units: "Opportunity Zones",
      year: "2020-2024",
      status: "Operating",
      returns: "Tax-Advantaged"
    }
  ];

  const HeaderContent = () => (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <Link 
          href="/marshall-st-louis#investment-cards" 
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
              ACARA & Aptitude Development - Experienced Development Team
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header with Background Slideshow */}
      {loading ? (
        <section className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link 
              href="/marshall-st-louis#investment-cards" 
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
                  ACARA & Aptitude Development - Experienced Development Team
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
              href="/marshall-st-louis#investment-cards" 
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
                  ACARA & Aptitude Development - Experienced Development Team
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Company Overview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">About ACARA</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  ACARA provides accredited investors with the best direct investment opportunities available in the multifamily industry. 
                  We partner with top-tier development sponsors across the country to build apartment buildings and hold them long term.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our vertically integrated platform allows us to participate in everything from site selection to management, 
                  capturing layers of profit and ultimately providing strong, long-term cash flow.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Through our distinctive national service platform, we provide exclusive access to top investment opportunities, 
                  ensuring that our clients receive the best multifamily projects available.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Investment Strategy</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Secondary markets with compelling fundamentals</li>
                  <li>• Long-term holdings away from boom/bust cycles</li>
                  <li>• Building off-cycle, delivering on-cycle</li>
                  <li>• Opportunity Zone focus for tax advantages</li>
                  <li>• Institutional-quality sponsors and properties</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Track Record */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {trackRecord.map((record, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
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

          {/* Development Partners */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Development Partners</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Aptitude Development</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  <strong>Role:</strong> Development Sponsor and Project Manager
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Specialized student housing developer with extensive experience in university-adjacent properties. 
                  Leading The Marshall project from conception through completion with proven execution capabilities.
                </p>
              </div>
              <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Holland Construction</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  <strong>Role:</strong> General Contractor
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Experienced construction partner delivering The Marshall on schedule and on budget. 
                  Strong track record in complex urban student housing projects with quality finishes.
                </p>
              </div>
            </div>
          </div>

          {/* Previous Projects */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Development Portfolio</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Project Name</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Location</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Units</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Year</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Status</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Returns</th>
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
                            : project.status === 'Operating'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
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
            
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Investment Philosophy</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Our strategy focuses on identifying partners and projects in secondary markets with compelling fundamentals, 
                allowing us to create valuable long-term holdings away from traditional boom and bust markets. 
                This approach enables better navigation of market cycles by building off-cycle and delivering on-cycle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}