'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useUserProfile(userId: string | null) {
  const supabase = createClient()
  const [userFullName, setUserFullName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Enhanced user data fetching
  useEffect(() => {
    const fetchUserAndAuth = async () => {
      if (userId) {
        setIsLoading(true)
        setError(null)
        
        try {
          // Check for active Supabase session
          const { data: { session } } = await supabase.auth.getSession()
          
          // Fetch user details from public.users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name, email, phone_number')
            .eq('id', userId)
            .single()
          
          if (userError) {
            throw userError
          }
          
          if (userData) {
            setUserFullName(userData.full_name)
            setUserEmail(userData.email)
            setUserPhoneNumber(userData.phone_number)
            
            // Auto-login if no session but we have user data
            if (!session && userData.email) {
              const password = `${userData.email}_password`
              await supabase.auth.signInWithPassword({
                email: userData.email,
                password: password
              })
            }
          }
        } catch (err: any) {
          console.error('Error fetching user profile:', err)
          setError(err.message || 'Failed to fetch user profile')
        } finally {
          setIsLoading(false)
        }
      } else {
        // Reset state when userId is null
        setUserFullName(null)
        setUserEmail(null)
        setUserPhoneNumber(null)
        setError(null)
      }
    }
    
    fetchUserAndAuth()
  }, [userId, supabase])

  const updateUserProfile = useCallback(async (
    fullName: string, 
    email: string,
    phoneNumber?: string,
    targetUserId?: string // Allow passing userId directly
  ) => {
    const currentUserId = targetUserId || userId
    
    if (!currentUserId) {
      console.error('No user ID available for updateUserProfile')
      return { success: false, error: 'No user ID' }
    }
    
    console.log('updateUserProfile called with:', { fullName, email, phoneNumber, currentUserId })
    
    setIsLoading(true)
    setError(null)
    
    try {
      const updateData: any = {
        id: currentUserId,
        full_name: fullName,
        email: email,
        updated_at: new Date().toISOString()
      }
      
      // Only include phone_number if provided
      if (phoneNumber) {
        updateData.phone_number = phoneNumber
      }
      
      console.log('Upserting data to users table:', updateData)
      
      const { data, error: profileError } = await supabase
        .from('users')
        .upsert(updateData)
        .select()
      
      if (profileError) {
        console.error('Profile upsert error:', profileError)
        throw profileError
      }
      
      console.log('Profile upsert success:', data)
      
      setUserFullName(fullName)
      setUserEmail(email)
      if (phoneNumber) {
        setUserPhoneNumber(phoneNumber)
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('Error updating user profile:', err)
      setError(err.message || 'Failed to update user profile')
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  return {
    userFullName,
    userEmail,
    userPhoneNumber,
    isLoading,
    error,
    updateUserProfile,
  }
}
