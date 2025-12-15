'use client'

import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ArrowLeft, ArrowRight, FileText, Code, Loader2, CheckCircle2, Users, Mail } from 'lucide-react'
import type { EmailFormat, SampleData } from '@/types/email-editor'
import type { GenerateProgress } from '@/lib/api/campaigns'

interface FormatSampleStepProps {
  campaignId: string
  sampleData?: SampleData | null
  recipientCount?: number
  initialFormat: EmailFormat
  onBack: () => void
  onGenerateAll: (format: EmailFormat) => void
  isGeneratingAll: boolean
  generateProgress?: GenerateProgress | null
}

export default function FormatSampleStep({
  campaignId,
  sampleData,
  recipientCount = 0,
  initialFormat,
  onBack,
  onGenerateAll,
  isGeneratingAll,
  generateProgress,
}: FormatSampleStepProps) {
  // Start with no format selected - user must pick one
  const [selectedFormat, setSelectedFormat] = useState<EmailFormat | null>(initialFormat || null)

  const handleFormatSelect = (format: EmailFormat) => {
    setSelectedFormat(format)
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

  // Validation/Stats panel (right panel)
  const ValidationPanel = (
    <div className="h-full overflow-auto p-4 sm:p-6 bg-white">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Audience Summary
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Overview of selected recipients from database.
      </p>

      {!selectedFormat ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Format</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Choose Plain Text or HTML on the left to continue.
          </p>
        </div>
      ) : (
        // Database Recipients View
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-lg font-bold text-green-900">
                  {recipientCount} recipients selected
                </p>
                <p className="text-sm text-green-700">
                  Ready to generate emails
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Source: Database</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Recipients were selected directly from your contacts list.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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
          disabled={!selectedFormat || isGeneratingAll || !recipientCount}
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
              Generate {recipientCount || '...'} Emails
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
