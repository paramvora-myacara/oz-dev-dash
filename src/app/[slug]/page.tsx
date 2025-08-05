import { getListingBySlug } from '@/lib/listings-data';
import ListingPageClient from './listing-page-client';

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    return <div>Loading...</div>;
  }

  return <ListingPageClient listing={listing} />;
} 