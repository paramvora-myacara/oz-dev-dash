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

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('')
      setSectionType('text')
      setMode('static')
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Section</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Section Name */}
          <div>
            <label htmlFor="section-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Section name
            </label>
            <input
              ref={inputRef}
              id="section-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={sectionType === 'button' ? 'e.g., CTA Button, Book Call...' : 'e.g., Social Proof, Testimonial, PS Line...'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          {/* Section Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Text Option */}
              <button
                type="button"
                onClick={() => setSectionType('text')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  sectionType === 'text'
                    ? 'border-brand-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  sectionType === 'text' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    sectionType === 'text' ? 'text-brand-primary' : 'text-gray-900'
                  }`}>
                    Text
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Paragraph content
                  </div>
                </div>
              </button>

              {/* Button Option */}
              <button
                type="button"
                onClick={() => setSectionType('button')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  sectionType === 'button'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  sectionType === 'button' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <MousePointerClick className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    sectionType === 'button' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    CTA Button
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Call-to-action
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Mode Selection (only for text sections) */}
          {sectionType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Static Option */}
                <button
                  type="button"
                  onClick={() => setMode('static')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    mode === 'static'
                      ? 'border-brand-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${
                    mode === 'static' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium ${
                      mode === 'static' ? 'text-brand-primary' : 'text-gray-900'
                    }`}>
                      Same for All
                    </div>
                  </div>
                </button>

                {/* Personalized Option */}
                <button
                  type="button"
                  onClick={() => setMode('personalized')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    mode === 'personalized'
                      ? 'border-brand-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${
                    mode === 'personalized' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium ${
                      mode === 'personalized' ? 'text-brand-primary' : 'text-gray-900'
                    }`}>
                      Personalize
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Section
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
