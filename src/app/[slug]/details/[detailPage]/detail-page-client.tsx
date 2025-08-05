'use client';

import { useState, useEffect } from 'react';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import { getRandomImages } from '@/utils/supabaseImages';
import {
  FinancialReturns,
  PropertyOverview,
  MarketAnalysis,
  SponsorProfile,
  Listing,
} from '@/types/listing';
import FinancialReturnsPage from '@/components/listing/details/financial-returns/FinancialReturnsPage';
import PropertyOverviewPage from '@/components/listing/details/property-overview/PropertyOverviewPage';
import MarketAnalysisPage from '@/components/listing/details/market-analysis/MarketAnalysisPage';
import SponsorProfilePage from '@/components/listing/details/sponsor-profile/SponsorProfilePage';
import HeaderContent from '@/components/listing/details/shared/HeaderContent';

const colorMap = {
    financialReturns: {
      title: 'text-emerald-300',
      subtitle: 'text-emerald-200',
      icon: 'text-emerald-400',
      backLink: 'text-emerald-300',
      backLinkHover: 'text-emerald-100'
    },
    marketAnalysis: {
      title: 'text-purple-300',
      subtitle: 'text-purple-200',
      icon: 'text-purple-400',
      backLink: 'text-purple-300',
      backLinkHover: 'text-purple-100'
    },
    propertyOverview: {
      title: 'text-indigo-300',
      subtitle: 'text-indigo-200',
      icon: 'text-indigo-400',
      backLink: 'text-indigo-300',
      backLinkHover: 'text-indigo-100'
    },
    sponsorProfile: {
      title: 'text-orange-300',
      subtitle: 'text-orange-200',
      icon: 'text-orange-400',
      backLink: 'text-orange-300',
      backLinkHover: 'text-orange-100'
    }
  };

export type ListingDetail = FinancialReturns | PropertyOverview | MarketAnalysis | SponsorProfile;

interface DetailPageClientProps {
    listing: Listing;
    pageData: ListingDetail;
    slug: string;
    camelCasePage: keyof Listing['details'];
}

export default function DetailPageClient({ listing, pageData, slug, camelCasePage }: DetailPageClientProps) {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadBackgroundImages() {
      if (!listing) return;
      try {
        const images = await getRandomImages(listing.projectId, 'general', 7);
        setBackgroundImages(images);
      } catch (error) {
        console.error('Error loading background images:', error);
      }
    }
    loadBackgroundImages();
  }, [listing]);

  const colorConfig = colorMap[camelCasePage] || colorMap.sponsorProfile;

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      <BackgroundSlideshow images={backgroundImages} className="py-16" intervalMs={6000}>
        <HeaderContent data={pageData} slug={slug} camelCasePage={camelCasePage} colorConfig={colorConfig} />
      </BackgroundSlideshow>
      <section className="py-16 px-8">
        {(() => {
          switch (camelCasePage) {
            case 'financialReturns':
              return <FinancialReturnsPage data={pageData as FinancialReturns} />;
            case 'propertyOverview':
              return <PropertyOverviewPage data={pageData as PropertyOverview} projectId={listing.projectId} />;
            case 'marketAnalysis':
              return <MarketAnalysisPage data={pageData as MarketAnalysis} />;
            case 'sponsorProfile':
              return <SponsorProfilePage data={pageData as SponsorProfile} />;
            default:
              return <div>Content not found</div>;
          }
        })()}
      </section>
    </div>
  );
} 