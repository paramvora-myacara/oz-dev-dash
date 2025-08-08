import { getPublishedListingBySlug } from '@/lib/supabase/listings'
import ListingPageClient from './listing-page-client';

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getPublishedListingBySlug(slug);

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return <ListingPageClient listing={listing} />;
} 