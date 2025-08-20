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

  const handleRequestVaultAccess = useCallback((onSuccess?: () => void) => {
    const storedUid = sessionStorage.getItem(USER_UID_KEY)
    if (storedUid) {
      trackEvent(storedUid, 'request_vault_access')
      if (onSuccess) {
        onSuccess()
      } else {
        setIsConfirmationModalOpen(true)
      }
    } else {
      if (onSuccess) {
        setOnAuthSuccess(() => onSuccess)
      }
      setIsAuthModalOpen(true)
    }
  }, [trackEvent])

  const handleSignInOrUp = useCallback(
    async (email: string, fullName: string) => {
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
          setIsAuthModalOpen(false)
          
          // Call the success callback if we have one
          if (onAuthSuccess) {
            onAuthSuccess()
            setOnAuthSuccess(null)
          } else {
            setIsConfirmationModalOpen(true)
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
    handleRequestVaultAccess,
    handleSignInOrUp,
    closeModal,
  }
} 