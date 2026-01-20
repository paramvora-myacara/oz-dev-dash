'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import * as tus from 'tus-js-client'

export interface UploadProgress {
  bytesUploaded: number
  bytesTotal: number
  percentage: number
}

interface UploadState {
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
  success: boolean
}

interface UseResumableUploadReturn extends UploadState {
  uploadFile: (file: File, bucketName: string, filePath: string) => Promise<{ success: boolean; fileData?: any }>
  resetUpload: () => void
}

export function useResumableUpload(): UseResumableUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: null,
    error: null,
    success: false
  })

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: null,
      error: null,
      success: false
    })
  }, [])

  const uploadFile = useCallback(async (file: File, bucketName: string, filePath: string) => {
    const supabase = createClient()

    try {
      // Get project ID from the Supabase URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

      // Handle both production Supabase URLs (https://project.supabase.co) and local development URLs
      let projectId: string | null = null
      let isLocalDev = false

      // Check if it's a production Supabase URL
      const prodMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
      if (prodMatch) {
        projectId = prodMatch[1]
      } else {
        // For local development, extract project info from the URL
        // Local Supabase typically runs on URLs like http://127.0.0.1:54321 or http://localhost:54321
        const url = new URL(supabaseUrl)
        if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
          isLocalDev = true
          projectId = 'local' // Use a default project ID for local dev
        }
      }

      if (!projectId) {
        throw new Error('Invalid Supabase URL configuration. Expected format: https://project.supabase.co or http://127.0.0.1:54321')
      }

      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        error: null,
        success: false
      }))

      return new Promise<{ success: boolean; fileData?: any }>((resolve, reject) => {
        // Construct the TUS endpoint based on environment
        const endpoint = isLocalDev
          ? `${supabaseUrl}/storage/v1/upload/resumable` // Local development endpoint
          : `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable` // Production endpoint

        const upload = new tus.Upload(file, {
          // Use direct storage hostname for optimal performance
          endpoint,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'x-upsert': 'true', // Allow overwriting existing files
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: bucketName,
            objectName: filePath,
            contentType: file.type,
            cacheControl: '3600',
          },
          chunkSize: 6 * 1024 * 1024, // 6MB chunks as required by Supabase
          onError: function (error) {
            console.error('Upload failed:', error)
            setUploadState(prev => ({
              ...prev,
              isUploading: false,
              error: error.message || 'Upload failed'
            }))
            resolve({ success: false })
          },
          onProgress: function (bytesUploaded, bytesTotal) {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100)
            setUploadState(prev => ({
              ...prev,
              progress: {
                bytesUploaded,
                bytesTotal,
                percentage
              }
            }))
          },
          onSuccess: function () {
            console.log('Upload completed successfully:', file.name)
            setUploadState(prev => ({
              ...prev,
              isUploading: false,
              success: true
            }))
            // Extract file data from the upload response
            const fileData = {
              name: file.name,
              size: file.size,
              mimetype: file.type,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              last_accessed_at: new Date().toISOString()
            }
            resolve({ success: true, fileData })
          },
        })

        // Check for previous uploads to resume
        upload.findPreviousUploads().then(function (previousUploads) {
          if (previousUploads.length) {
            console.log('Resuming from previous upload')
            upload.resumeFromPreviousUpload(previousUploads[0])
          }
          // Start the upload
          upload.start()
        }).catch((error) => {
          console.error('Error finding previous uploads:', error)
          // Start fresh upload if resuming fails
          upload.start()
        })
      })

    } catch (error: any) {
      console.error('Error in uploadFile:', error)
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message || 'Failed to start upload'
      }))
      return { success: false }
    }
  }, [])

  return {
    ...uploadState,
    uploadFile,
    resetUpload
  }
} 