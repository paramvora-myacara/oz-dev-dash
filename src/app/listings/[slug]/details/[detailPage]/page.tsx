'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  TrendingUp, Building, Target, Users, Waves, Dumbbell, Laptop, Dog, Building2, 
  Bell, Zap, Package, MapPin, Car, Bus, Plane, DollarSign, Calendar, Home, Factory,
  Award, Coffee, Utensils, Sun
} from "lucide-react";
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import { getRandomImages } from '@/utils/supabaseImages';
import { getListingBySlug } from '@/lib/listings-data';
import {
  FinancialReturns,
  PropertyOverview,
  MarketAnalysis,
  SponsorProfile,
  Listing,
  SponsorProfileSection
} from '@/types/listing';
import FloorplanSitemapSection from '@/components/FloorplanSitemapSection';

const toCamelCase = (slug: string): string => {
    const parts = slug.split('-');
    return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
    TrendingUp, Building, Target, Users, Waves, Dumbbell, Laptop, Dog, Building2,
    Bell, Zap, Package, MapPin, Car, Bus, Plane, DollarSign, Calendar, Home, Factory,
    Award, Coffee, Utensils, Sun
};

type DetailPageType = 'financial-returns' | 'property-overview' | 'market-analysis' | 'sponsor-profile';

function DetailPage({ params }: { params: { slug: string; detailPage: string } }) {
  const listing = getListingBySlug(params.slug);
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadBackgroundImages() {
      if (!listing) return;
      try {
        const images = await getRandomImages(listing.projectId, 'details', 7);
        setBackgroundImages(images);
      } catch (error) {
        console.error('Error loading background images:', error);
      }
    }
    loadBackgroundImages();
  }, [listing]);

  if (!listing) {
    return <div>Loading...</div>;
  }
  
  const camelCasePage = toCamelCase(params.detailPage) as keyof Listing['details'];
  const pageData = listing.details[camelCasePage];

  const HeaderContent = ({ data }: { data: any }) => {
    let title = '';
    let subtitle = '';

    if (camelCasePage === 'sponsorProfile') {
      title = "Sponsor Profile";
      subtitle = data.sponsorName;
    } else {
      title = data.pageTitle;
      subtitle = data.pageSubtitle;
    }
    
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link
            href={`/listings/${params.slug}#investment-cards`}
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
              <h1 className="text-5xl font-semibold text-orange-300 tracking-tight">{title}</h1>
              <p className="text-xl text-orange-200 mt-2">{subtitle}</p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderFinancialReturns = (financialReturns: FinancialReturns) => {
    
    // =================================================================================
    // Section-specific components for the Financial Returns page
    // =================================================================================

    const ProjectionsSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {data.projections.map((projection: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">{projection.label}</h3>
            <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300 mb-4">{projection.value}</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{projection.description}</p>
          </div>
        ))}
      </div>
    );

    const DistributionTimelineSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Distribution Timeline</h3>
        <div className="space-y-6">
          {data.timeline.map((phase: any, idx: number) => (
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
    );

    const TaxBenefitsSection: React.FC<{ data: any }> = ({ data }) => (
       <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Opportunity Zone Benefits</h3>
          <div className="space-y-4">
              {data.benefits.map((benefit: any, idx: number) => (
                  <div key={idx} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-emerald-300">{benefit.title}</h4>
                      <p className="text-gray-600 dark:text-emerald-400">{benefit.description}</p>
                  </div>
              ))}
          </div>
      </div>
    );

    const InvestmentStructureSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-emerald-300 mb-6">Investment Structure</h3>
          <div className="space-y-4">
              {data.structure.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-emerald-400">{item.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-emerald-300">{item.value}</span>
                  </div>
              ))}
          </div>
      </div>
    );
    
    const SectionRenderer = ({ section }: { section: any }) => {
      switch (section.type) {
        case 'projections':
          return <ProjectionsSection data={section.data} />;
        case 'distributionTimeline':
          return <DistributionTimelineSection data={section.data} />;
        case 'taxBenefits':
          return <TaxBenefitsSection data={section.data} />;
        case 'investmentStructure':
          return <InvestmentStructureSection data={section.data} />;
        default:
          return null;
      }
    };

    if (!financialReturns || !financialReturns.sections) {
      return <div>Financial returns data is loading or missing...</div>;
    }

    return (
      <div className="max-w-7xl mx-auto">
        {financialReturns.sections.map((section, idx) => {
          if(section.type === 'taxBenefits' || section.type === 'investmentStructure') {
             if(idx === 0 || (financialReturns.sections[idx-1].type !== 'taxBenefits' && financialReturns.sections[idx-1].type !== 'investmentStructure')) {
                return (
                  <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <SectionRenderer section={section} />
                    {financialReturns.sections[idx+1] && (financialReturns.sections[idx+1].type === 'taxBenefits' || financialReturns.sections[idx+1].type === 'investmentStructure') && 
                      <SectionRenderer section={financialReturns.sections[idx+1]} />
                    }
                  </div>
                )
             }
          } else {
            return <SectionRenderer key={idx} section={section} />
          }
          return null;
        })}
      </div>
    );
  };

  const renderPropertyOverview = (propertyOverview: PropertyOverview) => {
    
    // =================================================================================
    // Section-specific components for the Property Overview page
    // =================================================================================
    
    const KeyFactsSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {data.facts.map((fact: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">{fact.label}</h3>
            <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">{fact.value}</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">{fact.description}</p>
          </div>
        ))}
      </div>
    );
    
    const AmenitiesSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Community Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.amenities.map((amenity: any, idx: number) => {
            const Icon = iconMap[amenity.icon];
            return (
              <div key={idx} className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                <div className="text-indigo-600 dark:text-indigo-400">
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{amenity.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
    
    const UnitMixSection: React.FC<{ data: any }> = ({ data }) => (
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
              {data.unitMix.map((unit: any, idx: number) => (
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
        {data.specialFeatures && (
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.specialFeatures.title}</h4>
            <p className="text-gray-600 dark:text-gray-400">{data.specialFeatures.description}</p>
          </div>
        )}
      </div>
    );
    
    const LocationHighlightsSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Location Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.highlights.map((highlight: any, idx: number) => {
            const Icon = iconMap[highlight.icon];
            return (
              <div key={idx} className="text-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                {Icon && <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />}
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{highlight.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{highlight.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );

    const LocationFeaturesSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {data.featureSections.map((highlight: any, idx: number) => {
          const Icon = iconMap[highlight.icon];
          return (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                {Icon && <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{highlight.category}</h3>
              </div>
              <ul className="space-y-3">
                {highlight.features.map((feature: string, featureIdx: number) => (
                  <li key={featureIdx} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    );
    
    const DevelopmentTimelineSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Timeline</h3>
        <div className="space-y-6">
          {data.timeline.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${item.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    
    const DevelopmentPhasesSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Development Phases</h3>
        <div className="space-y-6">
          {data.phases.map((phase: any, idx: number) => (
            <div key={idx} className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{phase.phase}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{phase.timeline}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{phase.units}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Units</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{phase.sqft}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rentable SF</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{phase.features}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const SectionRenderer = ({ section }: { section: any }) => {
      switch (section.type) {
        case 'keyFacts':
          return <KeyFactsSection data={section.data} />;
        case 'amenities':
          return <AmenitiesSection data={section.data} />;
        case 'unitMix':
          return <UnitMixSection data={section.data} />;
        case 'locationHighlights':
          return <LocationHighlightsSection data={section.data} />;
        case 'locationFeatures':
          return <LocationFeaturesSection data={section.data} />;
        case 'developmentTimeline':
          return <DevelopmentTimelineSection data={section.data} />;
        case 'developmentPhases':
          return <DevelopmentPhasesSection data={section.data} />;
        default:
          return null;
      }
    };
    
    if (!propertyOverview || !propertyOverview.sections) {
        return <div>Property overview data is loading or missing...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            {listing && <FloorplanSitemapSection projectId={listing.projectId} />}
            {propertyOverview.sections.map((section, idx) => (
                <SectionRenderer key={idx} section={section} />
            ))}
        </div>
    );
  };

  const renderMarketAnalysis = (marketAnalysis: MarketAnalysis) => {

    // =================================================================================
    // Section-specific components for the Market Analysis page
    // =================================================================================

    const MarketMetricsSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {data.metrics.map((metric: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">{metric.label}</h3>
            <p className="text-4xl font-bold text-purple-900 dark:text-purple-300 mb-4">{metric.value}</p>
            <p className="text-sm text-purple-700 dark:text-purple-400">{metric.description}</p>
          </div>
        ))}
      </div>
    );

    const MajorEmployersSection: React.FC<{ data: any }> = ({ data }) => (
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
              {data.employers.map((employer: any, idx: number) => (
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
    );

    const DemographicsSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Demographics</h3>
        <div className="space-y-6">
          {data.demographics.map((demo: any, idx: number) => (
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
    );
    
    const KeyMarketDriversSection: React.FC<{ data: any }> = ({ data }) => (
       <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Market Drivers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.drivers.map((driver: any, idx: number) => {
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
    );
    
    const SupplyDemandSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Supply & Demand Analysis</h3>
        <div className="space-y-4">
          {data.analysis.map((item: any, idx: number) => {
            const Icon = iconMap[item.icon];
            return (
              <div key={idx} className="flex items-start space-x-3">
                <div className="text-2xl">{Icon && <Icon className="w-6 h-6 text-red-500" />}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
    
    const CompetitiveAnalysisSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Competitive Student Housing Market</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Property</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Year Built</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Beds</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Avg Rate/Bed</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Occupancy</th>
                <th className="text-left py-3 text-gray-900 dark:text-gray-100">Rent Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.competitors.map((property: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{property.name}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{property.built}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{property.beds}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{property.rent}</td>
                  <td className="py-3 text-green-600 dark:text-green-400 font-semibold">{property.occupancy}</td>
                  <td className="py-3 text-purple-600 dark:text-purple-400 font-semibold">+{property.rentGrowth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.summary &&
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Market Summary:</strong> {data.summary}
            </p>
          </div>
        }
      </div>
    );
    
    const EconomicDiversificationSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Economic Diversification</h3>
        <div className="space-y-4">
          {data.sectors.map((sector: any, idx: number) => (
            <div key={idx} className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{sector.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{sector.description}</p>
            </div>
          ))}
        </div>
      </div>
    );

    const SectionRenderer = ({ section }: { section: any }) => {
      switch (section.type) {
        case 'marketMetrics':
          return <MarketMetricsSection data={section.data} />;
        case 'majorEmployers':
          return <MajorEmployersSection data={section.data} />;
        case 'demographics':
            return <DemographicsSection data={section.data} />
        case 'keyMarketDrivers':
            return <KeyMarketDriversSection data={section.data} />
        case 'supplyDemand':
            return <SupplyDemandSection data={section.data} />
        case 'competitiveAnalysis':
            return <CompetitiveAnalysisSection data={section.data} />
        case 'economicDiversification':
            return <EconomicDiversificationSection data={section.data} />
        default:
          return null;
      }
    };

    if (!marketAnalysis || !marketAnalysis.sections) {
      return <div>Market analysis data is loading or missing...</div>;
    }

    return (
      <div className="max-w-7xl mx-auto">
        {marketAnalysis.sections.map((section, idx) => (
          <SectionRenderer key={idx} section={section} />
        ))}
      </div>
    );
  };
  
  const renderSponsorProfile = (sponsorProfile: SponsorProfile) => {
    
    // =================================================================================
    // Section-specific components for the Sponsor Profile page
    // =================================================================================
    
    const SponsorIntroSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{data.sponsorName}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {data.content.paragraphs.map((p: string, i: number) => (
              <p key={i} className="text-lg text-gray-600 dark:text-gray-400 mb-6 last:mb-0">{p}</p>
            ))}
          </div>
          <div className="space-y-4">
            {data.content.highlights.type === 'icons' && data.content.highlights.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-orange-500" />
                <span className="text-gray-900 dark:text-gray-100">{item.text}</span>
              </div>
            ))}
             {data.content.highlights.type === 'list' && (
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Investment Strategy</h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      {data.content.highlights.items.map((item: any, i: number) => (
                        <li key={i}>• {item.text}</li>
                      ))}
                    </ul>
                </div>
            )}
          </div>
        </div>
      </div>
    );

    const PartnershipOverviewSection: React.FC<{ data: any }> = ({ data }) => (
       <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Partnership Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {data.partners.map((partner: any, i: number) => (
                <div key={i}>
                  <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">{partner.name}</h4>
                  {partner.description.map((p: string, j: number) => (
                    <p key={j} className="text-gray-600 dark:text-gray-400 mb-4 last:mb-0">{p}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
    );

    const TrackRecordSection: React.FC<{ data: any }> = ({ data }) => (
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(data.metrics.length, 4)} gap-6 mb-12`}>
        {data.metrics.map((record: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            {record.label && <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-2">{record.label}</h3>}
            <p className="text-4xl font-bold text-orange-900 dark:text-orange-300 mb-4">{record.value}</p>
            <p className="text-sm text-orange-700 dark:text-orange-400">{record.description}</p>
          </div>
        ))}
      </div>
    );

    const LeadershipTeamSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Leadership Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.teamMembers.map((member: any, idx: number) => (
            <div key={idx} className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{member.name}</h4>
              <p className="text-orange-600 dark:text-orange-400 font-medium mb-2">{member.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{member.experience} experience</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{member.background}</p>
            </div>
          ))}
        </div>
      </div>
    );

    const DevelopmentPortfolioSection: React.FC<{ data: any }> = ({ data }) => (
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
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Returns/Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {data.projects.map((project: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{project.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{project.location}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{project.units}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{project.year}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : project.status === 'Operating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-orange-600 dark:text-orange-400">{project.returnsOrFocus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.investmentPhilosophy && (
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.investmentPhilosophy.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.investmentPhilosophy.description}
                </p>
              </div>
            )}
          </div>
    );

    const KeyDevelopmentPartnersSection: React.FC<{ data: any }> = ({ data }) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Development Partners</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.partners.map((partner: any, i: number) => (
                 <div key={i} className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{partner.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      <strong>Role:</strong> {partner.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {partner.description}
                    </p>
                  </div>
              ))}
            </div>
          </div>
    );
    
    const CompetitiveAdvantagesSection: React.FC<{ data: any }> = ({ data }) => (
       <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Competitive Advantages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {data.advantages.slice(0,2).map((advantage: any, i: number) => (
                  <div key={i} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{advantage.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{advantage.description}</p>
                      </div>
                    </div>
                ))}
              </div>
              <div className="space-y-4">
                 {data.advantages.slice(2,4).map((advantage: any, i: number) => (
                  <div key={i} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{advantage.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{advantage.description}</p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
    );


    const SectionRenderer = ({ section }: { section: SponsorProfileSection }) => {
      switch (section.type) {
        case 'sponsorIntro':
          return <SponsorIntroSection data={section.data} />;
        case 'partnershipOverview':
            return <PartnershipOverviewSection data={section.data} />
        case 'trackRecord':
          return <TrackRecordSection data={section.data} />;
        case 'leadershipTeam':
          return <LeadershipTeamSection data={section.data} />;
        case 'developmentPortfolio':
          return <DevelopmentPortfolioSection data={section.data} />;
        case 'keyDevelopmentPartners':
            return <KeyDevelopmentPartnersSection data={section.data} />
        case 'competitiveAdvantages':
            return <CompetitiveAdvantagesSection data={section.data} />
        default:
          return null;
      }
    };
    
    if (!sponsorProfile || !sponsorProfile.sections) {
        return <div>Sponsor profile data is loading or missing...</div>;
    }

    return (
      <div className="max-w-7xl mx-auto">
        {sponsorProfile.sections.map((section, idx) => (
            <SectionRenderer key={idx} section={section} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
       <BackgroundSlideshow images={backgroundImages} className="py-16" intervalMs={6000}>
            <HeaderContent data={pageData} />
        </BackgroundSlideshow>
      <section className="py-16 px-8">
        {(() => {
          switch (camelCasePage) {
            case 'financialReturns':
              return renderFinancialReturns(pageData as FinancialReturns);
            case 'propertyOverview':
              return renderPropertyOverview(pageData as PropertyOverview);
            case 'marketAnalysis':
              return renderMarketAnalysis(pageData as MarketAnalysis);
            case 'sponsorProfile':
              return renderSponsorProfile(pageData as SponsorProfile);
            default:
              return <div>Content not found</div>;
          }
        })()}
      </section>
    </div>
  );
}

export default DetailPage;