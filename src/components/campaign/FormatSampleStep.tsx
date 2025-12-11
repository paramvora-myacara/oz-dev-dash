'use client'

import { useState, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ArrowLeft, ArrowRight, FileText, Code, Loader2, AlertTriangle, CheckCircle2, Users, Mail, XCircle, AlertCircle } from 'lucide-react'
import type { EmailFormat, SampleData } from '@/types/email-editor'
import type { GenerateProgress, CsvValidationResult } from '@/lib/api/campaigns'
import { validateCsv } from '@/lib/api/campaigns'

interface FormatSampleStepProps {
  campaignId: string
  csvFile: File
  sampleData: SampleData
  initialFormat: EmailFormat
  onBack: () => void
  onGenerateAll: (format: EmailFormat) => void
  isGeneratingAll: boolean
  generateProgress?: GenerateProgress | null
}

export default function FormatSampleStep({
  campaignId,
  csvFile,
  sampleData,
  initialFormat,
  onBack,
  onGenerateAll,
  isGeneratingAll,
  generateProgress,
}: FormatSampleStepProps) {
  // Start with no format selected - user must pick one
  const [selectedFormat, setSelectedFormat] = useState<EmailFormat | null>(null)
  const [validation, setValidation] = useState<CsvValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Validate CSV when format is selected
  const handleFormatSelect = async (format: EmailFormat) => {
    setSelectedFormat(format)

    // Only validate once (on first format selection)
    if (!validation && !isValidating) {
      try {
        setIsValidating(true)
        setValidationError(null)
        const result = await validateCsv(campaignId, csvFile)
        setValidation(result)
      } catch (err: any) {
        setValidationError(err.message || 'Failed to validate CSV')
      } finally {
        setIsValidating(false)
      }
    }
  }

  const handleGenerateAll = () => {
    if (selectedFormat) {
      onGenerateAll(selectedFormat)
    }
  }

  // Format selector content (left panel)
  const FormatSelectorPanel = (
    <div className="h-full overflow-auto p-4 sm:p-6 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose Email Format</h2>
      <p className="text-sm text-gray-500 mb-6">
        Select the format for your campaign emails.
      </p>

      <div className="space-y-3">
        {/* Plain Text Option */}
        <button
          onClick={() => handleFormatSelect('text')}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedFormat === 'text'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-white'
            }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${selectedFormat === 'text' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <FileText className={`w-5 h-5 ${selectedFormat === 'text' ? 'text-blue-600' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${selectedFormat === 'text' ? 'text-blue-900' : 'text-gray-900'}`}>
                  Plain Text
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Best for cold outreach. Lands in Primary inbox, feels personal.
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedFormat === 'text'
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300'
              }`}>
              {selectedFormat === 'text' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
        </button>

        {/* HTML Option */}
        <button
          onClick={() => handleFormatSelect('html')}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedFormat === 'html'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-white'
            }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${selectedFormat === 'html' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Code className={`w-5 h-5 ${selectedFormat === 'html' ? 'text-blue-600' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${selectedFormat === 'html' ? 'text-blue-900' : 'text-gray-900'}`}>
                  HTML
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                  Warm Lists
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Rich formatting with buttons. May land in Promotions tab.
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedFormat === 'html'
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300'
              }`}>
              {selectedFormat === 'html' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
        </button>
      </div>

      {/* Pro tip */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Use Plain Text until recipients have engaged with your emails.
        </p>
      </div>
    </div>
  )

  // CSV Validation panel (right panel)
  const ValidationPanel = (
    <div className="h-full overflow-auto p-4 sm:p-6 bg-white">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">CSV Validation</h2>
      <p className="text-sm text-gray-500 mb-6">
        Preview of what will be generated from your CSV.
      </p>

      {!selectedFormat ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Format</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Choose Plain Text or HTML on the left to see your email validation details.
          </p>
        </div>
      ) : isValidating ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm text-gray-500">Validating CSV...</p>
        </div>
      ) : validationError ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Validation Failed</p>
              <p className="text-sm text-red-700 mt-1">{validationError}</p>
            </div>
          </div>
        </div>
      ) : validation ? (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">CSV Rows</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{validation.csvRowCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Emails Found</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{validation.emails.total}</p>
            </div>
          </div>

          {/* Valid Emails (main stat) */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-lg font-bold text-green-900">
                  {validation.emails.valid} emails will be generated
                </p>
                <p className="text-sm text-green-700">
                  After deduplication and validation
                </p>
              </div>
            </div>
          </div>

          {/* Issues breakdown */}
          {(validation.emails.duplicates > 0 || validation.emails.invalid > 0 || validation.emails.missing > 0) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 mb-2">Issues Found</p>
                  <div className="space-y-1 text-sm text-amber-700">
                    {validation.emails.duplicates > 0 && (
                      <p>• {validation.emails.duplicates} duplicate emails skipped</p>
                    )}
                    {validation.emails.invalid > 0 && (
                      <p>• {validation.emails.invalid} invalid email formats</p>
                    )}
                    {validation.emails.missing > 0 && (
                      <p>• {validation.emails.missing} rows missing email</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fields list */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Fields</p>
            <div className="flex flex-wrap gap-2">
              {validation.fields.map((field) => (
                <span
                  key={field}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed errors (collapsed) */}
          {validation.errors.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                View {validation.errors.length} detailed errors
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-auto">
                <ul className="text-xs text-gray-600 space-y-1 font-mono">
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </details>
          )}
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isGeneratingAll}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Editor</span>
        </button>

        {/* Generate button */}
        <button
          onClick={handleGenerateAll}
          disabled={!selectedFormat || isGeneratingAll || isValidating || !validation || validation.emails.valid === 0}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {generateProgress?.phase === 'ai_generation' && 'Generating AI content...'}
              {generateProgress?.phase === 'building_emails' && 'Building emails...'}
              {generateProgress?.phase === 'inserting' && 'Saving emails...'}
              {!generateProgress?.phase && 'Starting...'}
            </>
          ) : !selectedFormat ? (
            <>Select a format to continue</>
          ) : (
            <>
              Generate {validation?.emails.valid || '...'} Emails
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Progress bar when generating */}
      {isGeneratingAll && generateProgress?.type === 'ai_progress' && (
        <div className="bg-white border-b px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generateProgress.percentage || 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 min-w-[80px] text-right">
              {generateProgress.completed} / {generateProgress.total}
            </span>
          </div>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile: Stacked view */}
        <div className="lg:hidden h-full overflow-auto">
          <div className="border-b">
            {FormatSelectorPanel}
          </div>
          {ValidationPanel}
        </div>

        {/* Desktop: Resizable panels */}
        <div className="hidden lg:block h-full">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={35} minSize={25}>
              {FormatSelectorPanel}
            </Panel>
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors cursor-col-resize" />
            <Panel defaultSize={65} minSize={35}>
              {ValidationPanel}
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  )
}
