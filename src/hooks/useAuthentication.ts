'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useEventTracker } from './useEventTracker'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

const USER_UID_KEY = 'ozl_user_uid'

export function useAuthentication() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const { trackEvent } = useEventTracker()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

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

  const signInOrUp = useCallback(
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
          
          // Track the event after successful authentication
          trackEvent(newUserId, 'request_vault_access')
          
          return { success: true, userId: newUserId }
        }
      } catch (error: any) {
        console.error('Authentication error:', error)
        setAuthError(error.message || 'An unexpected error occurred.')
        return { success: false, error: error.message }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, trackEvent]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  return {
    userId,
    isLoading,
    authError,
    signInOrUp,
    signOut,
    setAuthError,
  }
} 