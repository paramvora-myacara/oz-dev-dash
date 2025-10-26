'use client';

import React from 'react';
import { Listing } from '@/types/listing';
import { getProjectIdFromSlug } from '@/utils/listing';
import FinancialReturnsPage from '@/components/listing/details/financial-returns/FinancialReturnsPage';
import PropertyOverviewPage from '@/components/listing/details/property-overview/PropertyOverviewPage';
import MarketAnalysisPage from '@/components/listing/details/market-analysis/MarketAnalysisPage';
import SponsorProfilePage from '@/components/listing/details/sponsor-profile/SponsorProfilePage';
import PortfolioProjectsSection from '@/components/listing/details/portfolio-projects/PortfolioProjectsSection';
import HowInvestorsParticipateSection from '@/components/listing/details/how-investors-participate/HowInvestorsParticipateSection';
import FundSponsorProfileSection from '@/components/listing/details/fund-sponsor-profile/FundSponsorProfileSection';

interface DetailPageRendererProps {
  pageData: any;
  pageType: keyof Listing['details'];
  listingSlug: string;
  isEditMode?: boolean;
}

const DetailPageRenderer: React.FC<DetailPageRendererProps> = ({ 
  pageData, 
  pageType, 
  listingSlug,
  isEditMode = false
}) => {
  const projectId = getProjectIdFromSlug(listingSlug);
  // Handle legacy page types that use existing page components
  if (pageType === 'financialReturns') {
    return <FinancialReturnsPage data={pageData} />;
  }
  
  if (pageType === 'propertyOverview') {
    return (
      <PropertyOverviewPage 
        data={pageData} 
        isEditMode={isEditMode}
        listingSlug={listingSlug}
      />
    );
  }
  
  if (pageType === 'marketAnalysis') {
    return <MarketAnalysisPage data={pageData} />;
  }
  
  if (pageType === 'sponsorProfile') {
    return (
      <SponsorProfilePage 
        data={pageData} 
        developerWebsite={null}
        isEditMode={isEditMode}
        listingSlug={listingSlug}
      />
    );
  }

  // Handle new fund-specific page types with unified section rendering
  if (!pageData || !pageData.sections) {
    return <div>Content not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {pageData.sections.map((section: any, idx: number) => {
        switch (pageType) {
          case 'fundStructure':
            // Fund structure uses the same sections as financial returns
            return (
              <FinancialReturnsPage 
                key={idx} 
                data={{
                  pageTitle: pageData.pageTitle,
                  pageSubtitle: pageData.pageSubtitle,
                  backgroundImages: pageData.backgroundImages,
                  sections: [section]
                }} 
              />
            );
          
          case 'portfolioProjects':
            if (section.type === 'projectOverview') {
              return (
                <PortfolioProjectsSection
                  key={idx}
                  data={section.data}
                  sectionIndex={idx}
                  isEditMode={isEditMode}
                  listingSlug={listingSlug}
                />
              );
            }
            break;
          
          case 'howInvestorsParticipate':
            return (
              <HowInvestorsParticipateSection
                key={idx}
                data={section.data}
                sectionIndex={idx}
                sectionType={section.type}
              />
            );
          
          default:
            return null;
        }
        return null;
      })}
    </div>
  );
};

export default DetailPageRenderer;
