import { ozRecapTestData } from '@/data/oz-recap-test-data';
import ListingPageClient from '@/app/[slug]/listing-page-client';

export default function OzRecapTestPage() {
  return <ListingPageClient listing={ozRecapTestData} />;
}
