'use client'

import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import type { CampaignStep, Section, SectionMode, SampleData } from '@/types/email-editor'
import SectionList from './SectionList'
import PreviewPanel from './PreviewPanel'
import SequenceStepsSidebar from './SequenceStepsSidebar'

interface EmailEditorLayoutProps {
  // Content
  sections: Section[]
  onSectionsChange: (sections: Section[]) => void
  subjectLine: { mode: SectionMode; content: string; selectedFields?: string[] }
  emailFormat: 'html' | 'text'
  onFormatChange: (format: 'html' | 'text') => void

  // Steps
  steps: CampaignStep[]
  currentStepIndex: number
  onStepSelect: (index: number) => void
  onAddStep: () => void
  onDeleteStep: (index: number) => void
  onDelayChange: (stepIndex: number, delayDays: number, delayHours: number, delayMinutes: number) => void

  // Preview
  sampleData: SampleData | null
  selectedSampleIndex: number
  onSampleIndexChange: (index: number) => void
  availableFields: string[]

  // UI state
  activeTab: 'edit' | 'preview' | 'steps'
  onActiveTabChange: (tab: 'edit' | 'preview' | 'steps') => void
}

export default function EmailEditorLayout({
  sections,
  onSectionsChange,
  subjectLine,
  emailFormat,
  onFormatChange,
  steps,
  currentStepIndex,
  onStepSelect,
  onAddStep,
  onDeleteStep,
  onDelayChange,
  sampleData,
  selectedSampleIndex,
  onSampleIndexChange,
  availableFields,
  activeTab,
  onActiveTabChange,
}: EmailEditorLayoutProps) {
  const fieldValues = sampleData?.rows?.[selectedSampleIndex] || {}

  const EditPanelContent = (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-5 bg-gray-50">
        <SectionList
          sections={sections}
          onSectionsChange={onSectionsChange}
          availableFields={availableFields}
          fieldValues={fieldValues}
        />
        <div className="mt-3">
          <button
            onClick={() => {/* This should be handled by parent */}}
            className="w-full flex items-center justify-center gap-2 py-4 sm:py-6 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-white transition-colors"
          >
            <span className="text-lg">+</span>
            Add Section
          </button>
        </div>
      </div>
    </div>
  )

  // Mobile view
  const MobileView = (
    <div className="lg:hidden h-full">
      {activeTab === 'edit' && (
        <div className="h-full overflow-y-auto">
          {EditPanelContent}
        </div>
      )}
      {activeTab === 'steps' && (
        <div className="h-full overflow-y-auto p-4 bg-gray-50">
          <SequenceStepsSidebar
            steps={steps}
            currentStepIndex={currentStepIndex}
            onStepSelect={onStepSelect}
            onAddStep={onAddStep}
            onDeleteStep={onDeleteStep}
            onDelayChange={onDelayChange}
            isEditable={true}
          />
        </div>
      )}
      {activeTab === 'preview' && (
        <div className="h-full overflow-y-auto bg-gray-50">
          <PreviewPanel
            sections={sections}
            subjectLine={subjectLine}
            sampleData={sampleData}
            selectedSampleIndex={selectedSampleIndex}
            onSampleIndexChange={onSampleIndexChange}
            emailFormat={emailFormat}
            onFormatChange={onFormatChange}
          />
        </div>
      )}
    </div>
  )

  // Desktop view
  const DesktopView = (
    <div className="hidden lg:flex h-full">
      {/* Steps Sidebar - only show if multi-step */}
      {steps.length >= 1 && (
        <SequenceStepsSidebar
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepSelect={onStepSelect}
          onAddStep={onAddStep}
          onDeleteStep={onDeleteStep}
          onDelayChange={onDelayChange}
          isEditable={true}
        />
      )}

      {/* Main editor panels */}
      <div className="flex-1">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={30}>
            {EditPanelContent}
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize" />
          <Panel defaultSize={50} minSize={30}>
            <PreviewPanel
              sections={sections}
              subjectLine={subjectLine}
              sampleData={sampleData}
              selectedSampleIndex={selectedSampleIndex}
              onSampleIndexChange={onSampleIndexChange}
              emailFormat={emailFormat}
              onFormatChange={onFormatChange}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Editor Wrapper */}
      <div className="absolute inset-0 flex flex-col">
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-white border-b sticky top-0 z-20">
          <button
            onClick={() => onActiveTabChange('edit')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => onActiveTabChange('steps')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'steps'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Steps
          </button>
          <button
            onClick={() => onActiveTabChange('preview')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {MobileView}
          {DesktopView}
        </div>
      </div>
    </div>
  )
}
