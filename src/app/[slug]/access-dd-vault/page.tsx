import { getPublishedListingBySlug } from '@/lib/supabase/listings'
import { getDDVFiles } from '@/lib/supabase/ddv'
import DDVVaultClient from './ddv-vault-client'
import { notFound } from 'next/navigation'

interface DDVVaultPageProps {
  params: Promise<{ slug: string }>
}

export default async function DDVVaultPage({ params }: DDVVaultPageProps) {
  const { slug } = await params
  
  // Get the listing to verify it exists and get its name
  const listing = await getPublishedListingBySlug(slug)
  
  if (!listing) {
    notFound()
  }
  
  // Fetch the DDV files for this listing
  const files = await getDDVFiles(slug)
  
  console.log(`DDV Page - Slug: ${slug}, Files found: ${files.length}`)
  console.log('Files:', files)
  
  return (
    <DDVVaultClient 
      listing={listing} 
      files={files} 
      slug={slug} 
    />
  )
} 