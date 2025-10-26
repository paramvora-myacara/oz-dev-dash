import { ozRecapTestData } from '@/data/oz-recap-test-data';
import DetailPageClient from '@/app/[slug]/details/[detailPage]/detail-page-client';
import { toCamelCase } from '@/utils/helpers';

export default async function OzRecapTestDetailPage({ params }: { params: Promise<{ detailPage: string }> }) {
  const { detailPage } = await params;
  
  const camelCasePage = toCamelCase(detailPage) as keyof typeof ozRecapTestData.details;
  const pageData = ozRecapTestData.details[camelCasePage];

  if (!pageData) {
    return <div>Detail page not found</div>;
  }

  return (
    <DetailPageClient 
      listing={ozRecapTestData} 
      pageData={pageData} 
      slug="oz-recap-test" 
      camelCasePage={camelCasePage} 
    />
  );
}
