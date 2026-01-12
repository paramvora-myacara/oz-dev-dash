'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ViewModeToolbar } from '@/components/editor/ViewModeToolbar';
import { Listing, ListingOverviewSection } from '@/types/listing';
import HeroSection from '@/components/listing/HeroSection';
import TickerMetricsSection from '@/components/listing/TickerMetricsSection';
import CompellingReasonsSection from '@/components/listing/CompellingReasonsSection';
import ExecutiveSummarySection from '@/components/listing/ExecutiveSummarySection';
import InvestmentCardsSection from '@/components/listing/InvestmentCardsSection';
import InTheNewsSection from '@/components/listing/InTheNewsSection';
import InvestmentComparisonChart from '@/components/listing/InvestmentComparisonChart';
import ListingActionButtons from '@/components/listing/ListingActionButtons';
import { getProjectMetricsBySlug } from '@/lib/supabase/ozProjects';
import React from 'react'; // Added missing import for React

interface RenderableSection {
  type: string;
  component: React.ReactNode;
}

interface ListingPageClientProps {
  listing: Listing;
  slug: string;
  isEditMode?: boolean;
}

export default function ListingPageClient({ listing, slug, isEditMode = false }: ListingPageClientProps) {
  const [projectMetrics, setProjectMetrics] = useState({ projected_irr_10yr: null, equity_multiple_10yr: null, minimum_investment: null, executive_summary: null });

  useEffect(() => {
    async function fetchMetrics() {
      if (slug) {
        const metrics = await getProjectMetricsBySlug(slug);
        setProjectMetrics({
          projected_irr_10yr: metrics.projected_irr_10yr ?? null,
          equity_multiple_10yr: metrics.equity_multiple_10yr ?? null,
          minimum_investment: metrics.minimum_investment ?? null,
          executive_summary: metrics.executive_summary ?? null,
        });
      }
    }
    fetchMetrics();
  }, [slug]);

  const { isAdmin, canEditSlug, isLoading } = useAdminAuth();

  useEffect(() => {
    if (listing) {
      document.title = listing.listingName;
    }
  }, [slug]);

  const showAdminToolbar = !isLoading && isAdmin && canEditSlug(slug) && !isEditMode;

  const SectionRenderer = ({ section, sectionIndex }: { section: ListingOverviewSection; sectionIndex: number }) => {
    switch (section.type) {
        case 'hero':
            return <HeroSection 
              data={section.data} 
              listingSlug={slug}
              sectionIndex={sectionIndex} 
              isEditMode={isEditMode}
              executiveSummary={projectMetrics.executive_summary}
              isVerifiedOzProject={listing.is_verified_oz_project}
            />;
        case 'tickerMetrics':
            return <TickerMetricsSection data={section.data} sectionIndex={sectionIndex} />;
        case 'compellingReasons':
            return <CompellingReasonsSection data={section.data} sectionIndex={sectionIndex} />;
        case 'executiveSummary':
            return <ExecutiveSummarySection data={section.data} sectionIndex={sectionIndex} />;
        case 'investmentCards':
            return <InvestmentCardsSection data={section.data} listingSlug={slug} sectionIndex={sectionIndex} />;
        default:
            return null;
    }
  };

  let hasRenderedNewsSection = false;
  const finalSectionsToRender: RenderableSection[] = [];

  listing.sections.forEach((section, idx) => {
    if (!hasRenderedNewsSection && (section.type === 'executiveSummary')) {
      // Insert the tax calculator graph before the news section
      finalSectionsToRender.push({
        type: 'taxCalculatorGraph',
        component: <InvestmentComparisonChart
          key="investment-comparison-chart"
          projectedIrr10yr={projectMetrics.projected_irr_10yr}
          equityMultiple10yr={projectMetrics.equity_multiple_10yr}
          defaultCapitalGain={projectMetrics.minimum_investment}
        />
      });
      if (listing.newsLinks && listing.newsLinks.length > 0) {
        finalSectionsToRender.push({
          type: 'newsLinksSection',
          component: <InTheNewsSection key="in-the-news-section" newsLinks={listing.newsLinks} />
        });
        hasRenderedNewsSection = true;
      }
    }
    finalSectionsToRender.push({
      type: section.type,
      component: <SectionRenderer key={idx} section={section} sectionIndex={idx} />
    });
  });

  return (
    <div className="bg-white dark:bg-black">
      {showAdminToolbar && (
        <ViewModeToolbar slug={slug} />
      )}
      <div className={`max-w-[1920px] mx-auto ${showAdminToolbar ? 'pt-24' : ''}`}>
        {finalSectionsToRender.map((item, index) => (
          <React.Fragment key={index}>
            {item.component}
          </React.Fragment>
        ))}
        {/* Call to Action Buttons */}
        <ListingActionButtons slug={slug} />
      </div>
    </div>
  );
} 