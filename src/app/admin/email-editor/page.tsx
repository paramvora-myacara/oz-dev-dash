'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EmailEditor } from '@/components/email-editor'
import type { SampleData } from '@/types/email-editor'

interface AdminUser {
  id: string
  email: string
}

export default function EmailEditorPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  
  // CSV state for EmailEditor
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvFileName, setCsvFileName] = useState<string | null>(null)
  const [sampleData, setSampleData] = useState<SampleData | null>(null)

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

  const handleCsvUpload = (file: File, fileName: string, data: SampleData) => {
    setCsvFile(file)
    setCsvFileName(fileName)
    setSampleData(data)
  }

  const handleCsvRemove = () => {
    setCsvFile(null)
    setCsvFileName(null)
    setSampleData(null)
  }

  const handleAutoSave = async (sections: any[], subjectLine: any, emailFormat: 'html' | 'text') => {
    console.log('Auto-saving draft:', { sections, subjectLine, emailFormat })
    // TODO: Implement save to database
    return true // Return true on success
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Page Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/email-campaigns"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-lg font-semibold text-gray-900">Email Editor</h1>
        </div>
        <div className="text-sm text-gray-500">
          {user?.email}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <EmailEditor
          csvFile={csvFile}
          csvFileName={csvFileName}
          sampleData={sampleData}
          onCsvUpload={handleCsvUpload}
          onCsvRemove={handleCsvRemove}
          onAutoSave={handleAutoSave}
        />
      </div>
    </div>
  )
}
