import Link from "next/link";
import { Users, Building, Award, Target, TrendingUp, MapPin } from "lucide-react";

export default function SponsorProfilePage() {
  const teamMembers = [
    {
      name: "Michael Rodriguez",
      title: "Managing Partner",
      experience: "25+ years",
      background: "Former VP at Related Companies, $2B+ in multifamily development"
    },
    {
      name: "Sarah Chen",
      title: "Development Director",
      experience: "18+ years",
      background: "Led 15+ multifamily projects, expertise in OZ development"
    },
    {
      name: "David Thompson",
      title: "Acquisitions Principal",
      experience: "12+ years",
      background: "Institutional background, formerly at Greystar, $500M+ transactions"
    }
  ];

  const trackRecord = [
    { metric: "Total Units Developed", value: "1,158+", description: "Across 8 successful projects" },
    { metric: "Total Project Value", value: "$485M", description: "Combined development cost" },
    { metric: "Average Project IRR", value: "22.4%", description: "Across completed projects" },
    { metric: "OZ Projects Completed", value: "3", description: "Specialized OZ experience" },
    { metric: "Years in Business", value: "15+", description: "Consistent market presence" },
    { metric: "Investor Relations", value: "200+", description: "Active investor relationships" }
  ];

  const projects = [
    {
      name: "Phoenix Gateway Commons",
      location: "Phoenix, AZ",
      units: 324,
      year: "2022",
      status: "Completed",
      returns: "24.1% IRR"
    },
    {
      name: "Tempe Station Apartments",
      location: "Tempe, AZ",
      units: 287,
      year: "2021",
      status: "Completed",
      returns: "19.8% IRR"
    },
    {
      name: "Scottsdale Reserve",
      location: "Scottsdale, AZ",
      units: 196,
      year: "2020",
      status: "Completed",
      returns: "21.3% IRR"
    },
    {
      name: "Mesa Transit Village",
      location: "Mesa, AZ",
      units: 351,
      year: "2023",
      status: "In Progress",
      returns: "Projected 23%"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link 
            href="/property-2#investment-cards" 
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
                Phoenix Gateway Plaza - ACARA OZ Fund I LLC & Juniper Mountain Capital
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Company Overview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">About Juniper Mountain Capital</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Juniper Mountain Capital is a leading multifamily development firm specializing in Opportunity Zone investments 
                  across the Southwest United States. Founded in 2009, we have established ourselves as a trusted partner for 
                  institutional and individual investors seeking strong risk-adjusted returns in the multifamily sector.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Our focus on transit-oriented developments in high-growth markets has consistently delivered superior returns 
                  while creating lasting value for the communities we serve. We leverage our deep local market knowledge and 
                  proven execution capabilities to identify and capitalize on emerging opportunities.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-orange-500" />
                  <span className="text-gray-900 dark:text-gray-100">NMHC Top 50 Developer (2021-2023)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="w-6 h-6 text-orange-500" />
                  <span className="text-gray-900 dark:text-gray-100">Specialized in OZ Development</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-orange-500" />
                  <span className="text-gray-900 dark:text-gray-100">ESG-Focused Development</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-orange-500" />
                  <span className="text-gray-900 dark:text-gray-100">Phoenix Market Leader</span>
                </div>
              </div>
            </div>
          </div>

          {/* Track Record */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {trackRecord.map((record, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-2">{record.metric}</h3>
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
        </div>
      </section>
    </div>
  );
} 