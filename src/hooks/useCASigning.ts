'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useCASigning(userId: string | null, targetSlug: string | null) {
  const [hasSignedCA, setHasSignedCA] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Check database for signing status
  const checkHasSignedCAForListing = useCallback(async (slug: string): Promise<boolean> => {
    if (!userId) return false

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_signed_agreements')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_slug', slug)
        .single()

      return !!data && !error
    } catch (error) {
      console.error('Error checking CA signing status:', error)
      return false
    }
  }, [userId])

  // Record signing in database (called from SignWell completion)
  const markAsSigned = useCallback(async (slug: string, fullName: string, email: string): Promise<boolean> => {
    if (!userId || !slug) return false

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_signed_agreements')
        .insert({
          user_id: userId,
          listing_slug: slug,
          full_name: fullName,
          email: email
        })
        .select()
        .single()

      if (error) {
        // Handle duplicate signing (user already signed for this listing)
        if (error.code === '23505') {
          return true // Already signed, consider success
        }
        throw error
      }

      return true
    } catch (error) {
      console.error('Error recording CA signing:', error)
      return false
    }
  }, [userId])

  // Update state when userId or targetSlug changes
  useEffect(() => {
    const updateSigningStatus = async () => {
      if (userId && targetSlug) {
        setIsLoading(true)
        const signed = await checkHasSignedCAForListing(targetSlug)
        setHasSignedCA(signed)
        setIsLoading(false)
      } else {
        setHasSignedCA(false)
        setIsLoading(false)
      }
    }

    updateSigningStatus()
  }, [userId, targetSlug, checkHasSignedCAForListing])

  return {
    hasSignedCA,
    isLoading,
    checkHasSignedCAForListing,
    markAsSigned,
  }
} 