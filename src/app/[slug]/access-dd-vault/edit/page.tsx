import { notFound, redirect } from 'next/navigation';
import { getPublishedListingBySlug, getListingIdBySlug } from '@/lib/supabase/listings';
import { verifyAdminCanEditSlug } from '@/lib/admin/auth';
import { getDDVFiles } from '@/lib/supabase/ddv';
import DDVEditClient from './ddv-edit-client';

interface DDVEditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DDVEditPage({ params }: DDVEditPageProps) {
  const { slug } = await params;
  
  // Check admin authorization
  const adminUser = await verifyAdminCanEditSlug(slug);
  if (!adminUser) {
    redirect('/admin/login');
  }
  
  const listing = await getPublishedListingBySlug(slug);
  
  if (!listing) {
    notFound();
  }

  // Get listing ID for DDV folder structure
  const listingId = await getListingIdBySlug(slug);
  if (!listingId) {
    notFound();
  }

  // Fetch the DDV files for this listing
  const files = await getDDVFiles(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16">
        <DDVEditClient 
          listing={listing} 
          files={files} 
          slug={slug}
          listingId={listingId}
        />
      </div>
    </div>
  );
} 