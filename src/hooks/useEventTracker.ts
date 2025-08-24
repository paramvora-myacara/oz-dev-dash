'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export type EventType = 'request_vault_access' | 'page_view' | 'contact_developer'

export interface EventMetadata {
  propertyId?: string
  developerContactEmail?: string | null
  [key: string]: any
}

export function useEventTracker() {
  const supabase = createClient()
  const pathname = usePathname()

  const getPropertyIdFromPath = useCallback(() => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length > 0 && ['the-edge-on-main', 'marshall-st-louis', 'sogood-dallas'].includes(parts[0])) {
      return parts[0]
    }
    return null
  }, [pathname])

  const trackEvent = useCallback(
    async (userId: string, eventType: EventType, metadata: EventMetadata = {}) => {
      const propertyId = getPropertyIdFromPath()
      const eventData = {
        user_id: userId,
        event_type: eventType,
        endpoint: pathname,
        metadata: {
          ...metadata,
          propertyId: metadata.propertyId || propertyId,
          url: window.location.href,
        },
      }

      console.log('Tracking event:', eventData)
      const { error } = await supabase.from('user_events').insert([eventData])

      if (error) {
        console.error('Error tracking event:', error)
      }
    },
    [supabase, pathname, getPropertyIdFromPath]
  )

  return { trackEvent }
} 