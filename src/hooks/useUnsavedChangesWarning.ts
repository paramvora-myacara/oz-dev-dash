'use client'

import { useEffect, useCallback } from 'react'

/**
 * Hook to warn users when they try to leave a page with unsaved changes.
 * 
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param message - Optional custom message (note: most browsers ignore this and show their own message)
 */
export function useUnsavedChangesWarning(
  hasUnsavedChanges: boolean,
  message: string = 'You have unsaved changes. Are you sure you want to leave?'
) {
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        // Modern browsers require returnValue to be set
        e.returnValue = message
        return message
      }
    },
    [hasUnsavedChanges, message]
  )

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [handleBeforeUnload])
}

