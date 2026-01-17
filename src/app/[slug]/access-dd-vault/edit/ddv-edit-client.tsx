'use client'

import { useState, useRef } from 'react'
import { Listing } from '@/types/listing'
import { DDVFile } from '@/lib/supabase/ddv'
import { formatFileSize, formatDate } from '@/utils/helpers'
import { DDVEditToolbar } from '@/components/editor/DDVEditToolbar'
import { useResumableUpload } from '@/hooks/useResumableUpload'
import { UploadProgressBar } from '@/components/UploadProgressBar'

interface DDVEditClientProps {
  listing: Listing
  files: DDVFile[]
  slug: string
  listingId: string
}

export default function DDVEditClient({ listing, files, slug, listingId }: DDVEditClientProps) {
  const [currentFiles, setCurrentFiles] = useState<DDVFile[]>(files)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<Array<{
    file: File
    status: 'queued' | 'uploading' | 'completed' | 'failed'
    progress?: number
    error?: string
  }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Use the resumable upload hook
  const { uploadFile, isUploading, progress, error, success, resetUpload } = useResumableUpload()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploadModalOpen(false)
    
    // Initialize upload queue
    const fileArray = Array.from(files)
    const initialQueue = fileArray.map(file => ({
      file,
      status: 'queued' as const,
      progress: 0
    }))
    setUploadQueue(initialQueue)
    
    // Process files sequentially
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      
      try {
        // Update status to uploading
        setUploadQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'uploading' } : item
        ))
        
        // Use the resumable upload hook
        // Use single bucket with listing ID folder structure
        const bucketName = 'ddv-vault'
        const filePath = `${listingId}/${file.name}`
        const result = await uploadFile(file, bucketName, filePath)
        
        // If upload is successful, add the file to the list with real data
        if (result.success && result.fileData) {
          const newFile: DDVFile = {
            name: result.fileData.name,
            id: crypto.randomUUID(), // Generate a proper UUID
            updated_at: result.fileData.updated_at,
            size: result.fileData.size,
            metadata: {
              mimetype: result.fileData.mimetype
            }
          }
          setCurrentFiles(prev => [...prev, newFile])
          
          // Update queue status to completed
          setUploadQueue(prev => prev.map((item, idx) => 
            idx === i ? { ...item, status: 'completed', progress: 100 } : item
          ))
        } else {
          // Update queue status to failed
          setUploadQueue(prev => prev.map((item, idx) => 
            idx === i ? { ...item, status: 'failed', error: 'Upload failed' } : item
          ))
        }
      } catch (error: any) {
        console.error('Error uploading file:', error)
        // Update queue status to failed
        setUploadQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'failed', error: error.message || 'Unknown error' } : item
        ))
      }
    }
    
    // Reset upload state after all files are processed
    resetUpload()
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Clear upload queue after a delay to show completion status
    setTimeout(() => {
      setUploadQueue([])
    }, 3000)
  }

  const handleFileDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return

    setDeletingFile(fileName)

    try {
      const response = await fetch('/api/ddv/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName,
          listingSlug: slug
        })
      })

      if (response.ok) {
        setCurrentFiles(prev => prev.filter(file => file.name !== fileName))
      } else {
        console.error('Failed to delete file')
        alert('Failed to delete file. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file. Please try again.')
    } finally {
      setDeletingFile(null)
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
      <DDVEditToolbar slug={slug} />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Due Diligence Vault - Edit Mode
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Manage confidential documents and materials for {listing.listingName}.
          </p>
        </div>

        {/* Admin Controls */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New File
          </button>
        </div>

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Queue ({uploadQueue.filter(item => item.status === 'completed').length}/{uploadQueue.length} completed)
              </h3>
              <div className="space-y-3">
                {uploadQueue.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.file.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {item.status === 'queued' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Queued</span>
                      )}
                      {item.status === 'uploading' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress?.percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {progress?.percentage || 0}%
                          </span>
                        </div>
                      )}
                      {item.status === 'completed' && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                          ✓ Completed
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="text-xs text-red-600 dark:text-red-400 flex items-center">
                          ✗ Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {uploadQueue.some(item => item.status === 'failed') && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Some files failed to upload. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-red-500">⚠️</div>
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium">Upload Error</p>
                <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              </div>
              <button
                onClick={() => {
                  resetUpload()
                }}
                className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Upload Success */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-green-500">✅</div>
              <div>
                <p className="text-green-800 dark:text-green-200 font-medium">Upload Successful!</p>
                <p className="text-green-600 dark:text-green-300 text-sm">File has been uploaded to the vault.</p>
              </div>
              <button
                onClick={() => {
                  resetUpload()
                }}
                className="ml-auto text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
        />

        {/* Files Grid */}
        {currentFiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No files available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Upload files to get started with the due diligence vault.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFiles.map((file) => (
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
                  
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => {
                        // Download functionality
                        const link = document.createElement('a')
                        link.href = `/api/ddv/${slug}/download?file=${encodeURIComponent(file.name)}`
                        link.download = file.name
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 text-sm"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleFileDelete(file.name)}
                      disabled={deletingFile === file.name}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingFile === file.name ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Admin Controls
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You can add new files by clicking the "Add New File" button above, 
              and remove files using the delete button on each file card.
            </p>
            <a
              href={`/${slug}/access-dd-vault`}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              View Public DDV Page
            </a>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-all duration-300"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload New File
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Click the button below to select one or more files to upload to the due diligence vault.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Choose Files
              </button>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 