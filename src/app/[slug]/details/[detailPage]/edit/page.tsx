import { notFound, redirect } from 'next/navigation';
import { getPublishedListingBySlug } from '@/lib/supabase/listings';
import { verifyAdminCanEditSlug } from '@/lib/admin/auth';
import { EditModeProvider } from '@/components/editor/EditModeProvider';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import DetailPageClient from '../detail-page-client';

interface EditDetailPageProps {
  params: Promise<{
    slug: string;
    detailPage: string;
  }>;
}

export default async function EditDetailPage({ params }: EditDetailPageProps) {
  const { slug, detailPage } = await params;
  
  // Check admin authorization
  const adminUser = await verifyAdminCanEditSlug(slug);
  if (!adminUser) {
    redirect('/admin/login');
  }
  
  const listing = await getPublishedListingBySlug(slug);
  
  if (!listing) {
    notFound();
  }

  // Validate detail page
  const validDetailPages = ['financial-returns', 'property-overview', 'market-analysis', 'sponsor-profile'];
  if (!validDetailPages.includes(detailPage)) {
    notFound();
  }

  // Convert detailPage to camelCase for the component
  const camelCasePage = detailPage.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase()) as keyof typeof listing.details;
  
  // Get the page data
  const pageData = listing.details[camelCasePage];

  return (
    <EditModeProvider listing={listing}>
      <div className="min-h-screen bg-gray-50">
        <EditorToolbar />
        <div className="pt-16">
          <DetailPageClient 
            listing={listing} 
            pageData={pageData}
            slug={slug}
            camelCasePage={camelCasePage}
            isEditMode={true}
          />
        </div>
      </div>
    </EditModeProvider>
  );
} 