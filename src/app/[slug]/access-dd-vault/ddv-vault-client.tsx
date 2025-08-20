'use client'

import { useState } from 'react'
import { Listing } from '@/types/listing'
import { DDVFile } from '@/lib/supabase/ddv'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { ViewModeToolbar } from '@/components/editor/ViewModeToolbar'
import { formatFileSize, formatDate } from '@/utils/helpers'
import ContactDeveloperModal from '@/components/ContactDeveloperModal'

interface DDVVaultClientProps {
  listing: Listing
  files: DDVFile[]
  slug: string
}

export default function DDVVaultClient({ listing, files, slug }: DDVVaultClientProps) {
  const { isAdmin, canEditSlug, isLoading } = useAdminAuth()
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  
  const showAdminToolbar = !isLoading && isAdmin && canEditSlug(slug)
  
  const handleFileDownload = async (fileName: string) => {
    setDownloadingFile(fileName)
    try {
      const response = await fetch(`/api/ddv/${slug}/download?file=${encodeURIComponent(fileName)}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Failed to download file')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
    } finally {
      setDownloadingFile(null)
    }
  }
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'xls':
      case 'xlsx':
        return '📊'
      case 'ppt':
      case 'pptx':
        return '📈'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      case 'zip':
      case 'rar':
        return '📦'
      default:
        return '📎'
    }
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {showAdminToolbar && (
        <ViewModeToolbar slug={slug} />
      )}
      <div className={`max-w-7xl mx-auto px-4 py-8 ${showAdminToolbar ? 'pt-24' : 'pt-16'}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Due Diligence Vault
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Access confidential documents and materials for {listing.listingName}. 
            
          </p>
        </div>
        
        {/* Files Grid */}
        {files.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No files available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              The due diligence vault is currently empty or files are being prepared.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div
                key={file.name}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{getFileIcon(file.name)}</div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(file.updated_at)}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {file.name}
                  </h3>
                  
                  <button
                    onClick={() => handleFileDownload(file.name)}
                    disabled={downloadingFile === file.name}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {downloadingFile === file.name ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you're having trouble accessing files or need additional information, 
              please contact the development team.
            </p>
            {(listing.listingSlug === 'the-edge-on-main' || listing.listingSlug === 'up-campus-reno') && listing.developerInfo ? (
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Contact Support
              </button>
            ) : (
              <a
                href={`${process.env.NEXT_PUBLIC_SCHEDULE_CALL_LINK}?endpoint=/${listing.listingSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Contact Support
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact Developer Modal */}
      {listing.developerInfo && (
        <ContactDeveloperModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          developerInfo={listing.developerInfo}
          listingName={listing.listingName}
        />
      )}
    </div>
  )
} 