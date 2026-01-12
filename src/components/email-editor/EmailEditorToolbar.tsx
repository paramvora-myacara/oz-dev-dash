'use client'

import { ChevronDown, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import type { SectionMode } from '@/types/email-editor'

interface EmailEditorToolbarProps {
  // Template management
  selectedTemplate: { name: string } | null
  showTemplateDropdown: boolean
  onToggleTemplateDropdown: () => void
  onSelectTemplate: (template: any) => void
  availableTemplates: any[]

  // Subject management
  subjectLine: { mode: SectionMode; content: string; selectedFields?: string[] }
  onSubjectChange: (subject: { mode: SectionMode; content: string; selectedFields?: string[] }) => void
  onOpenSubjectModal: () => void
  isGeneratingSubject: boolean

  // Actions
  canContinue: boolean
  continueDisabledReason: string | null
  isContinuing: boolean
  onContinue: () => void
  buttonText?: string // Custom button text (default: "Continue")

  // Layout
  isMobile?: boolean
}

export default function EmailEditorToolbar({
  selectedTemplate,
  showTemplateDropdown,
  onToggleTemplateDropdown,
  onSelectTemplate,
  availableTemplates,
  subjectLine,
  onSubjectChange,
  onOpenSubjectModal,
  isGeneratingSubject,
  canContinue,
  continueDisabledReason,
  isContinuing,
  onContinue,
  buttonText = 'Continue',
  isMobile = false,
}: EmailEditorToolbarProps) {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 lg:hidden">
        {/* Template & Continue */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <button
              onClick={onToggleTemplateDropdown}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              <span className="truncate">{selectedTemplate?.name || 'Select Template'}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showTemplateDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                {availableTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTemplate(t)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Continue Button */}
          <button
            onClick={onContinue}
            disabled={!canContinue || isContinuing}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${canContinue && !isContinuing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            {isContinuing ? '...' : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Subject:</span>
            <button
              onClick={onOpenSubjectModal}
              disabled={isGeneratingSubject}
              title="Generate subject with AI"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingSubject ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </button>
          </div>
          <input
            type="text"
            value={subjectLine.content}
            onChange={(e) => onSubjectChange({ ...subjectLine, content: e.target.value })}
            placeholder="Subject line..."
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="hidden lg:flex items-center gap-4">
      {/* Template Selector */}
      <div className="relative">
        <button
          onClick={onToggleTemplateDropdown}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">{selectedTemplate?.name || 'Select Template'}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
        {showTemplateDropdown && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
            {availableTemplates.map(t => (
              <button
                key={t.id}
                onClick={() => onSelectTemplate(t)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subject Line */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Subject:</span>
        <div className="flex-1 relative group">
          <input
            type="text"
            value={subjectLine.content}
            onChange={(e) => onSubjectChange({ ...subjectLine, content: e.target.value })}
            placeholder="Enter subject line..."
            className="w-full pr-28 pl-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={onOpenSubjectModal}
            disabled={isGeneratingSubject}
            title="Generate subject with AI"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out overflow-hidden w-8 group-hover:w-28"
          >
            {isGeneratingSubject ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {isGeneratingSubject ? 'Generating...' : 'AI Generate'}
            </span>
          </button>
        </div>
      </div>

      {/* Continue */}
      <div className="flex items-center gap-3">
        <button
          onClick={onContinue}
          disabled={!canContinue || isContinuing}
          title={continueDisabledReason || undefined}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${canContinue && !isContinuing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {isContinuing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {buttonText}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
