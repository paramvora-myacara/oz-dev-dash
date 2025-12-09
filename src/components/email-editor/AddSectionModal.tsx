'use client'

import { useState, useEffect, useRef } from 'react'
import { X, FileText, Target, MousePointerClick } from 'lucide-react'
import type { SectionMode, SectionType } from '@/types/email-editor'

interface AddSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, type: SectionType, mode: SectionMode) => void
}

export default function AddSectionModal({ isOpen, onClose, onAdd }: AddSectionModalProps) {
  const [name, setName] = useState('')
  const [sectionType, setSectionType] = useState<SectionType>('text')
  const [mode, setMode] = useState<SectionMode>('static')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setSectionType('text')
      setMode('static')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd(name.trim(), sectionType, sectionType === 'button' ? 'static' : mode)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Add Section</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Section Name */}
          <div>
            <label htmlFor="section-name" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
              Section name
            </label>
            <input
              ref={inputRef}
              id="section-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={sectionType === 'button' ? 'e.g., CTA Button' : 'e.g., Introduction'}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Section Type */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">Type</label>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSectionType('text')}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                  sectionType === 'text'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Text</span>
              </button>

              <button
                type="button"
                onClick={() => setSectionType('button')}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                  sectionType === 'button'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <MousePointerClick className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Button</span>
              </button>
            </div>
          </div>

          {/* Content Mode (only for text) */}
          {sectionType === 'text' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">Content</label>
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMode('static')}
                  className={`flex-1 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all text-center ${
                    mode === 'static'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 ${mode === 'static' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className={`text-xs sm:text-sm font-medium ${mode === 'static' ? 'text-blue-700' : 'text-gray-700'}`}>
                    Same for All
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('personalized')}
                  className={`flex-1 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all text-center ${
                    mode === 'personalized'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Target className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 ${mode === 'personalized' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className={`text-xs sm:text-sm font-medium ${mode === 'personalized' ? 'text-blue-700' : 'text-gray-700'}`}>
                    Personalize
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Section
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
