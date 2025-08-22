'use client'

import { useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

// Helper function to check if a listing has vault access
const checkListingVaultAccess = async (supabase: ReturnType<typeof createClient>, slug: string): Promise<{ hasVault: boolean; error?: any }> => {
  try {
    const { data: listingData, error } = await supabase
      .from('listings')
      .select('has_vault')
      .eq('slug', slug)
      .single()
    
    if (error) {
      return { hasVault: false, error }
    }
    
    return { hasVault: !!listingData?.has_vault }
  } catch (error) {
    return { hasVault: false, error }
  }
}

export function useVaultAccess() {
  const supabase = createClient()

  // Helper function to check if a listing has vault access and return the result
  const checkVaultAccessAndReturnResult = useCallback(async (
    slug: string
  ): Promise<{ hasVault: boolean; error?: any }> => {
    try {
      const { hasVault, error } = await checkListingVaultAccess(supabase, slug)
      
      if (error) {
        console.error('Error fetching listing data:', error)
        return { hasVault: false, error }
      }
      
      return { hasVault }
    } catch (error) {
      console.error('Error checking listing vault access:', error)
      return { hasVault: false, error }
    }
  }, [supabase])

  return {
    checkVaultAccessAndReturnResult,
  }
} 