'use client'

import { useState, FormEvent, useEffect } from 'react'
import { X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (fullName: string, email: string, company?: string, title?: string) => void
  isLoading: boolean
  authError: string | null
  userFullName?: string | null
  userEmail?: string | null
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  authError,
  userFullName,
  userEmail,
}: AuthModalProps) {
  const [fullName, setFullName] = useState(userFullName || '')
  const [email, setEmail] = useState(userEmail || '')

  // Auto-fill when props change
  useEffect(() => {
    if (userFullName) setFullName(userFullName)
    if (userEmail) setEmail(userEmail)
  }, [userFullName, userEmail])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with:', { fullName, email })
    
    // Client-side validation
    if (!fullName || !fullName.trim()) {
      console.log('Form validation failed - missing full name')
      return
    }
    
    if (!email || !email.trim()) {
      console.log('Form validation failed - missing email')
      return
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      console.log('Form validation failed - invalid email format')
      return
    }
    
    console.log('Calling onSubmit function...')
    onSubmit(fullName.trim(), email.trim())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/70 backdrop-blur-lg">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full m-4 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            Request Vault Access
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please provide your information to access confidential investment materials.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                required
                disabled={!!userFullName} // Disable if auto-filled
                placeholder="Full Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                required
                disabled={!!userEmail} // Disable if auto-filled
                placeholder="you@example.com"
              />
            </div>
            
            {authError && (
              <p className="text-red-500 text-sm mt-3">{authError}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Proceed to Signing a CA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function ConfirmationModal({
  isOpen,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/70 backdrop-blur-lg">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full m-4 relative text-center animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        <div className="text-green-500 dark:text-green-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          Thank You for Your Interest!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your request has been noted. Our team will be in touch shortly with the next steps.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  )
} 