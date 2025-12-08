'use client'

import { useState, useMemo } from 'react'
import { Monitor, Smartphone, RefreshCw, ChevronDown, Users } from 'lucide-react'
import { generateEmailHtml } from './EmailPreviewRenderer'
import type { Section, SectionMode, SampleData, CSVRow } from '@/types/email-editor'

interface PreviewPanelProps {
  sections: Section[]
  subjectLine: { mode: SectionMode; content: string; selectedFields?: string[] }
  sampleData: SampleData | null
  selectedSampleIndex: number
  onSampleIndexChange: (index: number) => void
  onGeneratePreview: () => void
  isGenerating: boolean
  previewHtml: string | null
}

type DeviceType = 'desktop' | 'mobile'

export default function PreviewPanel({
  sections,
  subjectLine,
  sampleData,
  selectedSampleIndex,
  onSampleIndexChange,
  onGeneratePreview,
  isGenerating,
}: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [showSampleDropdown, setShowSampleDropdown] = useState(false)

  const currentSample = sampleData?.rows[selectedSampleIndex] || null

  // Generate the branded email HTML
  const emailHtml = useMemo(() => {
    return generateEmailHtml(sections, subjectLine.content, currentSample)
  }, [sections, subjectLine.content, currentSample])

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
        
        <div className="flex items-center gap-3">
          {/* Device Switcher */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'desktop'
                  ? 'bg-white text-brand-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Desktop preview"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'mobile'
                  ? 'bg-white text-brand-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Mobile preview"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Sample Data Selector */}
          {sampleData && sampleData.rows.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSampleDropdown(!showSampleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {currentSample?.Name || currentSample?.name || currentSample?.Email || `Row ${selectedSampleIndex + 1}`}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showSampleDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {sampleData.rows.slice(0, 10).map((row, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSampleIndexChange(index)
                        setShowSampleDropdown(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        index === selectedSampleIndex ? 'bg-blue-50 text-brand-primary' : 'text-gray-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1 truncate">
                        <div className="font-medium truncate">
                          {row.Name || row.name || row.Email || row.email || `Recipient ${index + 1}`}
                        </div>
                        {(row.Company || row.company) && (
                          <div className="text-xs text-gray-500 truncate">
                            {row.Company || row.company}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {sampleData.rows.length > 10 && (
                    <div className="px-4 py-2 text-xs text-gray-500 border-t">
                      Showing first 10 of {sampleData.rows.length} recipients
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div className={`mx-auto transition-all duration-300 h-full ${
          device === 'desktop' ? 'max-w-2xl' : 'max-w-sm'
        }`}>
          {/* Email Preview Frame */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 h-full">
            <iframe
              srcDoc={emailHtml}
              title="Email Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>
      </div>

      {/* Generate Preview Button */}
      <div className="px-4 py-3 bg-white border-t">
        <button
          onClick={onGeneratePreview}
          disabled={isGenerating || sections.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Preview...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Generate Preview
            </>
          )}
        </button>
        {!sampleData && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Upload a CSV to preview with real data
          </p>
        )}
      </div>
    </div>
  )
}
