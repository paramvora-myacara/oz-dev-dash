'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ViewModeToolbar } from '@/components/editor/ViewModeToolbar';
import { AuthModal, ConfirmationModal } from '@/components/AuthModal';
import { Tooltip } from '@/components/Tooltip';
import { Listing, ListingOverviewSection } from '@/types/listing';
import HeroSection from '@/components/listing/HeroSection';
import TickerMetricsSection from '@/components/listing/TickerMetricsSection';
import CompellingReasonsSection from '@/components/listing/CompellingReasonsSection';
import ExecutiveSummarySection from '@/components/listing/ExecutiveSummarySection';
import InvestmentCardsSection from '@/components/listing/InvestmentCardsSection';
import InTheNewsSection from '@/components/listing/InTheNewsSection';
import React from 'react'; // Added missing import for React

interface RenderableSection {
  type: string;
  component: React.ReactNode;
}

interface ListingPageClientProps {
  listing: Listing;
  isEditMode?: boolean;
}

export default function ListingPageClient({ listing, isEditMode = false }: ListingPageClientProps) {
  const { 
    isAuthModalOpen, 
    isConfirmationModalOpen, 
    authError, 
    isLoading, 
    userFullName,
    userEmail,
    userPhoneNumber,
    checkHasSignedCAForListing,
    handleRequestVaultAccess, 
    handleSignInOrUp,
    handleContactDeveloper,
    closeModal,
    authContext
  } = useAuth();
  const { isAdmin, canEditSlug } = useAdminAuth();

  useEffect(() => {
    if (listing) {
      document.title = listing.listingName;
    }
  }, [listing]);

  const showAdminToolbar = !isLoading && isAdmin && canEditSlug(listing.listingSlug) && !isEditMode;

  // Check if user has signed CA for this listing
  const hasSignedCAForCurrentListing = checkHasSignedCAForListing(listing.listingSlug);

  const handleVaultAccess = () => {
    if (hasSignedCAForCurrentListing) {
      // User has already signed CA, go directly to vault
      window.location.href = `/${listing.listingSlug}/access-dd-vault`;
    } else {
      // User hasn't signed CA, start the request process
      handleRequestVaultAccess(listing.listingSlug);
    }
  };

  const SectionRenderer = ({ section, sectionIndex }: { section: ListingOverviewSection; sectionIndex: number }) => {
    switch (section.type) {
        case 'hero':
            return <HeroSection 
              data={section.data} 
              projectId={listing.projectId} 
              sectionIndex={sectionIndex} 
              isEditMode={isEditMode}
              listingSlug={listing.listingSlug}
            />;
        case 'tickerMetrics':
            return <TickerMetricsSection data={section.data} sectionIndex={sectionIndex} />;
        case 'compellingReasons':
            return <CompellingReasonsSection data={section.data} sectionIndex={sectionIndex} />;
        case 'executiveSummary':
            return <ExecutiveSummarySection data={section.data} sectionIndex={sectionIndex} />;
        case 'investmentCards':
            return <InvestmentCardsSection data={section.data} listingSlug={listing.listingSlug} sectionIndex={sectionIndex} />;
        default:
            return null;
    }
  };

  let hasRenderedNewsSection = false;
  const finalSectionsToRender: RenderableSection[] = [];

  listing.sections.forEach((section, idx) => {
    if (!hasRenderedNewsSection && (section.type === 'executiveSummary') && listing.newsLinks && listing.newsLinks.length > 0) {
      finalSectionsToRender.push({
        type: 'newsLinksSection',
        component: <InTheNewsSection key="in-the-news-section" newsLinks={listing.newsLinks} />
      });
      hasRenderedNewsSection = true;
    }
    finalSectionsToRender.push({
      type: section.type,
      component: <SectionRenderer key={idx} section={section} sectionIndex={idx} />
    });
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {showAdminToolbar && (
        <ViewModeToolbar slug={listing.listingSlug} />
      )}
      <div className={`max-w-[1920px] mx-auto ${showAdminToolbar ? 'pt-16' : ''}`}>
        {finalSectionsToRender.map((item, index) => (
          <React.Fragment key={index}>
            {item.component}
          </React.Fragment>
        ))}
        {/* Call to Action Buttons */}
        <section className="py-8 md:py-16 px-4 md:px-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-center">
            <Tooltip 
              content="For access to confidential deal information (i.e. - Private Placement Memorandum, Fund Operating Agreement, Subscription Agreement, and other documents)."
              position="top"
            >
              <button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                onClick={handleVaultAccess}
              >
                {hasSignedCAForCurrentListing ? 'View Vault' : 'Request Vault Access'}
              </button>
            </Tooltip>
            <button
              onClick={() => handleContactDeveloper(listing.listingSlug)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
            >
              Contact the Developer
            </button>
          </div>
        </section>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        onSubmit={handleSignInOrUp}
        isLoading={isLoading}
        authError={authError}
        userFullName={userFullName}
        userEmail={userEmail}
        userPhoneNumber={userPhoneNumber}
        authContext={authContext}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeModal}
      />
    </div>
  );
} 