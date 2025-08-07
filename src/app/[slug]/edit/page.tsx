import { notFound } from 'next/navigation';
import { getListingBySlug } from '@/lib/listings-data';
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
  const listing = await getListingBySlug(slug);
  
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