import type { Metadata } from 'next'
import { getPublishedListingBySlug } from '@/lib/supabase/listings'
import { getFirstImageUrl } from '@/lib/supabase/ogImage'
import ListingPageClient from './listing-page-client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const listing = await getPublishedListingBySlug(slug)
  
  if (!listing) {
    return {
      title: 'Listing Not Found',
    }
  }

  // Get the first image for OG image
  const ogImageUrl = await getFirstImageUrl(slug)
  
  // Get executive summary or listing name for description
  const executiveSummarySection = listing.sections.find(s => s.type === 'executiveSummary')
  const description = executiveSummarySection && executiveSummarySection.type === 'executiveSummary'
    ? (executiveSummarySection.data.summary?.paragraphs?.[0] || listing.listingName)
    : listing.listingName

  // Construct canonical URL - using ozlistings.com since that's where the pages are accessed from
  const canonicalUrl = `https://ozlistings.com/listings/${slug}`

  // Ensure description is not empty and limit to 160 chars
  const metaDescription = (description || listing.listingName).substring(0, 160)

  const metadata: Metadata = {
    title: listing.listingName,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: listing.listingName,
      description: metaDescription,
      url: canonicalUrl,
      type: 'website',
      ...(ogImageUrl && {
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${listing.listingName} property image`,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.listingName,
      description: metaDescription,
      ...(ogImageUrl && {
        images: [ogImageUrl],
      }),
    },
  }

  return metadata
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getPublishedListingBySlug(slug);

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return <ListingPageClient listing={listing} slug={slug} />;
} 