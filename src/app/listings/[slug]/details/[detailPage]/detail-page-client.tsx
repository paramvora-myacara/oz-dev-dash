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
        const images = await getRandomImages(listing.projectId, 'details', 7);
        setBackgroundImages(images);
      } catch (error) {
        console.error('Error loading background images:', error);
      }
    }
    loadBackgroundImages();
  }, [listing]);

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      <BackgroundSlideshow images={backgroundImages} className="py-16" intervalMs={6000}>
        <HeaderContent data={pageData} slug={slug} camelCasePage={camelCasePage} />
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