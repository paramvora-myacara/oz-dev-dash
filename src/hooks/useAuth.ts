'use client'

import { useState, useCallback } from 'react'
import { useEventTracker } from './useEventTracker'
import { useAuthentication } from './useAuthentication'
import { useUserProfile } from './useUserProfile'
import { useCASigning } from './useCASigning'
import { useVaultAccess } from './useVaultAccess'
import { useSignWell } from './useSignWell'
import { createClient } from '@/utils/supabase/client'
import { getListingPath } from '@/utils/helpers'

export function useAuth() {
  const { trackEvent } = useEventTracker()
  const { userId, signInOrUp, authError, setAuthError } = useAuthentication()
  const { userFullName, userEmail, userPhoneNumber, updateUserProfile } = useUserProfile(userId)

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [targetSlug, setTargetSlug] = useState<string | null>(null)
  const [onAuthSuccess, setOnAuthSuccess] = useState<(() => void) | null>(null)
  const [authContext, setAuthContext] = useState<'vault-access' | 'contact-developer' | null>(null)

  const { hasSignedCA, checkHasSignedCAForListing } = useCASigning(userId, targetSlug)
  const { checkVaultAccessAndReturnResult } = useVaultAccess()
  const { createSignWellDocument, error: signWellError, setError: setSignWellError } = useSignWell()

  const handleRequestVaultAccess = useCallback(async (slug: string) => {
    setTargetSlug(slug)

    // Check if user has already signed a CA for this specific listing
    const hasSignedCAForThisListing = userId ? await checkHasSignedCAForListing(slug) : false

    if (hasSignedCAForThisListing && userId) {
      trackEvent(userId, 'request_vault_access', { propertyId: slug })
      window.location.href = getListingPath(`/${slug}/access-dd-vault`)
      return
    }

    // If user has signed CA for this listing but is not authenticated, show auth modal for login/signup
    if (hasSignedCAForThisListing && !userId) {
      setIsAuthModalOpen(true)
      return
    }

    // If user is authenticated but hasn't signed CA for this listing, check if listing has vault access
    if (userId && userFullName && userEmail) {
      trackEvent(userId, 'request_vault_access', { propertyId: slug })

      try {
        // Check if listing has vault access
        const { hasVault, error } = await checkVaultAccessAndReturnResult(slug)

        if (error) {
          console.error('Error fetching listing data:', error)
          // Fallback to confirmation modal
          setIsConfirmationModalOpen(true)
          return
        }

        if (hasVault) {
          // Listing has vault access, proceed to SignWell
          await createSignWellDocument(userFullName, userEmail, slug)
        } else {
          // Listing doesn't have vault access, show confirmation modal
          setIsConfirmationModalOpen(true)
        }
      } catch (error) {
        console.error('Error in vault access check:', error)
        // Fallback to confirmation modal
        setIsConfirmationModalOpen(true)
      }
      return
    }

    // If user is not authenticated, show auth modal for login/signup
    setAuthContext('vault-access')
    setIsAuthModalOpen(true)

  }, [userId, userFullName, userEmail, trackEvent, checkVaultAccessAndReturnResult, createSignWellDocument, checkHasSignedCAForListing])

  const handleContactDeveloper = useCallback(async (slug: string) => {
    setTargetSlug(slug)

    // If user is authenticated, track the event and show confirmation modal
    if (userId && userFullName && userEmail) {
      // Fetch developer contact email from database
      try {
        const supabase = createClient()
        const { data: listing, error } = await supabase
          .from('listings')
          .select('developer_contact_email')
          .eq('slug', slug)
          .single()

        if (error) {
          console.error('Error fetching developer contact email:', error)
        }

        // Track the event with developer contact email
        trackEvent(userId, 'contact_developer', {
          propertyId: slug,
          developerContactEmail: listing?.developer_contact_email || null
        })
        setIsConfirmationModalOpen(true)
        return
      } catch (error) {
        console.error('Error in handleContactDeveloper:', error)
        // Still track the event even if we can't get the email
        trackEvent(userId, 'contact_developer', { propertyId: slug })
        setIsConfirmationModalOpen(true)
        return
      }
    }

    // If user is not authenticated, show auth modal for login/signup
    // Set up callback to show confirmation modal after successful auth
    setAuthContext('contact-developer')
    setOnAuthSuccess(() => {
      return async () => {
        // This callback will be executed after successful authentication
        // We need to wait a bit for the user state to be updated
        setTimeout(async () => {
          // Get userId from Supabase session directly since the hook state might not be updated yet
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          const currentUserId = session?.user?.id

          if (!currentUserId) {
            console.error('UserId not available after auth success')
            return
          }

          // Fetch developer contact email from database
          try {
            const { data: listing, error } = await supabase
              .from('listings')
              .select('developer_contact_email')
              .eq('slug', slug)
              .single()

            if (error) {
              console.error('Error fetching developer contact email:', error)
            }

            // Track the event with developer contact email
            trackEvent(currentUserId, 'contact_developer', {
              propertyId: slug,
              developerContactEmail: listing?.developer_contact_email || null
            })
            setIsConfirmationModalOpen(true)
          } catch (error) {
            console.error('Error in onAuthSuccess callback:', error)
            // Still track the event even if we can't get the email
            trackEvent(currentUserId, 'contact_developer', { propertyId: slug })
            setIsConfirmationModalOpen(true)
          }
        }, 1000) // Wait 1 second for state to update
      }
    })
    setIsAuthModalOpen(true)
  }, [userId, userFullName, userEmail, trackEvent])

  const handleSignInOrUp = useCallback(
    async (fullName: string, email: string, phoneNumber: string) => {
      const result = await signInOrUp(fullName, email)

      if (result?.success && result.userId) {
        // Update user profile with full name, email, and phone number
        const updateResult = await updateUserProfile(fullName, email, phoneNumber, result.userId)

        if (!updateResult.success) {
          console.error('Failed to update user profile:', updateResult.error)
          setAuthError('Failed to save user information. Please try again.')
          return
        }

        // Check if user has already signed CA for this specific listing
        const hasSignedCAForThisListing = targetSlug ? checkHasSignedCAForListing(targetSlug) : false

        // If this is for contacting developer, skip CA logic and go directly to success callback
        if (authContext === 'contact-developer') {
          setIsAuthModalOpen(false)

          // Call the success callback if we have one
          if (onAuthSuccess) {
            await onAuthSuccess()
            setOnAuthSuccess(null)
          }
          return
        }

        if (hasSignedCAForThisListing) {
          // User has already signed CA for this listing, redirect directly to vault
          setIsAuthModalOpen(false)
          window.location.href = getListingPath(`/${targetSlug}/access-dd-vault`)
        } else {
          // User needs to sign CA for this listing, check if listing has vault access
          setIsAuthModalOpen(false)

          if (targetSlug) {
            try {
              // Check if listing has vault access
              const { hasVault, error } = await checkVaultAccessAndReturnResult(targetSlug)

              if (error) {
                console.error('Error fetching listing data:', error)
                // Fallback to confirmation modal
                setIsConfirmationModalOpen(true)
                return
              }

              if (hasVault) {
                // Listing has vault access, proceed to SignWell
                await createSignWellDocument(fullName, email, targetSlug)
              } else {
                // Listing doesn't have vault access, show confirmation modal
                setIsConfirmationModalOpen(true)
              }
            } catch (error) {
              console.error('Error in vault access check:', error)
              // Fallback to confirmation modal
              setIsConfirmationModalOpen(true)
            }
          } else {
            console.error('No targetSlug available for SignWell document creation')
            setAuthError('Missing property information. Please try again.')
          }
        }

        // Call the success callback if we have one
        if (onAuthSuccess) {
          await onAuthSuccess()
          setOnAuthSuccess(null)
        }
      } else {
        console.error('Authentication failed:', result?.error)
        setAuthError(result?.error || 'Authentication failed. Please try again.')
      }
    },
    [signInOrUp, updateUserProfile, targetSlug, checkHasSignedCAForListing, checkVaultAccessAndReturnResult, createSignWellDocument, onAuthSuccess, setOnAuthSuccess, setAuthError, authContext]
  )


  const closeModal = useCallback(() => {
    setIsAuthModalOpen(false)
    setIsConfirmationModalOpen(false)
    setAuthError(null)
    setOnAuthSuccess(null)
    setAuthContext(null)
  }, [])

  return {
    isAuthModalOpen,
    isConfirmationModalOpen,
    authError,
    isLoading: false, // This will be handled by individual hooks
    userFullName,
    userEmail,
    userPhoneNumber,
    checkHasSignedCAForListing,
    handleRequestVaultAccess,
    handleContactDeveloper,
    handleSignInOrUp,
    closeModal,
    authContext,
  }
}
