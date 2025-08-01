'use client';

import { useState, useEffect } from 'react';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import { getRandomImages } from '@/utils/supabaseImages';
import { getListingBySlug } from '@/lib/listings-data';
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

const toCamelCase = (slug: string): string => {
    const parts = slug.split('-');
    return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

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
  
  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
       <BackgroundSlideshow images={backgroundImages} className="py-16" intervalMs={6000}>
            <HeaderContent data={pageData} slug={params.slug} camelCasePage={camelCasePage} />
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

export default DetailPage;