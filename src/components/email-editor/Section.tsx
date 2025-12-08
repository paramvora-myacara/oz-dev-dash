'use client'

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { GripVertical, Trash2, ChevronDown, Sparkles, Target, FileText, Bold, Italic, Link as LinkIcon, MousePointerClick } from 'lucide-react'
import type { Section as SectionType, SectionMode } from '@/types/email-editor'

interface SectionProps {
  section: SectionType
  onChange: (section: SectionType) => void
  onDelete: () => void
  availableFields: string[]
}

export default function Section({ section, onChange, onDelete, availableFields }: SectionProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    immediatelyRender: false, // Prevent SSR hydration mismatch
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
          class: 'text-brand-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your content here...',
      }),
    ],
    content: section.mode === 'static' ? section.content : '',
    onUpdate: ({ editor }) => {
      if (section.mode === 'static') {
        onChange({ ...section, content: editor.getHTML() })
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] p-3',
      },
    },
  })

  // Update editor content when section changes
  useEffect(() => {
    if (editor && section.mode === 'static' && editor.getHTML() !== section.content) {
      editor.commands.setContent(section.content)
    }
  }, [section.content, section.mode, editor])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModeDropdown(false)
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
    onChange({ ...section, mode: newMode, content: '' })
    setShowModeDropdown(false)
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

  const handleInstructionsChange = (instructions: string) => {
    onChange({ ...section, content: instructions })
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

  const ModeIcon = section.mode === 'personalized' ? Target : FileText
  const modeLabel = section.mode === 'personalized' ? 'Personalize' : 'Same for All'
  const modeColor = section.mode === 'personalized' ? 'text-brand-primary' : 'text-gray-600'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg shadow-sm ${isDragging ? 'shadow-lg ring-2 ring-brand-primary' : ''}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Section Name */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={section.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false)
                if (e.key === 'Escape') setIsEditingName(false)
              }}
              className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-sm font-medium text-gray-900 hover:text-brand-primary flex items-center gap-1"
            >
              {section.name}
              <span className="text-xs text-gray-400">✏️</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Type Badge for Button */}
          {section.type === 'button' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-green-50 border border-green-200 text-green-700">
              <MousePointerClick className="w-4 h-4" />
              Button
            </div>
          )}

          {/* Mode Dropdown (only for text sections) */}
          {section.type !== 'button' && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                  section.mode === 'personalized'
                    ? 'bg-blue-50 border-blue-200 text-brand-primary hover:bg-blue-100'
                    : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ModeIcon className="w-4 h-4" />
                {modeLabel}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showModeDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleModeChange('static')}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 ${
                      section.mode === 'static' ? 'bg-gray-50 text-brand-primary' : 'text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">Same for All</div>
                      <div className="text-xs text-gray-500">Identical for every recipient</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleModeChange('personalized')}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 border-t ${
                      section.mode === 'personalized' ? 'bg-blue-50 text-brand-primary' : 'text-gray-700'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">Personalize</div>
                      <div className="text-xs text-gray-500">AI-generated per recipient</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            aria-label="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-4">
        {section.type === 'button' ? (
          /* Button Type - CTA Button Editor */
          <div className="space-y-4">
            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Button Text
              </label>
              <input
                type="text"
                value={section.content}
                onChange={(e) => onChange({ ...section, content: e.target.value })}
                placeholder="e.g., Book Your Call"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            {/* Button URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Button URL
              </label>
              <input
                type="url"
                value={section.buttonUrl || ''}
                onChange={(e) => onChange({ ...section, buttonUrl: e.target.value })}
                placeholder="https://example.com/book"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            {/* Button Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Preview
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <a
                  href={section.buttonUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-8 py-3.5 bg-[#1e88e5] text-white font-semibold text-center rounded-lg hover:bg-[#1565c0] transition-colors"
                  onClick={(e) => !section.buttonUrl && e.preventDefault()}
                >
                  {section.content || 'Button Text'}
                </a>
              </div>
            </div>
          </div>
        ) : section.mode === 'static' ? (
          /* Static Mode - Rich Text Editor */
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${
                  editor?.isActive('bold') ? 'bg-gray-200 text-brand-primary' : 'text-gray-600'
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${
                  editor?.isActive('italic') ? 'bg-gray-200 text-brand-primary' : 'text-gray-600'
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={setLink}
                className={`p-1.5 rounded hover:bg-gray-200 ${
                  editor?.isActive('link') ? 'bg-gray-200 text-brand-primary' : 'text-gray-600'
                }`}
                title="Add Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <div className="flex-1" />
              <button
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-blue-50 rounded"
                title="AI Assist (coming soon)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI
              </button>
            </div>
            
            {/* Editor */}
            <EditorContent editor={editor} />
          </div>
        ) : (
          /* Personalized Mode - Instructions + Field Selection */
          <div className="space-y-4">
            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What should this say?
              </label>
              <textarea
                value={section.content}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                placeholder="Describe what you want the AI to write. E.g., 'Mention their specific project and compliment something about it.'"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Field Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Use these details from your list:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableFields.length > 0 ? (
                  availableFields.map((field) => {
                    const isSelected = section.selectedFields?.includes(field)
                    return (
                      <button
                        key={field}
                        onClick={() => handleFieldToggle(field)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-brand-primary'
                        }`}
                      >
                        {field}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Upload a CSV to see available fields
                  </p>
                )}
              </div>
            </div>

            {/* Example Preview (placeholder) */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-primary mb-1">
                <Sparkles className="w-4 h-4" />
                Example output
              </div>
              <p className="text-sm text-gray-600 italic">
                Generate a preview to see how this will look for a sample recipient.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Section?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{section.name}"? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowDeleteConfirm(false)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
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
