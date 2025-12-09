'use client'

import { AlertTriangle, X, CheckCircle2 } from 'lucide-react'
import { useMemo } from 'react'

interface EmailValidationErrorsModalProps {
  isOpen: boolean
  onClose: () => void
  stagedCount: number
  errors: string[]
}

export default function EmailValidationErrorsModal({
  isOpen,
  onClose,
  stagedCount,
  errors,
}: EmailValidationErrorsModalProps) {
  if (!isOpen) return null

  // Categorize errors
  const categorizedErrors = useMemo(() => {
    const invalidFormat: string[] = []
    const missing: string[] = []
    const duplicates: string[] = []
    const other: string[] = []

    errors.forEach(error => {
      if (error.includes('Invalid email format')) {
        invalidFormat.push(error)
      } else if (error.includes('Missing email')) {
        missing.push(error)
      } else if (error.includes('Duplicate email')) {
        duplicates.push(error)
      } else {
        other.push(error)
      }
    })

    return { invalidFormat, missing, duplicates, other }
  }, [errors])

  const totalErrors = errors.length
  const hasErrors = totalErrors > 0

  // Extract row numbers from errors for potential CSV export
  const errorRows = useMemo(() => {
    return errors
      .map(error => {
        const match = error.match(/Row (\d+):/)
        return match ? parseInt(match[1]) : null
      })
      .filter((row): row is number => row !== null)
      .sort((a, b) => a - b)
  }, [errors])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              stagedCount > 0 ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                stagedCount > 0 ? 'text-amber-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Email Generation Complete
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {hasErrors ? 'Some rows had validation issues' : 'All emails generated successfully'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Valid Emails</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stagedCount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-600">Errors</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{totalErrors.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Error Details */}
        {hasErrors && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b">
              <h3 className="font-medium text-gray-900">Error Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                {totalErrors} row{totalErrors !== 1 ? 's' : ''} had issues
              </p>
            </div>

            {/* Categorized Summary */}
            {(categorizedErrors.invalidFormat.length > 0 || 
              categorizedErrors.missing.length > 0 || 
              categorizedErrors.duplicates.length > 0) && (
              <div className="px-6 py-3 bg-gray-50 border-b">
                <div className="flex flex-wrap gap-3 text-sm">
                  {categorizedErrors.invalidFormat.length > 0 && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded">
                      {categorizedErrors.invalidFormat.length} Invalid Format
                    </span>
                  )}
                  {categorizedErrors.missing.length > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                      {categorizedErrors.missing.length} Missing Email
                    </span>
                  )}
                  {categorizedErrors.duplicates.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {categorizedErrors.duplicates.length} Duplicates
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Scrollable Error List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="text-sm p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-red-800 font-mono">{error}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            {hasErrors && errorRows.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Affected rows:</span>{' '}
                {errorRows.join(', ')}
              </div>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
