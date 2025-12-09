'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
}

export default function FileUpload({ onFileSelect, accept = '.csv' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.csv') || accept.includes(file.type)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleClear = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${selectedFile ? 'border-green-300 bg-green-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-green-600 text-4xl">📄</div>
            <div className="text-sm font-medium text-gray-900">{selectedFile.name}</div>
            <div className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400 text-4xl">📎</div>
            <div className="text-sm font-medium text-gray-700">
              Drag CSV file here or click to browse
            </div>
            <div className="text-xs text-gray-500">
              CSV format should include: Email, Subject, Body
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



