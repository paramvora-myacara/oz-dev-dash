import { getListingBySlug } from '@/lib/listings-data';
import DetailPageClient from './detail-page-client';
import { toCamelCase } from '@/utils/helpers';
import { Listing } from '@/types/listing';

export default async function DetailPage({ params }: { params: { slug:string, detailPage: string } }) {
  const listing = getListingBySlug(params.slug);

  if (!listing) {
    return <div>Loading...</div>;
  }
  
  const camelCasePage = toCamelCase(params.detailPage) as keyof Listing['details'];
  const pageData = listing.details[camelCasePage];

  return <DetailPageClient listing={listing} pageData={pageData} slug={params.slug} camelCasePage={camelCasePage} />;
}