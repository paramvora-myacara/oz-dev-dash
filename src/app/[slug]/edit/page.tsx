import { notFound, redirect } from 'next/navigation';
import { getPublishedListingBySlug } from '@/lib/supabase/listings';
import { verifyAdminCanEditSlug } from '@/lib/admin/auth';
import ListingPageClient from '../listing-page-client';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditModeProvider } from '@/components/editor/EditModeProvider';

interface EditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditPage({ params }: EditPageProps) {
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

  return (
    <EditModeProvider listing={listing}>
      <div className="min-h-screen bg-gray-50">
        <EditorToolbar />
        <ListingPageClient listing={listing} />
      </div>
    </EditModeProvider>
  );
} 