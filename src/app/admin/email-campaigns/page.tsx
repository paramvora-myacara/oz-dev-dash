'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/admin/FileUpload'
import CampaignStatus from '@/components/admin/CampaignStatus'

interface AdminUser {
  id: string
  email: string
}

export default function EmailCampaignsPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [campaignStatus, setCampaignStatus] = useState<{
    status: 'sending' | 'completed' | 'paused'
    total: number
    queued: number
    sent: number
    failed: number
    lastUpdated?: string
  } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchMessage, setLaunchMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/me')
        if (response.ok) {
          const adminData = await response.json()
          setUser(adminData.user)
        } else {
          if (response.status === 401) {
            router.push('/admin/login')
            return
          }
          setError('Failed to load admin data')
        }
      } catch (err) {
        setError('Network error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/campaigns/status')
      if (response.ok) {
        const data = await response.json()
        setCampaignStatus(data)
      } else {
        console.error('Failed to fetch campaign status')
      }
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Fetch status on page load
  useEffect(() => {
    if (!isLoading) {
      handleRefreshStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const handleLaunchCampaign = async () => {
    if (!selectedFile) {
      setLaunchMessage({ type: 'error', text: 'Please select a CSV file first' })
      return
    }

    setIsLaunching(true)
    setLaunchMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/campaigns/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        console.log('API Response:', data)
        setLaunchMessage({ 
          type: 'success', 
          text: `Campaign launched successfully! ${data.totalEmails || data.queued || 0} emails queued.` 
        })
        
        // Refresh campaign status after successful launch
        try {
          await handleRefreshStatus()
        } catch (refreshError) {
          console.error('Error refreshing status:', refreshError)
          // Don't fail the whole operation if status refresh fails
        }
        
        // Clear selected file after successful launch
        setSelectedFile(null)
      } else {
        console.error('API Error:', data)
        setLaunchMessage({ 
          type: 'error', 
          text: data.error || 'Failed to launch campaign. Check console for details.' 
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setLaunchMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Network error. Please try again.' 
      })
    } finally {
      setIsLaunching(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Campaign</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome, {user?.email}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📎 Upload CSV File</h2>
            <FileUpload 
              onFileSelect={(file) => setSelectedFile(file)}
              accept=".csv"
            />
            {selectedFile && (
              <div className="mt-4">
                {launchMessage && (
                  <div className={`mb-4 p-3 rounded-md ${
                    launchMessage.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {launchMessage.text}
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={handleLaunchCampaign}
                    disabled={isLaunching}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLaunching ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Launching...
                      </>
                    ) : (
                      'Launch Campaign'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Section */}
        <div className="px-4 py-6 sm:px-0">
          <CampaignStatus 
            data={campaignStatus}
            onRefresh={handleRefreshStatus}
            isLoading={isRefreshing}
          />
        </div>
      </div>
    </div>
  )
}

