import { getPublishedListingBySlug } from '@/lib/supabase/listings'
import { getDDVFiles } from '@/lib/supabase/ddv'
import DDVVaultClient from './ddv-vault-client'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

interface DDVVaultPageProps {
  params: Promise<{ slug: string }>
}

export default async function DDVVaultPage({ params }: DDVVaultPageProps) {
  const { slug } = await params
  
  // Check for valid Supabase session
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/') // Redirect to home if no session
  }
  
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