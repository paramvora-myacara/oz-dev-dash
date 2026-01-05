'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload, Trash2, Image as ImageIcon, Plus } from 'lucide-react'
import {
  getCampaignImages,
  uploadCampaignImage,
  deleteCampaignImage,
  ensureCampaignImageFolder
} from '@/utils/supabaseImages'

interface CampaignImagePickerProps {
  campaignName: string
  campaignId: string
  isOpen: boolean
  onClose: () => void
  onImageSelect: (imageUrl: string) => void
}

export default function CampaignImagePicker({
  campaignName,
  campaignId,
  isOpen,
  onClose,
  onImageSelect
}: CampaignImagePickerProps) {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load images when modal opens
  useEffect(() => {
    if (isOpen && campaignId) {
      loadImages()
    }
  }, [isOpen, campaignId])

  const loadImages = async () => {
    setIsLoading(true)
    try {
      const imageUrls = await getCampaignImages(campaignName, campaignId)
      setImages(imageUrls)
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    setSuccessMessage(null)

    try {
      // Ensure folder exists
      await ensureCampaignImageFolder(campaignName, campaignId)

      // Upload the image
      const result = await uploadCampaignImage(campaignName, campaignId, file)

      if (result.success) {
        setSuccessMessage('Image uploaded successfully')
        await loadImages() // Refresh the list
      } else {
        setUploadError(result.error || 'Upload failed')
      }
    } catch (error) {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    setDeleteError(null)
    setSuccessMessage(null)

    try {
      // Extract filename from URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const filename = pathParts[pathParts.length - 1]

      if (!filename) {
        setDeleteError('Invalid image URL')
        return
      }

      const result = await deleteCampaignImage(campaignName, campaignId, filename)

      if (result.success) {
        setSuccessMessage('Image deleted successfully')
        // Remove from local state
        setImages(images.filter(img => img !== imageUrl))
      } else {
        setDeleteError(result.error || 'Delete failed')
      }
    } catch (error) {
      setDeleteError('Delete failed. Please try again.')
    }
  }

  const clearMessages = () => {
    setUploadError(null)
    setDeleteError(null)
    setSuccessMessage(null)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Campaign Images - {campaignName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Upload Section */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={16} />
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              <span className="text-sm text-gray-500">
                JPG, PNG, WebP, GIF up to 10MB
              </span>
            </div>
          </div>

          {/* Messages */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {uploadError}
            </div>
          )}
          {deleteError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {deleteError}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Images Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading images...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No images uploaded yet.</p>
              <p className="text-sm text-gray-400 mt-1">Upload your first image above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => {
                        onImageSelect(imageUrl)
                        onClose()
                      }}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteImage(imageUrl)
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
