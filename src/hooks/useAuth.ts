'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useEventTracker } from './useEventTracker'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

const SUPABASE_SESSION_KEY = 'supabase.auth.token'
const USER_UID_KEY = 'ozl_user_uid'

export function useAuth() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const { trackEvent } = useEventTracker()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [onAuthSuccess, setOnAuthSuccess] = useState<(() => void) | null>(null)
  const [userFullName, setUserFullName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [targetSlug, setTargetSlug] = useState<string | null>(null)
  const [hasSignedCA, setHasSignedCA] = useState<boolean>(false)

  useEffect(() => {
    const ozlUid = searchParams.get('uid')
    if (ozlUid) {
      sessionStorage.setItem(USER_UID_KEY, ozlUid)
      setUserId(ozlUid)
    } else {
      const storedUid = sessionStorage.getItem(USER_UID_KEY)
      if (storedUid) {
        setUserId(storedUid)
      }
    }
  }, [searchParams])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user?.id) {
          const newUserId = session.user.id
          setUserId(newUserId)
          sessionStorage.setItem(USER_UID_KEY, newUserId)
          trackEvent(newUserId, 'page_view')
        } else if (event === 'SIGNED_OUT') {
          setUserId(null)
          sessionStorage.removeItem(USER_UID_KEY)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, trackEvent])

  // Check CA signing status on mount
  useEffect(() => {
    const caSigned = localStorage.getItem('ozl_ca_signed') === 'true'
    setHasSignedCA(caSigned)
  }, [])

  // Enhanced user data fetching
  useEffect(() => {
    const fetchUserAndAuth = async () => {
      if (userId) {
        // Check for active Supabase session
        const { data: { session } } = await supabase.auth.getSession()
        
        // Fetch user details from public.users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', userId)
          .single()
        
        if (userData) {
          setUserFullName(userData.full_name)
          setUserEmail(userData.email)
          
          // Auto-login if no session but we have user data
          if (!session && userData.email) {
            const password = `${userData.email}_password`
            await supabase.auth.signInWithPassword({
              email: userData.email,
              password: password
            })
          }
        }
      }
    }
    
    fetchUserAndAuth()
  }, [userId, supabase])

  const handleRequestVaultAccess = useCallback((slug: string) => {
    setTargetSlug(slug)
    
    // Check if user has already signed a CA
    const hasSignedCA = localStorage.getItem('ozl_ca_signed') === 'true'
    setHasSignedCA(hasSignedCA)
    
    // If user has signed CA and is authenticated, go directly to vault
    if (hasSignedCA && userId) {
      trackEvent(userId, 'request_vault_access', { propertyId: slug })
      window.location.href = `/${slug}/access-dd-vault`
      return
    }
    
    // If user has signed CA but is not authenticated, show auth modal for login/signup
    if (hasSignedCA && !userId) {
      setIsAuthModalOpen(true)
      return
    }
    
    // If user is authenticated but hasn't signed CA, show confirmation modal for CA signing
    if (userId && userFullName && userEmail) {
      // Known user - go directly to CA signing confirmation
      trackEvent(userId, 'request_vault_access', { propertyId: slug })
      setIsConfirmationModalOpen(true)
      return
    }
    
    // If user is not authenticated, show auth modal for login/signup
    setIsAuthModalOpen(true)
    
  }, [userId, userFullName, userEmail, trackEvent])

  const handleSignInOrUp = useCallback(
    async (fullName: string, email: string) => {
      setIsLoading(true)
      setAuthError(null)
      const password = `${email}_password`

      try {
        // Attempt to sign in first
        const {
          data: signInData,
          error: signInError,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        // Default to the sign-in data; it may be replaced by sign-up data below
        let authData: { user: User | null; session: Session | null } = signInData

        if (
          signInError &&
          signInError.message.includes('Invalid login credentials')
        ) {
          // If sign-in fails because the user does not exist, try to sign up
          const {
            data: signUpData,
            error: signUpError,
          } = await supabase.auth.signUp({
            email,
            password,
          })
          if (signUpError) {
            throw signUpError
          }
          authData = signUpData
        } else if (signInError) {
          // Other sign-in errors should be surfaced
          throw signInError
        }

        if (authData.user) {
          const newUserId = authData.user.id
          setUserId(newUserId)
          sessionStorage.setItem(USER_UID_KEY, newUserId)
          
          // Update user profile with full name
          try {
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: newUserId,
                full_name: fullName,
                email: email,
                updated_at: new Date().toISOString()
              })
            
            if (profileError) {
              console.error('Error updating user profile:', profileError)
            }
          } catch (profileError) {
            console.error('Error updating user profile:', profileError)
          }
          
          // Track the event after successful authentication
          trackEvent(newUserId, 'request_vault_access')
          
          // Ensure session is properly established before proceeding
          console.log('Authentication successful, checking session...')
          
          // Small delay to ensure session cookies are properly set
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const { data: { session } } = await supabase.auth.getSession()
          console.log('Session after auth:', session ? 'Valid' : 'None')
          
          // Check if user has already signed CA
          const hasSignedCA = localStorage.getItem('ozl_ca_signed') === 'true'
          setHasSignedCA(hasSignedCA)
          
          if (hasSignedCA) {
            // User has already signed CA, redirect directly to vault
            console.log('User has signed CA, redirecting to vault...')
            setIsAuthModalOpen(false)
            window.location.href = `/${targetSlug}/access-dd-vault`
          } else {
            // User needs to sign CA, show confirmation modal
            console.log('User needs to sign CA, showing confirmation modal...')
            setIsAuthModalOpen(false)
            setIsConfirmationModalOpen(true)
          }
          
          // Call the success callback if we have one
          if (onAuthSuccess) {
            onAuthSuccess()
            setOnAuthSuccess(null)
          }
        }
      } catch (error: any) {
        console.error('Authentication error:', error)
        setAuthError(error.message || 'An unexpected error occurred.')
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, trackEvent]
  )

  // New CA submission handler - ONLY handles document creation, no auth logic
  const handleCASubmission = useCallback(async (
    fullName: string, 
    email: string
  ) => {
    console.log('handleCASubmission called with:', { fullName, email })
    setIsLoading(true)
    setAuthError(null)
    
    try {
      // At this point, user should already be authenticated via handleSignInOrUp
      // Just create the SignWell document
      console.log('About to create SignWell document...')
      await createSignWellDocument(fullName, email)
      
    } catch (error: any) {
      console.error('Error in handleCASubmission:', error)
      setAuthError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // SignWell document creation function
  const createSignWellDocument = useCallback(async (
    fullName: string, 
    email: string
  ) => {
    try {
      console.log('Creating SignWell document...');
      const response = await fetch('/api/signwell/create-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          targetSlug: window.location.pathname.split('/')[1] // Extract slug from current URL
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create SignWell document:", errorData);
        setAuthError("Failed to create document. Please try again.");
        return;
      }

      const { embeddedSigningUrl } = await response.json()
      console.log('SignWell document created, URL:', embeddedSigningUrl);
      
      // Close our modal first so SignWell is visible
      setIsAuthModalOpen(false);
      
      // Wait for SignWell script to load with a timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      const waitForSignWell = () => {
        attempts++;
        console.log(`Attempt ${attempts}: Checking if SignWellEmbed is available...`);
        
        // Check multiple possible global variable names
        const signWellEmbed = (window as any).SignWellEmbed || (window as any).signwell?.Embed || (window as any).SignWell?.Embed;
        
        if (typeof signWellEmbed !== 'undefined') {
          console.log('SignWell embedded signing found, opening modal...');
          openSignWellModal(embeddedSigningUrl, signWellEmbed);
          return;
        }
        
        // Log what we found for debugging
        if (attempts === 1) {
          console.log('Debugging SignWell globals:');
          console.log('window.SignWellEmbed:', typeof (window as any).SignWellEmbed);
          console.log('window.signwell:', (window as any).signwell);
          console.log('window.SignWell:', (window as any).SignWell);
          
          // Check all global variables that might contain SignWell
          const globalVars = Object.keys(window).filter(key => 
            key.toLowerCase().includes('signwell') || 
            key.toLowerCase().includes('sign') ||
            key.toLowerCase().includes('embed')
          );
          console.log('Potential SignWell globals:', globalVars);
        }
        
        if (attempts >= maxAttempts) {
          console.error('SignWellEmbed failed to load after 5 seconds');
          setAuthError("SignWell failed to load. Please refresh the page and try again.");
          // Reopen our modal if SignWell fails
          setIsAuthModalOpen(true);
          return;
        }
        
        // Wait 100ms before next attempt
        setTimeout(waitForSignWell, 100);
      };
      
      const openSignWellModal = (url: string, SignWellConstructor: any) => {
        try {
          // Open SignWell embedded signing
          const signWellEmbed = new SignWellConstructor({
            url: url,
            events: {
              completed: async (e: any) => {
                console.log('SignWell signing completed');
                
                // Set the CA signed flag in local storage (persistent)
                localStorage.setItem('ozl_ca_signed', 'true')
                setHasSignedCA(true)
                
                // Redirect to vault after successful signing using the stored targetSlug
                if (targetSlug) {
                  window.location.href = `/${targetSlug}/access-dd-vault`
                } else {
                  console.error('No targetSlug found for redirect')
                  // Fallback to current path if targetSlug is missing
                  const currentSlug = window.location.pathname.split('/')[1]
                  if (currentSlug && currentSlug !== '') {
                    window.location.href = `/${currentSlug}/access-dd-vault`
                  } else {
                    // If we can't determine the slug, redirect to home
                    window.location.href = '/'
                  }
                }
              },
              closed: (e: any) => {
                // Handle modal close - reopen confirmation modal if user didn't complete signing
                console.log('SignWell modal closed')
                // Reopen the confirmation modal so user can try signing again
                setIsConfirmationModalOpen(true)
              }
            }
          })
          
          signWellEmbed.open()
        } catch (error) {
          console.error('Error opening SignWell modal:', error);
          setAuthError("Failed to open signing modal. Please try again.");
          // Reopen our modal if SignWell fails
          setIsAuthModalOpen(true);
        }
      };
      
      // Start waiting for SignWell to load
      waitForSignWell();
      
    } catch (error) {
      console.error('Error in createSignWellDocument:', error);
      setAuthError("An error occurred while creating the document.");
    }
  }, [])

  const closeModal = () => {
    setIsAuthModalOpen(false)
    setIsConfirmationModalOpen(false)
    setAuthError(null)
  }

  return {
    userId,
    isAuthModalOpen,
    isConfirmationModalOpen,
    authError,
    isLoading,
    userFullName,
    userEmail,
    targetSlug,
    hasSignedCA,
    handleRequestVaultAccess,
    handleSignInOrUp,
    handleCASubmission,
    closeModal,
  }
}

 