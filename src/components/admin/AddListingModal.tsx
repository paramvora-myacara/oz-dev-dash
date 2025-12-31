'use client'

import { useState, FormEvent } from 'react'
import { X } from 'lucide-react'

interface AddListingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (slug: string, title: string, sectionsJson: string) => void
  isLoading: boolean
  error: string | null
}

export default function AddListingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error
}: AddListingModalProps) {
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [sectionsJson, setSectionsJson] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!slug || !slug.trim()) {
      return
    }
    if (!title || !title.trim()) {
      return
    }

    // Slug validation - only lowercase letters, numbers, and hyphens
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return
    }

    // JSON validation
    if (!sectionsJson || !sectionsJson.trim()) {
      return
    }

    try {
      JSON.parse(sectionsJson.trim())
    } catch (e) {
      return // Invalid JSON, let the form show validation error
    }

    onSubmit(slug.trim(), title.trim(), sectionsJson.trim())
  }

  const handleClose = () => {
    setSlug('')
    setTitle('')
    setSectionsJson('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Listing</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., downtown-apartments"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Downtown Apartments"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="sectionsJson" className="block text-sm font-medium text-gray-700 mb-1">
              Sections JSON *
            </label>
            <textarea
              id="sectionsJson"
              value={sectionsJson}
              onChange={(e) => setSectionsJson(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder='e.g., {"sections": [{"type": "hero", "data": {...}}]}'
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the JSON data for the listing sections (see listing insertion guide)
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              disabled={isLoading || !slug.trim() || !title.trim() || !sectionsJson.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
