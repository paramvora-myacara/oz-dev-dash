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
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ViewModeToolbar } from '@/components/editor/ViewModeToolbar';

const colorMap = {
    financialReturns: {
      title: 'text-emerald-300',
      subtitle: 'text-emerald-200',
      icon: 'text-emerald-400',
      backLink: 'text-emerald-300',
      backLinkHover: 'text-emerald-100'
    },
    fundStructure: {
      title: 'text-emerald-300',
      subtitle: 'text-emerald-200',
      icon: 'text-emerald-400',
      backLink: 'text-emerald-300',
      backLinkHover: 'text-emerald-100'
    },
    portfolioProjects: {
      title: 'text-indigo-300',
      subtitle: 'text-indigo-200',
      icon: 'text-indigo-400',
      backLink: 'text-indigo-300',
      backLinkHover: 'text-indigo-100'
    },
    howInvestorsParticipate: {
      title: 'text-purple-300',
      subtitle: 'text-purple-200',
      icon: 'text-purple-400',
      backLink: 'text-purple-300',
      backLinkHover: 'text-purple-100'
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
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {showAdminToolbar && (
        <ViewModeToolbar slug={slug} detailPage={camelCasePage} />
      )}
      <BackgroundSlideshow images={backgroundImages} className={`${showAdminToolbar ? 'pt-32' : 'pt-16'} pb-16`} intervalMs={6000}>
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
    </div>
  );
} 