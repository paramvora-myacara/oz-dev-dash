'use client';

import { useState, useEffect } from 'react';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import { getRandomImages } from '@/utils/supabaseImages';
import { getProjectIdFromSlug } from '@/utils/listing';
import {
  FinancialReturns,
  PropertyOverview,
  MarketAnalysis,
  SponsorProfile,
  FundStructure,
  PortfolioProjects,
  HowInvestorsParticipate,
  Listing,
} from '@/types/listing';
import DetailPageRenderer from '@/components/listing/details/DetailPageRenderer';
import HeaderContent from '@/components/listing/details/shared/HeaderContent';
import ListingActionButtons from '@/components/listing/ListingActionButtons';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ViewModeToolbar } from '@/components/editor/ViewModeToolbar';

const colorMap = {
    financialReturns: {
      title: 'text-blue-400',
      subtitle: 'text-blue-300',
      icon: 'text-blue-500',
      backLink: 'text-blue-400',
      backLinkHover: 'text-blue-200'
    },
    fundStructure: {
      title: 'text-blue-400',
      subtitle: 'text-blue-300',
      icon: 'text-blue-500',
      backLink: 'text-blue-400',
      backLinkHover: 'text-blue-200'
    },
    portfolioProjects: {
      title: 'text-blue-400',
      subtitle: 'text-blue-300',
      icon: 'text-blue-500',
      backLink: 'text-blue-400',
      backLinkHover: 'text-blue-200'
    },
    howInvestorsParticipate: {
      title: 'text-blue-400',
      subtitle: 'text-blue-300',
      icon: 'text-blue-500',
      backLink: 'text-blue-400',
      backLinkHover: 'text-blue-200'
    },
    marketAnalysis: {
      title: 'text-blue-400',
      subtitle: 'text-blue-300',
      icon: 'text-blue-500',
      backLink: 'text-blue-400',
      backLinkHover: 'text-blue-200'
    },
    propertyOverview: {
      title: 'text-blue-400',
      subtitle: 'text-blue-300',
      icon: 'text-blue-500',
      backLink: 'text-blue-400',
      backLinkHover: 'text-blue-200'
    },
    sponsorProfile: {
      title: 'text-blue-400',
      subtitle: 'text-blue-300',
      icon: 'text-blue-500',
      backLink: 'text-blue-400',
      backLinkHover: 'text-blue-200'
    }
  };

export type ListingDetail = FinancialReturns | PropertyOverview | MarketAnalysis | SponsorProfile | FundStructure | PortfolioProjects | HowInvestorsParticipate;

interface DetailPageClientProps {
    listing: Listing;
    pageData: ListingDetail;
    slug: string;
    camelCasePage: keyof Listing['details'];
    isEditMode?: boolean;
}

export default function DetailPageClient({ listing, pageData, slug, camelCasePage, isEditMode = false }: DetailPageClientProps) {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const { isAdmin, canEditSlug, isLoading } = useAdminAuth();
  
  useEffect(() => {
    async function loadBackgroundImages() {
      if (!listing) return;
      try {
        const projectId = getProjectIdFromSlug(slug);
        const images = await getRandomImages(projectId, 'general', 7);
        setBackgroundImages(images);
      } catch (error) {
        console.error('Error loading background images:', error);
      }
    }
    loadBackgroundImages();
  }, [listing, slug]);

  const colorConfig = colorMap[camelCasePage] || colorMap.sponsorProfile;
  const showAdminToolbar = !isLoading && isAdmin && canEditSlug(slug) && !isEditMode;

  return (
    <div className="bg-bg-main dark:bg-black">
      {showAdminToolbar && (
        <ViewModeToolbar slug={slug} detailPage={camelCasePage} />
      )}
      <BackgroundSlideshow images={backgroundImages} className={`${showAdminToolbar ? 'pt-32' : 'pt-0'} pb-16`} intervalMs={6000}>
        <HeaderContent data={pageData} slug={slug} camelCasePage={camelCasePage} colorConfig={colorConfig} />
      </BackgroundSlideshow>
      <section className="py-16 px-8">
        <DetailPageRenderer
          pageData={pageData}
          pageType={camelCasePage}
          listingSlug={slug}
          isEditMode={isEditMode}
        />
      </section>
      {/* Call to Action Buttons */}
      <ListingActionButtons slug={slug} />
    </div>
  );
} 