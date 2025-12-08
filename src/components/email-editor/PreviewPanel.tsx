'use client'

import { useState, useMemo } from 'react'
import { Monitor, Smartphone, RefreshCw, ChevronDown, Users } from 'lucide-react'
import { generateEmailHtml } from './EmailPreviewRenderer'
import type { Section, SectionMode, SampleData } from '@/types/email-editor'

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

  const emailHtml = useMemo(() => {
    return generateEmailHtml(sections, subjectLine.content, currentSample)
  }, [sections, subjectLine.content, currentSample])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
          <button
            onClick={onGeneratePreview}
            disabled={isGenerating || sections.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Device Switcher */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded-md transition-colors ${
                device === 'desktop'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded-md transition-colors ${
                device === 'mobile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Sample Selector */}
          {sampleData && sampleData.rows.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSampleDropdown(!showSampleDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
              >
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 max-w-[120px] truncate">
                  {currentSample?.Name || currentSample?.name || `Row ${selectedSampleIndex + 1}`}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showSampleDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto py-1">
                  {sampleData.rows.slice(0, 10).map((row, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSampleIndexChange(index)
                        setShowSampleDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 ${
                        index === selectedSampleIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === selectedSampleIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${index === selectedSampleIndex ? 'text-blue-700' : 'text-gray-900'}`}>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-5 bg-gray-100">
        <div className={`mx-auto h-full transition-all duration-300 ${
          device === 'desktop' ? 'max-w-2xl' : 'max-w-sm'
        }`}>
          <iframe
            srcDoc={emailHtml}
            title="Email Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
            style={{ minHeight: '500px' }}
          />
        </div>
      </div>

    </div>
  )
}
