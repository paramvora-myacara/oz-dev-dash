'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal, ConfirmationModal } from '@/components/AuthModal';
import { Listing, ListingOverviewSection } from '@/types/listing';
import HeroSection from '@/components/listing/HeroSection';
import TickerMetricsSection from '@/components/listing/TickerMetricsSection';
import CompellingReasonsSection from '@/components/listing/CompellingReasonsSection';
import ExecutiveSummarySection from '@/components/listing/ExecutiveSummarySection';
import InvestmentCardsSection from '@/components/listing/InvestmentCardsSection';
import ContactDeveloperModal from '@/components/ContactDeveloperModal';


interface ListingPageClientProps {
  listing: Listing;
}

export default function ListingPageClient({ listing }: ListingPageClientProps) {
  const { isAuthModalOpen, isConfirmationModalOpen, authError, isLoading, handleRequestVaultAccess, handleSignInOrUp, closeModal } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    if (listing) {
      document.title = listing.listingName;
    }
  }, [listing]);

  const SectionRenderer = ({ section }: { section: ListingOverviewSection }) => {
    switch (section.type) {
        case 'hero':
            return <HeroSection data={section.data} projectId={listing.projectId} />;
        case 'tickerMetrics':
            return <TickerMetricsSection data={section.data} />;
        case 'compellingReasons':
            return <CompellingReasonsSection data={section.data} />;
        case 'executiveSummary':
            return <ExecutiveSummarySection data={section.data} />;
        case 'investmentCards':
            return <InvestmentCardsSection data={section.data} listingSlug={listing.listingSlug} />;
        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1920px] mx-auto">
        {listing.sections.map((section, idx) => (
            <SectionRenderer key={idx} section={section} />
        ))}
        {/* Call to Action Buttons */}
        <section className="py-8 md:py-16 px-4 md:px-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-center">
            <button
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
              onClick={handleRequestVaultAccess}
            >
              Request Vault Access
            </button>
            {listing.listingSlug === 'the-edge-on-main' ? (
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
              >
                Contact the Developer
              </button>
            ) : (
              <a
                href={`${process.env.NEXT_PUBLIC_SCHEDULE_CALL_LINK}?endpoint=/${listing.listingSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
              >
                Contact the Developer
              </a>
            )}
          </div>
        </section>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        onSubmit={handleSignInOrUp}
        isLoading={isLoading}
        authError={authError}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeModal}
      />
      <ContactDeveloperModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
} 