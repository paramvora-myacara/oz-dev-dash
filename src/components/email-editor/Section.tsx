'use client'

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Sparkles,
  Target,
  FileText,
  Bold,
  Italic,
  Link as LinkIcon,
  MousePointerClick,
  Pencil,
  X
} from 'lucide-react'
import type { Section as SectionType, SectionMode } from '@/types/email-editor'

interface SectionProps {
  section: SectionType
  onChange: (section: SectionType) => void
  onDelete: () => void
  availableFields: string[]
  fieldValues?: Record<string, string>
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export default function Section({
  section,
  onChange,
  onDelete,
  availableFields,
  fieldValues = {},
  isExpanded = false,
  onToggleExpand
}: SectionProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [expandedFieldDetail, setExpandedFieldDetail] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Sortable hook for drag-and-drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Rich text editor for static mode
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your content here...',
      }),
    ],
    content: section.mode === 'static' && section.type !== 'button' ? section.content : '',
    onUpdate: ({ editor }) => {
      if (section.mode === 'static' && section.type !== 'button') {
        onChange({ ...section, content: editor.getHTML() })
      }
    },
    onFocus: () => setIsEditorFocused(true),
    onBlur: () => setIsEditorFocused(false),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-4 text-base',
      },
    },
  })

  // Update editor content when section changes
  useEffect(() => {
    if (editor && section.mode === 'static' && section.type !== 'button' && editor.getHTML() !== section.content) {
      editor.commands.setContent(section.content)
    }
  }, [section.content, section.mode, section.type, editor])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOverflowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus name input when editing
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  const handleModeChange = (newMode: SectionMode) => {
    // Set default prompt for personalized mode
    const defaultContent = newMode === 'personalized'
      ? `You are writing a section of a cold outreach email for OZListings.

RULES:
- Keep it concise (1-3 sentences max for this section)
- Sound natural and conversational, not salesy
- Reference the specific details provided below
- Match the tone of a professional but warm business email

Write the personalized section now.`
      : '';

    onChange({ ...section, mode: newMode, content: defaultContent })
    setShowOverflowMenu(false)
  }

  const handleNameChange = (newName: string) => {
    onChange({ ...section, name: newName })
  }

  const handleFieldToggle = (field: string) => {
    const currentFields = section.selectedFields || []
    const newFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field]
    onChange({ ...section, selectedFields: newFields })
  }

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  // Get preview text for collapsed state
  const getPreviewText = () => {
    if (section.type === 'button') {
      return section.content || 'Button'
    }
    if (section.mode === 'personalized') {
      return section.content || 'AI personalized content'
    }
    // Strip HTML and truncate
    const text = section.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    return text.length > 60 ? text.substring(0, 60) + '...' : text || 'Empty'
  }

  // Mode indicator
  const getModeIndicator = () => {
    if (section.type === 'button') {
      return { icon: MousePointerClick, label: 'Button', color: 'text-gray-500' }
    }
    if (section.mode === 'personalized') {
      return { icon: Target, label: 'Personalized', color: 'text-blue-600' }
    }
    return { icon: FileText, label: 'Static', color: 'text-gray-400' }
  }

  const modeInfo = getModeIndicator()
  const ModeIcon = modeInfo.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg sm:rounded-xl transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'hover:shadow-sm'
        } ${isExpanded ? 'shadow-sm' : ''}`}
    >
      {/* Section Header - Always Visible */}
      <div
        className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-3 sm:py-4 cursor-pointer select-none ${isExpanded ? 'border-b border-gray-100' : ''
          }`}
        onClick={() => onToggleExpand?.()}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none flex-shrink-0"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Expand/Collapse Arrow */}
        <div className="text-gray-400 flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </div>

        {/* Section Name & Preview */}
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={section.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setIsEditingName(false)
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm sm:text-base font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-[200px] sm:max-w-xs"
            />
          ) : (
            <div>
              <div className="text-sm sm:text-base font-medium text-gray-900 truncate">{section.name}</div>
              {!isExpanded && (
                <div className="text-xs sm:text-sm text-gray-400 truncate mt-0.5">{getPreviewText()}</div>
              )}
            </div>
          )}
        </div>

        {/* Mode Indicator (subtle) */}
        <div className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm flex-shrink-0 ${modeInfo.color}`}>
          <ModeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {!isExpanded && <span className="hidden sm:inline">{modeInfo.label}</span>}
        </div>

        {/* Overflow Menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowOverflowMenu(!showOverflowMenu)
            }}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {showOverflowMenu && (
            <div className="absolute right-0 mt-1 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
              {/* Rename */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditingName(true)
                  setShowOverflowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Rename
              </button>

              {/* Mode Toggle (for text sections only) */}
              {section.type !== 'button' && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleModeChange('static')
                    }}
                    className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 ${section.mode === 'static' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                      }`}
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Same for All
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleModeChange('personalized')
                    }}
                    className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 ${section.mode === 'personalized' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                      }`}
                  >
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Personalize
                  </button>
                </>
              )}

              {/* Delete */}
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(true)
                  setShowOverflowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section Content - Only when expanded */}
      {isExpanded && (
        <div className="p-3 sm:p-4 md:p-5">
          {section.type === 'button' ? (
            /* Button Type - CTA Button Editor */
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={section.content}
                  onChange={(e) => onChange({ ...section, content: e.target.value })}
                  placeholder="e.g., Book Your Call"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                  Button URL
                </label>
                <input
                  type="url"
                  value={section.buttonUrl || ''}
                  onChange={(e) => onChange({ ...section, buttonUrl: e.target.value })}
                  placeholder="https://example.com/book"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                  Preview
                </label>
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl">
                  <a
                    href={section.buttonUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 sm:px-8 py-3 sm:py-4 bg-[#1e88e5] text-white font-semibold text-center text-sm sm:text-lg rounded-lg hover:bg-[#1565c0] transition-colors"
                    onClick={(e) => !section.buttonUrl && e.preventDefault()}
                  >
                    {section.content || 'Button Text'}
                  </a>
                </div>
              </div>
            </div>
          ) : section.mode === 'static' ? (
            /* Static Mode - Rich Text Editor */
            <div className="rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
              {/* Toolbar - Only visible when focused */}
              <div className={`flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 border-b transition-all ${isEditorFocused ? 'opacity-100' : 'opacity-0 h-0 py-0 border-b-0 overflow-hidden'
                }`}>
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
                    }`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
                    }`}
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={setLink}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-gray-200 ${editor?.isActive('link') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
                    }`}
                  title="Add Link"
                >
                  <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <EditorContent editor={editor} />
            </div>
          ) : (
            /* Personalized Mode - Instructions + Field Selection */
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                  What should this say?
                </label>
                <textarea
                  value={section.content}
                  onChange={(e) => onChange({ ...section, content: e.target.value })}
                  placeholder="Describe what you want the AI to write..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                  Use these details:
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {availableFields.length > 0 ? (
                    availableFields.map((field) => {
                      const isSelected = section.selectedFields?.includes(field)
                      const value = fieldValues[field]

                      return (
                        <div
                          key={field}
                          className={`inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full border transition-colors ${isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                            }`}
                        >
                          <button
                            onClick={() => handleFieldToggle(field)}
                            className="flex items-center gap-2 text-xs sm:text-sm font-medium focus:outline-none"
                            title={`Toggle selection: ${field}`}
                          >
                            <span className="max-w-[150px] truncate">{value || field}</span>
                            {value && <span className={`text-xs opacity-70 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>({field})</span>}
                          </button>

                          {/* Expansion Chevron */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedFieldDetail(field)
                            }}
                            className={`p-1 rounded-full hover:bg-opacity-20 hover:bg-black transition-colors ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}
                            title="View full details"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400 italic">
                      Upload a CSV to see available fields
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Field Detail Modal */}
      {expandedFieldDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setExpandedFieldDetail(null)}>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Field Details: <span className="text-blue-600">{expandedFieldDetail}</span>
              </h3>
              <button
                onClick={() => setExpandedFieldDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50 rounded-lg border border-gray-200 p-4">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {(() => {
                  const val = fieldValues[expandedFieldDetail]
                  if (!val) return <span className="text-gray-400 italic">Empty value</span>
                  try {
                    // Try to pretty print if it looks like JSON/Object
                    if (typeof val === 'object' || (typeof val === 'string' && (val.startsWith('{') || val.startsWith('[')))) {
                      const parsed = typeof val === 'string' ? JSON.parse(val) : val
                      return JSON.stringify(parsed, null, 2)
                    }
                  } catch (e) {
                    // Not JSON, just return value
                  }
                  return val
                })()}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setExpandedFieldDetail(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Delete Section?</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to delete "{section.name}"?
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowDeleteConfirm(false)
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
