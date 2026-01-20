'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Save, Loader2 } from 'lucide-react'

interface SaveTemplateModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (name: string) => Promise<void>
    initialName?: string
}

export default function SaveTemplateModal({ isOpen, onClose, onSave, initialName = '' }: SaveTemplateModalProps) {
    const [name, setName] = useState(initialName)
    const [isSaving, setIsSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setName(initialName)
            if (inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 100)
            }
        }
    }, [isOpen, initialName])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSaving) onClose()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose, isSaving])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || isSaving) return

        try {
            setIsSaving(true)
            await onSave(name.trim())
            onClose()
        } catch (error) {
            console.error('Failed to save template', error)
            // Ideally show error message
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/40" onClick={!isSaving ? onClose : undefined} />

            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Save as Template</h2>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Template Name */}
                    <div>
                        <label htmlFor="template-name" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                            Template name
                        </label>
                        <input
                            ref={inputRef}
                            id="template-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., My Custom Outreach"
                            disabled={isSaving}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    <p className="text-xs text-gray-500">
                        Saving with an existing name will update that template.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || isSaving}
                            className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Template
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
