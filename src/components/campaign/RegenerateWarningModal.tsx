'use client'

import { AlertTriangle, X } from 'lucide-react'

interface RegenerateWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  totalEmails: number
  editedCount: number
  isDeleting?: boolean
}

export default function RegenerateWarningModal({
  isOpen,
  onClose,
  onConfirm,
  totalEmails,
  editedCount,
  isDeleting = false,
}: RegenerateWarningModalProps) {
  if (!isOpen) return null

  const hasEdits = editedCount > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              hasEdits ? 'bg-red-100' : 'bg-amber-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                hasEdits ? 'text-red-600' : 'text-amber-600'
              }`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {hasEdits ? 'Discard Edited Emails?' : 'Edit Template?'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {hasEdits ? (
          <div className="space-y-3 mb-6">
            <p className="text-gray-600">
              You have <strong>{totalEmails} generated emails</strong>, including{' '}
              <strong className="text-red-600">{editedCount} that were manually edited</strong>.
            </p>
            <p className="text-gray-600">
              Going back to edit the template will <strong>delete all generated emails</strong>, 
              including your manual edits. You'll need to regenerate them after editing.
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ This action cannot be undone. Your {editedCount} edited email{editedCount > 1 ? 's' : ''} will be lost.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <p className="text-gray-600">
              This will discard the <strong>{totalEmails} generated emails</strong>. 
              You'll need to regenerate them after editing the template.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
              hasEdits 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isDeleting ? (
              <>
                <span className="animate-spin">◐</span>
                Discarding...
              </>
            ) : (
              hasEdits ? 'Discard & Edit Template' : 'Edit Template'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
