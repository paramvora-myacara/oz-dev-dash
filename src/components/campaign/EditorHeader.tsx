'use client'

import { ChevronDown, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { SectionMode } from '@/types/email-editor'

interface EditorHeaderProps {
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

  // Collapse
  onCollapse?: () => void

  // Continue Button
  showContinueButton?: boolean
  onContinue?: () => void
  isContinuing?: boolean
  canContinue?: boolean
}

export default function EditorHeader({
  selectedTemplate,
  showTemplateDropdown,
  onToggleTemplateDropdown,
  onSelectTemplate,
  availableTemplates,
  subjectLine,
  onSubjectChange,
  onOpenSubjectModal,
  isGeneratingSubject,
  onCollapse,
  showContinueButton,
  onContinue,
  isContinuing,
  canContinue,
}: EditorHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
      {/* Header with collapse button */}
      {onCollapse && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Editor</span>
          <button
            onClick={onCollapse}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Collapse panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Template Selector */}
      <div className="relative">
        <button
          onClick={onToggleTemplateDropdown}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto"
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

      {/* Subject Line and Continue Button */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Subject:</span>
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

        {showContinueButton && (
          <button
            onClick={onContinue}
            disabled={!canContinue || isContinuing}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${canContinue && !isContinuing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isContinuing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
