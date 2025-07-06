import Link from "next/link";
import { Users, Building, User, Scale, Construction, Mountain, HardHat } from "lucide-react";

export default function SponsorProfilePage() {
  const teamMembers = [
    {
      name: "Todd Vitzthum",
      role: "ACARA Management",
      expertise: "Real estate strategy, capital structuring, and fund deployment for high-net-worth investors and institutional partners.",
      image: <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
    },
    {
      name: "Michael Krueger",
      role: "Partner, Lucosky Brookman Law Firm",
      expertise: "SEC compliance, Opportunity Zone regulations, and legal structuring for complex real estate and private equity transactions.",
      image: <Scale className="w-8 h-8 text-purple-600 dark:text-purple-400" />
    },
    {
      name: "Jeff Richmond",
      role: "ACARA Management",
      expertise: "Operations, real estate execution, and investor strategy across private equity, development, and capital markets initiatives.",
      image: <Construction className="w-8 h-8 text-orange-600 dark:text-orange-400" />
    }
  ];

  const trackRecord = [
    { category: "Developed / Sold", units: 386, projects: 4, locations: ["Salt Lake City, UT"] },
    { category: "Developed / Operating", units: 824, projects: 7, locations: ["Salt Lake City, UT", "Clearfield, UT"] },
    { category: "Under Construction", units: 77, projects: 1, locations: ["Phoenix, AZ"] },
    { category: "Upcoming Development", units: 670, projects: 4, locations: ["Sandpoint, ID", "Tucson, AZ", "Mesa, AZ"] }
  ];

  const projectHighlights = [
    {
      name: "Bookbinder Apartments",
      location: "Salt Lake City, UT",
      units: 115,
      stories: 7,
      status: "Completed & Refinanced",
      description: "OZ project completed, stabilized and refinanced with Agency debt aligned with 10-year OZ window. Maintains near 100% occupancy.",
      features: ["In-unit washers/dryers", "Quartz countertops", "Two-level parking garage", "Courtyard with BBQ & fireplace"]
    },
    {
      name: "Greenprint at West Temple",
      location: "Salt Lake City, UT",
      units: 145,
      buildings: 3,
      status: "Developed, Stabilized & Sold",
      description: "Opportunity zone project was developed, stabilized and sold. Original capital gains were rolled into new OZ project.",
      features: ["Zero parking stalls", "Transit-oriented development", "Affordable urban housing", "High density efficiency"]
    }
  ];

  const contractorInfo = {
    name: "Ironmark Building Company",
    founded: 2011,
    completed: "$1+ billion",
    expertise: ["Hospitality", "Mixed-use developments", "Retail", "Restaurants", "Multifamily housing"],
    description: "Locally based general contractor with deep knowledge of Phoenix Valley market dynamics, permitting landscape, and development cycles."
  };

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link 
            href="/#investment-cards" 
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
                ACARA Management & Juniper Mountain Capital Partnership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* ACARA Management Overview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl"><Building className="w-10 h-10 text-gray-600 dark:text-gray-400" /></div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">ACARA Management</h3>
                <p className="text-orange-700 dark:text-orange-400">Fund Manager</p>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              ACARA Management™ is a boutique private equity firm specializing in Opportunity Zone investments for 
              ultra-high-net-worth individuals, family offices, and institutional-level investors.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              We connect capital with high-impact real estate projects through a curated network of proven 
              developers and seasoned sponsors. Every deal we engage is selected for its potential to deliver 
              meaningful returns - both financially and in the communities we serve.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              With decades of experience across real estate development, capital markets, and fund strategy, our 
              team is built to help investors capture the full value of OZ incentives with clarity, control, and confidence.
            </p>
          </div>

          {/* Team Members */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">Leadership Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <div className="text-4xl mb-4">{member.image}</div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{member.name}</h4>
                  <p className="text-orange-700 dark:text-orange-400 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{member.expertise}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Juniper Mountain Capital */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl"><Mountain className="w-10 h-10 text-green-600 dark:text-green-400" /></div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Juniper Mountain Capital</h3>
                <p className="text-orange-700 dark:text-orange-400">Development Partner</p>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Juniper Mountain Capital develops modern, transit-accessible apartment communities designed to meet 
              the demand for high-quality, attainable housing in high-growth U.S. markets.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Each project is efficiently scaled, thoughtfully designed, and aligned with long-term demographic trends. 
              By targeting Opportunity Zones, Juniper enhances strong underlying real estate fundamentals with powerful 
              tax advantages for investors and measurable impact in underserved communities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                <h4 className="text-xl font-semibold text-green-900 dark:text-green-300 mb-2">1,158 Units</h4>
                <p className="text-green-700 dark:text-green-400">Delivered across 15 buildings</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                <h4 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-2">749 Units</h4>
                <p className="text-blue-700 dark:text-blue-400">Currently in development across 7 buildings</p>
              </div>
            </div>
          </div>

          {/* Track Record */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">Development Track Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trackRecord.map((record, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{record.category}</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Units:</span>
                      <span className="font-bold text-orange-900 dark:text-orange-300">{record.units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Projects:</span>
                      <span className="font-bold text-orange-900 dark:text-orange-300">{record.projects}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {record.locations.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Case Studies */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">Project Case Studies</h3>
            <div className="space-y-8">
              {projectHighlights.map((project, idx) => (
                <div key={idx} className="border-l-4 border-orange-500 pl-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{project.name}</h4>
                      <p className="text-orange-700 dark:text-orange-400">{project.location}</p>
                    </div>
                    <div className="mt-2 lg:mt-0">
                      <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                        {project.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Units</span>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{project.units}</p>
                    </div>
                    {project.stories && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Stories</span>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{project.stories}</p>
                      </div>
                    )}
                    {project.buildings && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Buildings</span>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{project.buildings}</p>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.features.map((feature, featureIdx) => (
                      <span key={featureIdx} className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Contractor */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl"><HardHat className="w-10 h-10 text-yellow-600 dark:text-yellow-400" /></div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{contractorInfo.name}</h3>
                <p className="text-orange-700 dark:text-orange-400">General Contractor</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {contractorInfo.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Founded</h4>
                <p className="text-orange-900 dark:text-orange-300 font-bold">{contractorInfo.founded}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Completed Projects</h4>
                <p className="text-orange-900 dark:text-orange-300 font-bold">{contractorInfo.completed}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Specialties</h4>
                <p className="text-orange-900 dark:text-orange-300 font-bold">{contractorInfo.expertise.length} Verticals</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Areas of Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {contractorInfo.expertise.map((area, idx) => (
                  <span key={idx} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 