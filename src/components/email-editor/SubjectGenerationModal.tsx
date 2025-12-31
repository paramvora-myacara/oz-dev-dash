'use client'

import { Sparkles, Loader2 } from 'lucide-react'

interface SubjectGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  subjectPrompt: string
  onSubjectPromptChange: (prompt: string) => void
  modalSubject: string
  onModalSubjectChange: (subject: string) => void
  isGenerating: boolean
  error: string | null
  onGenerate: () => void
  onSave: () => void
}

export default function SubjectGenerationModal({
  isOpen,
  onClose,
  subjectPrompt,
  onSubjectPromptChange,
  modalSubject,
  onModalSubjectChange,
  isGenerating,
  error,
  onGenerate,
  onSave,
}: SubjectGenerationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Generate Subject Line</h2>
              <p className="text-sm text-gray-600">Customize the AI prompt for your subject line</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Current / Generated Subject Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject Preview
              </label>
              <input
                type="text"
                value={modalSubject}
                onChange={(e) => onModalSubjectChange(e.target.value)}
                placeholder="Generated subject will appear here..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Click &quot;Save&quot; to apply.
              </p>
            </div>

            {/* Prompt Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Instructions
              </label>
              <textarea
                value={subjectPrompt}
                onChange={(e) => onSubjectPromptChange(e.target.value)}
                placeholder="Describe what kind of subject line you want..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-2">
                The AI will have access to your campaign name and email content to generate relevant subject lines.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onGenerate}
                disabled={isGenerating || !subjectPrompt.trim()}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
              <button
                onClick={onSave}
                disabled={!modalSubject.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
