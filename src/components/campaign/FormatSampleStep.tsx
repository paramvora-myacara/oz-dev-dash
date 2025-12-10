'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, FileText, Code, RefreshCw, Pencil, ChevronDown, ChevronUp, Mail, Inbox, ShieldAlert, Users, Zap, Loader2 } from 'lucide-react'
import type { EmailFormat, SampleEmail, SampleData } from '@/types/email-editor'
import type { GenerateProgress } from '@/lib/api/campaigns'

interface FormatSampleStepProps {
  campaignId: string
  csvFile: File
  sampleData: SampleData
  initialFormat: EmailFormat
  onBack: () => void
  onGenerateSamples: (format: EmailFormat) => Promise<{ samples: SampleEmail[]; totalRecipients: number }>
  onGenerateAll: () => void
  isGeneratingAll: boolean
  generateProgress?: GenerateProgress | null
}

export default function FormatSampleStep({
  campaignId,
  csvFile,
  sampleData,
  initialFormat,
  onBack,
  onGenerateSamples,
  onGenerateAll,
  isGeneratingAll,
  generateProgress,
}: FormatSampleStepProps) {
  const [selectedFormat, setSelectedFormat] = useState<EmailFormat>(initialFormat)
  const [samples, setSamples] = useState<SampleEmail[] | null>(null)
  const [totalRecipients, setTotalRecipients] = useState<number>(sampleData.rows.length)
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSampleIndex, setExpandedSampleIndex] = useState<number | null>(0)

  const handleGenerateSamples = async () => {
    try {
      setIsGeneratingSamples(true)
      setError(null)
      const result = await onGenerateSamples(selectedFormat)
      setSamples(result.samples)
      setTotalRecipients(result.totalRecipients)
      // Expand first sample by default
      setExpandedSampleIndex(0)
    } catch (err: any) {
      setError(err.message || 'Failed to generate samples')
    } finally {
      setIsGeneratingSamples(false)
    }
  }

  const handleRegenerateSamples = async () => {
    setSamples(null)
    await handleGenerateSamples()
  }

  const handleFormatChange = (format: EmailFormat) => {
    setSelectedFormat(format)
    // Clear samples when format changes so user needs to regenerate
    setSamples(null)
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Editor</span>
        </button>

        {/* Format Selection Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose Email Format</h2>
          <p className="text-sm text-gray-500 mb-6">
            Select the format that best suits your audience and goals.
          </p>

          <div className="space-y-4">
            {/* Plain Text Option */}
            <button
              onClick={() => handleFormatChange('text')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedFormat === 'text'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg ${selectedFormat === 'text' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                  <FileText className={`w-5 h-5 ${selectedFormat === 'text' ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${selectedFormat === 'text' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                      Plain Text
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Recommended for Cold Outreach
                    </span>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Inbox className="w-4 h-4 text-green-500" />
                      <span><strong>Highest deliverability</strong> — lands in Primary inbox, not Promotions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>Feels personal — like a real email from a human</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ShieldAlert className="w-4 h-4 text-green-500" />
                      <span>Passes spam filters easily</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                      <span className="w-4 h-4 text-center">−</span>
                      <span>No formatting, images, or buttons</span>
                    </div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'text'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedFormat === 'text' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>

            {/* HTML Option */}
            <button
              onClick={() => handleFormatChange('html')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedFormat === 'html'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg ${selectedFormat === 'html' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                  <Code className={`w-5 h-5 ${selectedFormat === 'html' ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${selectedFormat === 'html' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                      HTML
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      Best for Warm Lists
                    </span>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span>Rich formatting — bold, colors, images, buttons</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span>Professional newsletter appearance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
                      <span className="w-4 h-4 text-center">⚠</span>
                      <span>Often lands in Promotions tab (Gmail) or Clutter (Outlook)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <span className="w-4 h-4 text-center">⚠</span>
                      <span>Higher spam risk — especially for cold lists</span>
                    </div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'html'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedFormat === 'html' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Pro tip */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Pro tip:</strong> Use Plain Text until recipients have replied or engaged with your emails.
              Switch to HTML only for warm, opted-in lists where recipients expect your emails.
            </p>
          </div>
        </div>

        {/* Sample Generation Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sample Preview</h2>
              <p className="text-sm text-gray-500 mt-1">
                Generate {Math.min(5, sampleData.rows.length)} sample emails to verify output before generating for all {totalRecipients} recipients.
              </p>
            </div>
            {samples && (
              <button
                onClick={handleRegenerateSamples}
                disabled={isGeneratingSamples}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingSamples ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generate samples button (shown when no samples yet) */}
          {!samples && !isGeneratingSamples && (
            <button
              onClick={handleGenerateSamples}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="font-medium">Generate {Math.min(5, sampleData.rows.length)} Sample Emails</span>
              </div>
            </button>
          )}

          {/* Loading skeleton */}
          {isGeneratingSamples && (
            <div className="space-y-4">
              {[...Array(Math.min(3, sampleData.rows.length))].map((_, i) => (
                <div key={i} className="p-4 border rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-64" />
                    </div>
                  </div>
                  {i === 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                      <div className="h-3 bg-gray-100 rounded w-4/6" />
                    </div>
                  )}
                </div>
              ))}
              <p className="text-center text-sm text-gray-500">Generating sample emails...</p>
            </div>
          )}

          {/* Sample emails display */}
          {samples && samples.length > 0 && (
            <div className="space-y-3">
              {samples.map((sample, index) => (
                <div
                  key={index}
                  className="border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSampleIndex(
                      expandedSampleIndex === index ? null : index
                    )}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sample.toEmail}</p>
                        <p className="text-xs text-gray-500 truncate max-w-md">{sample.subject}</p>
                      </div>
                    </div>
                    {expandedSampleIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSampleIndex === index && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div className="mt-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Subject
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{sample.subject}</p>
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Body
                        </label>
                        {selectedFormat === 'text' ? (
                          <div className="mt-1 p-3 bg-white border rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-auto">
                            {sample.body}
                          </div>
                        ) : (
                          <div className="mt-1 border rounded-lg overflow-hidden max-h-96 overflow-auto">
                            <iframe
                              srcDoc={sample.body}
                              title={`Sample email ${index + 1}`}
                              className="w-full h-64 border-0"
                              sandbox="allow-same-origin"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Action buttons / Progress */}
              <div className="flex items-center justify-between pt-4 border-t mt-6">
                <button
                  onClick={onBack}
                  disabled={isGeneratingAll}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Template
                </button>

                <div className="flex items-center gap-3">
                  {isGeneratingAll && generateProgress ? (
                    <div className="flex flex-col items-end gap-2 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">
                          {generateProgress.phase === 'ai_generation' && 'Generating AI content...'}
                          {generateProgress.phase === 'building_emails' && 'Building emails...'}
                          {generateProgress.phase === 'inserting' && 'Saving emails...'}
                          {!generateProgress.phase && 'Starting...'}
                        </span>
                      </div>
                      {generateProgress.type === 'ai_progress' && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${generateProgress.percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {generateProgress.completed} / {generateProgress.total} recipients
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 hidden sm:block">
                        Looks good?
                      </p>
                      <button
                        onClick={onGenerateAll}
                        disabled={isGeneratingAll}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isGeneratingAll ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            Generate All {totalRecipients} Emails
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
