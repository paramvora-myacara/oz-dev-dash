'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  TrendingUp, Building, Target, Users, Waves, Dumbbell, Laptop, Dog, Building2, 
  Bell, Zap, Package, MapPin, Car, Bus, Plane, DollarSign, Calendar, Home, Factory,
  Award, Coffee, Utensils
} from "lucide-react";
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import { getRandomImages } from '@/utils/supabaseImages';
import { getListingBySlug } from '@/lib/listings-data';
import { 
    Listing, FinancialReturns, PropertyOverview, MarketAnalysis, SponsorProfile 
} from '@/types/listing';
import FloorplanSitemapSection from '@/components/FloorplanSitemapSection';

const iconMap: { [key: string]: React.ComponentType<any> } = {
    TrendingUp, Building, Target, Users, Waves, Dumbbell, Laptop, Dog, Building2,
    Bell, Zap, Package, MapPin, Car, Bus, Plane, DollarSign, Calendar, Home, Factory,
    Award, Coffee, Utensils
};

type DetailPageType = 'financial-returns' | 'property-overview' | 'market-analysis' | 'sponsor-profile';

const toCamelCase = (slug: string): keyof Listing['details'] => {
    const parts = slug.split('-');
    return (parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')) as keyof Listing['details'];
}

function DetailPage({ params }: { params: { slug: string; detailPage: string } }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [detailData, setDetailData] = useState<FinancialReturns | PropertyOverview | MarketAnalysis | SponsorProfile | null>(null);
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listingData = getListingBySlug(params.slug);
    if (listingData) {
      setListing(listingData);
      const pageTypeKey = toCamelCase(params.detailPage);
      const data = listingData.details[pageTypeKey];
      setDetailData(data);
      if (data) {
        document.title = `${data.pageTitle} – ${listingData.listingName}`;
      }
    }
  }, [params.slug, params.detailPage]);

  useEffect(() => {
    async function loadBackgroundImages() {
      if (!listing) return;
      try {
        const images = await getRandomImages(listing.projectId, 'general', 7);
        setBackgroundImages(images);
      } catch (error) {
        console.error('Error loading background images:', error);
      } finally {
        setLoading(false);
      }
    }
    if (listing) {
      loadBackgroundImages();
    }
  }, [listing]);

  const renderHeader = () => {
    if (!detailData || !listing) return null;
    
    // Determine header icon and colors based on detail page type
    let HeaderIcon;
    let iconColorClass = "text-emerald-400"; // Default color
    let backButtonColorClass = "text-emerald-300 hover:text-emerald-100";
    let titleColorClass = "text-emerald-300";
    let subtitleColorClass = "text-emerald-200";

    switch (params.detailPage) {
        case 'financial-returns':
            HeaderIcon = TrendingUp;
            break;
        case 'property-overview':
            HeaderIcon = Building;
            iconColorClass = "text-indigo-400";
            backButtonColorClass = "text-indigo-300 hover:text-indigo-100";
            titleColorClass = "text-indigo-300";
            subtitleColorClass = "text-indigo-200";
            break;
        case 'market-analysis':
            HeaderIcon = Target;
            iconColorClass = "text-purple-400";
            backButtonColorClass = "text-purple-300 hover:text-purple-100";
            titleColorClass = "text-purple-300";
            subtitleColorClass = "text-purple-200";
            break;
        case 'sponsor-profile':
            HeaderIcon = Users;
            iconColorClass = "text-orange-400";
            backButtonColorClass = "text-orange-300 hover:text-orange-100";
            titleColorClass = "text-orange-300";
            subtitleColorClass = "text-orange-200";
            break;
    }

    const headerContent = (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link 
            href={`/listings/${params.slug}#investment-cards`}
            className={`inline-flex items-center mb-8 transition-colors ${backButtonColorClass}`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </Link>
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-5xl">{HeaderIcon && <HeaderIcon className={`w-12 h-12 ${iconColorClass}`} />}</div>
            <div>
              <h1 className={`text-5xl font-semibold tracking-tight ${titleColorClass}`}>{detailData.pageTitle}</h1>
              <p className={`text-xl mt-2 ${subtitleColorClass}`}>{detailData.pageSubtitle}</p>
            </div>
          </div>
        </div>
      </section>
    );

    return (
        <BackgroundSlideshow images={backgroundImages} className="py-16" intervalMs={6000}>
            {headerContent}
        </BackgroundSlideshow>
    );
  };

  const renderFinancialReturns = (data: FinancialReturns) => (
    <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {data.projections.map((projection, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">{projection.label}</h3>
                        <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300 mb-4">{projection.value}</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">{projection.description}</p>
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Distribution Timeline</h3>
                <div className="space-y-6">
                    {data.distributionTimeline.map((phase, idx) => (
                        <div key={idx} className="flex items-start space-x-6 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                            <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-bold flex-shrink-0">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-emerald-300">{phase.year}</h4>
                                        <p className="text-emerald-600 dark:text-emerald-400 font-medium">{phase.phase}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{phase.distribution}</p>
                                        <p className="text-sm text-gray-600 dark:text-emerald-400">Distribution Rate</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600 dark:text-emerald-400">{phase.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Opportunity Zone Benefits</h3>
                    <div className="space-y-4">
                        {data.taxBenefits.map((benefit, idx) => (
                            <div key={idx} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-emerald-300">{benefit.title}</h4>
                                <p className="text-gray-600 dark:text-emerald-400">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Investment Structure</h3>
                    <div className="space-y-4">
                        {data.investmentStructure.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-emerald-400">{item.label}</span>
                                <span className="font-semibold text-gray-900 dark:text-emerald-300">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
  );

  const renderPropertyOverview = (data: PropertyOverview) => (
      <section className="py-16 px-8">
          <div className="max-w-7xl mx-auto">
            {listing && <FloorplanSitemapSection projectId={listing.projectId} />}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {data.keyPropertyFacts.map((fact, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">{fact.label}</h3>
                        <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">{fact.value}</p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">{fact.description}</p>
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Community Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.amenities.map((amenity, idx) => {
                    const Icon = iconMap[amenity.icon];
                    return(
                        <div key={idx} className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                            <div className="text-indigo-600 dark:text-indigo-400">
                                {Icon && <Icon className="w-6 h-6" />}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {amenity.name}
                            </span>
                        </div>
                    )
                })}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Unit Mix</h3>
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 text-gray-600 dark:text-gray-400">Unit Type</th>
                            <th className="text-center py-3 text-gray-600 dark:text-gray-400">Count</th>
                            <th className="text-center py-3 text-gray-600 dark:text-gray-400">Square Feet</th>
                            <th className="text-right py-3 text-gray-600 dark:text-gray-400">Projected Rent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.unitMix.map((unit, idx) => (
                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                                <td className="py-4 font-medium text-gray-900 dark:text-gray-100">{unit.type}</td>
                                <td className="py-4 text-center text-gray-700 dark:text-gray-300">{unit.count}</td>
                                <td className="py-4 text-center text-gray-700 dark:text-gray-300">{unit.sqft}</td>
                                <td className="py-4 text-right font-semibold text-gray-900 dark:text-gray-100">{unit.rent}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
          </div>
      </section>
  );

  const renderMarketAnalysis = (data: MarketAnalysis) => (
    <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {data.marketMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">{metric.label}</h3>
                <p className="text-4xl font-bold text-purple-900 dark:text-purple-300 mb-4">{metric.value}</p>
                <p className="text-sm text-purple-700 dark:text-purple-400">{metric.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Major Employers</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Company</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Employees</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Industry</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.majorEmployers.map((employer, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{employer.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.employees}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.industry}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{employer.distance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Demographics</h3>
              <div className="space-y-6">
                {data.demographics.map((demo, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{demo.category}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{demo.description}</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{demo.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Supply & Demand Analysis</h3>
              <div className="space-y-4">
                {data.supplyDemandAnalysis.map((item, idx) => {
                    const Icon = iconMap[item.icon];
                    return (
                        <div key={idx} className="flex items-start space-x-3">
                            <div className="text-2xl">{Icon && <Icon className="w-6 h-6 text-red-500" />}</div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h4>
                                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                            </div>
                        </div>
                    )
                })}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Market Drivers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.keyMarketDrivers.map((driver, idx) => {
                  const Icon = iconMap[driver.icon];
                  return (
                    <div key={idx} className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        {Icon && <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{driver.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{driver.description}</p>
                    </div>
                  )
              })}
            </div>
          </div>
        </div>
    </section>
  );

  const renderSponsorProfile = (data: SponsorProfile) => (
    <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{data.sponsorOverview.title}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {data.sponsorOverview.description}
                </p>
              </div>
              <div className="space-y-4">
                {data.sponsorOverview.points.map((point, i) => (
                    <div key={i} className="flex items-center space-x-3">
                        <Award className="w-6 h-6 text-orange-500" />
                        <span className="text-gray-900 dark:text-gray-100">{point}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {data.trackRecord.map((record, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-2">{record.metric}</h3>
                <p className="text-4xl font-bold text-orange-900 dark:text-orange-300 mb-4">{record.value}</p>
                <p className="text-sm text-orange-700 dark:text-orange-400">{record.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Leadership Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.teamMembers.map((member, idx) => (
                    <div key={idx} className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{member.name}</h4>
                    <p className="text-orange-600 dark:text-orange-400 font-medium mb-2">{member.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{member.experience} experience</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.background}</p>
                    </div>
                ))}
                </div>
            </div>
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
                    {data.previousProjects.map((project, idx) => (
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
  );

  const renderContent = () => {
    if (!detailData) return <div>Loading details...</div>;

    switch (params.detailPage) {
      case 'financial-returns':
        return renderFinancialReturns(detailData as FinancialReturns);
      case 'property-overview':
        return renderPropertyOverview(detailData as PropertyOverview);
      case 'market-analysis':
        return renderMarketAnalysis(detailData as MarketAnalysis);
      case 'sponsor-profile':
        return renderSponsorProfile(detailData as SponsorProfile);
      default:
        return <div>Detail page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {renderHeader()}
      {renderContent()}
    </div>
  );
}

export default DetailPage; 