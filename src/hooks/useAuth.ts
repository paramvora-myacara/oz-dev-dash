'use client'

import { useState, useCallback } from 'react'
import { useEventTracker } from './useEventTracker'
import { useAuthentication } from './useAuthentication'
import { useUserProfile } from './useUserProfile'
import { useCASigning } from './useCASigning'
import { useVaultAccess } from './useVaultAccess'
import { useSignWell } from './useSignWell'
import { createClient } from '@/utils/supabase/client'

export function useAuth() {
  const { trackEvent } = useEventTracker()
  const { userId, signInOrUp, authError, setAuthError } = useAuthentication()
  const { userFullName, userEmail, updateUserProfile } = useUserProfile(userId)
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [targetSlug, setTargetSlug] = useState<string | null>(null)
  const [onAuthSuccess, setOnAuthSuccess] = useState<(() => void) | null>(null)
  const [authContext, setAuthContext] = useState<'vault-access' | 'contact-developer' | null>(null)
  
  const { hasSignedCA, checkHasSignedCAForListing, markAsSigned } = useCASigning(userId, targetSlug)
  const { checkVaultAccessAndReturnResult } = useVaultAccess()
  const { createSignWellDocument, error: signWellError, setError: setSignWellError } = useSignWell()

  const handleRequestVaultAccess = useCallback(async (slug: string) => {
    setTargetSlug(slug)
    
    // Check if user has already signed a CA for this specific listing
    const hasSignedCAForThisListing = userId ? checkHasSignedCAForListing(slug) : false
    
    // If user has signed CA for this listing and is authenticated, go directly to vault
    if (hasSignedCAForThisListing && userId) {
      trackEvent(userId, 'request_vault_access', { propertyId: slug })
      window.location.href = `/${slug}/access-dd-vault`
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
          // Listing has vault access, show SignWell directly
          console.log('Listing has vault access, showing SignWell directly')
          
          // Ensure we have valid user data before proceeding
          if (!userFullName || !userEmail) {
            console.error('Missing user data for SignWell:', { userFullName, userEmail })
            // Fallback to confirmation modal if user data is missing
            setIsConfirmationModalOpen(true)
            return
          }
          
          await createSignWellDocument(userFullName, userEmail, slug, (signedSlug) => {
            markAsSigned(signedSlug)
            window.location.href = `/${signedSlug}/access-dd-vault`
          })
        } else {
          // Listing doesn't have vault access, show confirmation modal
          console.log('Listing does not have vault access, showing confirmation modal')
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
    
  }, [userId, userFullName, userEmail, trackEvent, checkVaultAccessAndReturnResult, createSignWellDocument, markAsSigned, checkHasSignedCAForListing])

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
    console.log('Setting up onAuthSuccess callback for contact developer')
    setOnAuthSuccess(() => {
      console.log('onAuthSuccess callback created for contact developer')
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
          
          console.log('Got userId from session:', currentUserId)
          
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
            console.log('Contact developer event tracked successfully')
            setIsConfirmationModalOpen(true)
          } catch (error) {
            console.error('Error in handleContactDeveloper auth success:', error)
            // Still track the event even if we can't get the email
            trackEvent(currentUserId, 'contact_developer', { propertyId: slug })
            console.log('Contact developer event tracked successfully (without email)')
            setIsConfirmationModalOpen(true)
          }
        }, 100) // Small delay to ensure user state is updated
      }
    })
    setIsAuthModalOpen(true)
  }, [userId, userFullName, userEmail, trackEvent])

  const handleSignInOrUp = useCallback(
    async (fullName: string, email: string) => {
      const result = await signInOrUp(fullName, email)
      
      if (result?.success && result.userId) {
        // Update user profile with full name
        await updateUserProfile(fullName, email)
        
        // Check if user has already signed CA for this specific listing
        const hasSignedCAForThisListing = targetSlug ? checkHasSignedCAForListing(targetSlug) : false
        
        // If this is for contacting developer, skip CA logic and go directly to success callback
        if (authContext === 'contact-developer') {
          console.log('Contact developer auth - skipping CA logic')
          setIsAuthModalOpen(false)
          
          // Call the success callback if we have one
          if (onAuthSuccess) {
            console.log('Calling onAuthSuccess callback for contact developer')
            await onAuthSuccess()
            setOnAuthSuccess(null)
          } else {
            console.log('No onAuthSuccess callback found for contact developer')
          }
          return
        }
        
        if (hasSignedCAForThisListing) {
          // User has already signed CA for this listing, redirect directly to vault
          console.log('User has signed CA for this listing, redirecting to vault...')
          setIsAuthModalOpen(false)
          window.location.href = `/${targetSlug}/access-dd-vault`
        } else {
          // User needs to sign CA for this listing, check if listing has vault access
          console.log('User needs to sign CA for this listing, checking vault access...')
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
                console.log('Listing has vault access, proceeding to SignWell...')
                await createSignWellDocument(fullName, email, targetSlug, (signedSlug) => {
                  markAsSigned(signedSlug)
                  window.location.href = `/${signedSlug}/access-dd-vault`
                })
              } else {
                // Listing doesn't have vault access, show confirmation modal
                console.log('Listing does not have vault access, showing confirmation modal')
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
      }
    },
    [signInOrUp, updateUserProfile, targetSlug, checkHasSignedCAForListing, checkVaultAccessAndReturnResult, createSignWellDocument, markAsSigned, onAuthSuccess, setOnAuthSuccess, setAuthError, authContext]
  )

  // New CA submission handler - ONLY handles document creation, no auth logic
  const handleCASubmission = useCallback(async (
    fullName: string, 
    email: string
  ) => {
    console.log('handleCASubmission called with:', { fullName, email })
    
    try {
      // At this point, user should already be authenticated via handleSignInOrUp
      // Just create the SignWell document
      console.log('About to create SignWell document...')
      if (!targetSlug) {
        console.error('No targetSlug available for SignWell document creation')
        setAuthError('Missing property information. Please try again.')
        return
      }
      await createSignWellDocument(fullName, email, targetSlug, (signedSlug) => {
        markAsSigned(signedSlug)
        window.location.href = `/${signedSlug}/access-dd-vault`
      })
      
    } catch (error: any) {
      console.error('Error in handleCASubmission:', error)
      setAuthError(error.message)
    }
  }, [targetSlug, createSignWellDocument, markAsSigned, setAuthError])

  const closeModal = () => {
    setIsAuthModalOpen(false)
    setIsConfirmationModalOpen(false)
    setAuthError(null)
    setSignWellError(null)
    setAuthContext(null)
  }

  return {
    userId,
    isAuthModalOpen,
    isConfirmationModalOpen,
    authError: authError || signWellError,
    isLoading: false, // Loading state is now handled by individual hooks
    userFullName,
    userEmail,
    targetSlug,
    hasSignedCA,
    checkHasSignedCAForListing,
    handleRequestVaultAccess,
    handleSignInOrUp,
    handleCASubmission,
    handleContactDeveloper,
    closeModal,
    authContext,
  }
}

 