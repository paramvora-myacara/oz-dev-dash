'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Monitor, Smartphone, ChevronDown, Users, Sparkles, Loader2, Eye, ChevronRight } from 'lucide-react'
import { generateEmailHtml } from '@/lib/email/generateEmailHtml'
import type { Section, SectionMode, SampleData } from '@/types/email-editor'

// Custom hook for debouncing a value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip debounce on first render to show initial content immediately
    if (isFirstRender.current) {
      isFirstRender.current = false
      setDebouncedValue(value)
      return
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface PreviewPanelProps {
  sections: Section[]
  subjectLine: { mode: SectionMode; content: string; selectedFields?: string[] }
  sampleData: SampleData | null
  selectedSampleIndex: number
  onSampleIndexChange: (index: number) => void
  emailFormat: 'html' | 'text'
  onFormatChange: (format: 'html' | 'text') => void
  onCollapse?: () => void
}

type DeviceType = 'desktop' | 'mobile'

export default function PreviewPanel({
  sections,
  subjectLine,
  sampleData,
  selectedSampleIndex,
  onSampleIndexChange,
  emailFormat,
  onFormatChange,
  onCollapse,
}: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [showSampleDropdown, setShowSampleDropdown] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<Record<string, string> | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentSample = sampleData?.rows?.[selectedSampleIndex] || null

  // Debounce sections to prevent rapid re-renders during typing
  const debouncedSections = useDebounce(sections, 300)
  
  // Debounce subject line to prevent rapid re-renders during typing
  const debouncedSubjectLineContent = useDebounce(subjectLine.content, 300)

  // Check if there are personalized sections
  const hasPersonalizedSections = useMemo(() => {
    return debouncedSections.some((s) => s.mode === 'personalized')
  }, [debouncedSections])

  // Only require AI generation when we actually have personalized sections
  // and sample data to personalize against.
  const needsPersonalizationPreview = useMemo(() => {
    return hasPersonalizedSections && !!currentSample
  }, [hasPersonalizedSections, currentSample])

  // Clear generated content when sample changes or sections change
  useEffect(() => {
    setGeneratedContent(null)
    setGenerationError(null)
  }, [selectedSampleIndex, debouncedSections])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSampleDropdown(false)
      }
    }

    if (showSampleDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSampleDropdown])

  // Helper to replace variables
  const replaceVariables = (text: string, data: Record<string, string> | null): string => {
    if (!data) return text
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = data[varName] || data[varName.toLowerCase()] || data[varName.toUpperCase()]
      return value !== undefined ? value : match
    })
  }

  // Handle Generate Preview button click
  const handleGeneratePreview = async () => {
    if (!needsPersonalizationPreview || isGenerating) return

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/backend-proxy/campaigns/preview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: debouncedSections,
          recipientData: currentSample,
          subjectLine: debouncedSubjectLineContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Generation failed' }))
        throw new Error(errorData.error || 'Generation failed')
      }

      const data = await response.json()
      setGeneratedContent(data.generatedContent || {})
      setHasGeneratedOnce(true)
    } catch (error) {
      console.error('Preview generation error:', error)
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate preview')
    } finally {
      setIsGenerating(false)
    }
  }

  const emailHtml = useMemo(() => {
    if (emailFormat === 'text') {
      // Generate plain text preview (keep order and render CTAs as "Button Text: URL")
      const subject = replaceVariables(debouncedSubjectLineContent, currentSample)

      const orderedSections = [...debouncedSections].sort((a, b) => a.order - b.order)

      const textContent = orderedSections
        .map((s) => {
          if (s.type === 'image') {
            // Skip images in text preview
            return '';
          } else if (s.type === 'button') {
            let buttonText: string;
            if (s.mode === 'personalized') {
              if (generatedContent && generatedContent[s.id]) {
                buttonText = generatedContent[s.id];
              } else {
                buttonText = `[${s.name} - AI Generated]`;
              }
            } else {
              buttonText = replaceVariables(s.content || '', currentSample);
            }
            const buttonUrl = s.buttonUrl || ''
            return `${buttonText}: ${buttonUrl || '[missing link]'}`
          }

          if (s.mode === 'personalized') {
            if (generatedContent && generatedContent[s.id]) {
              return generatedContent[s.id];
            }
            return `[${s.name} - AI Generated]`
          }

          return replaceVariables(s.content || '', currentSample)
        })
        .join('\n\n')
      
      // Create a simple HTML wrapper for text preview with standard email fonts
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
      color: #202124;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .subject {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      color: #202124;
    }
    .body {
      white-space: pre-wrap;
      font-size: 14px;
      color: #202124;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="subject">Subject: ${subject}</div>
    <div class="body">${textContent || '(No content)'}</div>
  </div>
</body>
</html>
      `
    }
    return generateEmailHtml(debouncedSections, debouncedSubjectLineContent, currentSample, undefined, generatedContent || undefined)
  }, [debouncedSections, debouncedSubjectLineContent, currentSample, emailFormat, generatedContent])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Preview Header - Responsive */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-b bg-white">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          {/* Regenerate Preview Button */}
          {needsPersonalizationPreview && (
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-colors ${
                isGenerating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : generationError
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : generationError ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Retry Generation</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">
                    {hasGeneratedOnce ? 'Regenerate Preview' : 'Generate Preview'}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Sample Selector */}
          {sampleData && sampleData.rows && sampleData.rows.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowSampleDropdown(!showSampleDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg hover:bg-gray-100"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-gray-700 max-w-[60px] sm:max-w-[120px] truncate">
                  {currentSample?.Name || `Row ${selectedSampleIndex + 1}`}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showSampleDropdown && (
                <div className="absolute left-0 mt-2 w-56 sm:w-64 max-w-xs bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto py-1">
                  {sampleData.rows.slice(0, 10).map((row, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSampleIndexChange(index)
                        setShowSampleDropdown(false)
                      }}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2 sm:gap-3 ${
                        index === selectedSampleIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                        index === selectedSampleIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${index === selectedSampleIndex ? 'text-blue-700' : 'text-gray-900'}`}>
                          {row.Name || `Recipient ${index + 1}`}
                        </div>
                        {(row.Company || row.company) && (
                          <div className="text-[10px] sm:text-xs text-gray-500 truncate">
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

        {onCollapse && (
          <button
            onClick={onCollapse}
            className="p-1 text-gray-400 hover:text-gray-600 rounded ml-auto"
            title="Collapse panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Email Format Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md sm:rounded-lg p-0.5">
            <button
              onClick={() => onFormatChange('text')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium rounded transition-colors ${
                emailFormat === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => onFormatChange('html')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium rounded transition-colors ${
                emailFormat === 'html' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              HTML
            </button>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center bg-gray-100 rounded-md sm:rounded-lg p-0.5 sm:p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 sm:p-2 rounded-sm sm:rounded-md transition-colors ${
                device === 'desktop'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Desktop"
            >
              <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 sm:p-2 rounded-sm sm:rounded-md transition-colors ${
                device === 'mobile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Generation Error Message */}
      {generationError && (
        <div className="px-3 sm:px-4 md:px-5 py-2 bg-red-50 border-b border-red-100">
          <p className="text-xs sm:text-sm text-red-600">
            {generationError}
          </p>
        </div>
      )}

      {/* Preview Content - Responsive */}
      <div className="flex-1 overflow-auto p-2 sm:p-3 md:p-5 bg-gray-100 relative">
        {needsPersonalizationPreview && !hasGeneratedOnce ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preview your email</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Click "Generate Preview" to see how your email will look with personalized content.
              </p>
            </div>
          </div>
        ) : (
          <div className={`mx-auto h-full transition-all duration-300 ${
            device === 'desktop' ? 'max-w-2xl' : 'max-w-sm'
          }`}>
            <iframe
              srcDoc={emailHtml}
              title="Email Preview"
              className="w-full h-full border-0 rounded-lg sm:rounded-xl"
              sandbox=""
              style={{ minHeight: '400px' }}
            />
          </div>
        )}
      </div>

    </div>
  )
}
