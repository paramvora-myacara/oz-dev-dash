import { notFound } from 'next/navigation';
import { getPublishedListingBySlug } from '@/lib/supabase/listings';
import DetailPageClient from './detail-page-client';
import { toCamelCase } from '@/utils/helpers';
import { Listing } from '@/types/listing';
import type { ListingDetail } from '@/app/[slug]/details/[detailPage]/detail-page-client';

export default async function DetailPage({ params }: { params: Promise<{ slug: string, detailPage: string }> }) {
  const { slug, detailPage } = await params;
  const listing = await getPublishedListingBySlug(slug);

  if (!listing) {
    notFound();
  }
  
  const camelCasePage = toCamelCase(detailPage) as keyof Listing['details'];
  const pageData = listing.details[camelCasePage];
  
  // If page data doesn't exist (for optional pages), show 404
  if (!pageData) {
    notFound();
  }

  return <DetailPageClient listing={listing} pageData={pageData as ListingDetail} slug={slug} camelCasePage={camelCasePage} />;
}