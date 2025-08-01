import { getListingBySlug } from '@/lib/listings-data';
import ListingPageClient from './listing-page-client';

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const listing = getListingBySlug(params.slug);

  if (!listing) {
    return <div>Loading...</div>;
  }

  return <ListingPageClient listing={listing} />;
} 