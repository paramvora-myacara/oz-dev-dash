'use client'

import { createContext, useContext } from 'react'

interface EmailEditorContextType {
  campaignName?: string
  campaignId?: string
}

const EmailEditorContext = createContext<EmailEditorContextType>({})

export const useEmailEditor = () => {
  const context = useContext(EmailEditorContext)
  if (!context) {
    throw new Error('useEmailEditor must be used within an EmailEditorProvider')
  }
  return context
}

export { EmailEditorContext }
