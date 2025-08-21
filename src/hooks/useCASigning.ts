'use client'

import { useState, useEffect, useCallback } from 'react'

// Helper function to get CA signing key for a specific listing and user
const getCASigningKey = (userId: string, slug: string) => `ozl_ca_signed_${userId}_${slug}`

// Helper function to check if user has signed CA for a specific listing
const hasSignedCAForListing = (userId: string, slug: string): boolean => {
  if (!userId || !slug) return false
  return localStorage.getItem(getCASigningKey(userId, slug)) === 'true'
}

// Helper function to set CA signing status for a specific listing and user
const setCASigningStatus = (userId: string, slug: string, signed: boolean) => {
  if (!userId || !slug) return
  localStorage.setItem(getCASigningKey(userId, slug), signed.toString())
}

export function useCASigning(userId: string | null, targetSlug: string | null) {
  const [hasSignedCA, setHasSignedCA] = useState<boolean>(false)

  useEffect(() => {
    if (userId && targetSlug) {
      setHasSignedCA(hasSignedCAForListing(userId, targetSlug))
    } else {
      setHasSignedCA(false)
    }
  }, [userId, targetSlug])

  const checkHasSignedCAForListing = useCallback((slug: string) => {
    return userId ? hasSignedCAForListing(userId, slug) : false
  }, [userId])

  const markAsSigned = useCallback((slug: string) => {
    if (userId && slug) {
      setCASigningStatus(userId, slug, true)
      setHasSignedCA(true)
    }
  }, [userId])

  const markAsNotSigned = useCallback((slug: string) => {
    if (userId && slug) {
      setCASigningStatus(userId, slug, false)
      setHasSignedCA(false)
    }
  }, [userId])

  return {
    hasSignedCA,
    checkHasSignedCAForListing,
    markAsSigned,
    markAsNotSigned,
  }
} 