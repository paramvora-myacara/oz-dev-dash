'use client'

import { UploadProgress } from '@/hooks/useResumableUpload'

interface UploadProgressBarProps {
  progress: UploadProgress
  fileName: string
  onCancel?: () => void
}

export function UploadProgressBar({ progress, fileName, onCancel }: UploadProgressBarProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📤</div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {fileName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(progress.bytesUploaded)} / {formatBytes(progress.bytesTotal)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {progress.percentage}%
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
        <div 
          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      
      {/* Progress Details */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Uploading...</span>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
} 