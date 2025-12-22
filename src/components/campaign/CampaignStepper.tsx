'use client'

import { Check, ArrowLeft, Rocket } from 'lucide-react'

// Internal steps include select-recipients, format-sample, but visually we show 4 steps
export type CampaignStep = 'select-recipients' | 'design' | 'format-sample' | 'review' | 'complete'

interface CampaignStepperProps {
  currentStep: CampaignStep
  recipientCount?: number
  onBack?: () => void
  onBackToRecipients?: () => void
  onLaunch?: () => void
}

// Visual steps shown in the stepper (4 steps)
const VISUAL_STEPS = [
  { id: 'select-recipients', label: 'Select Recipients' },
  { id: 'design', label: 'Design Email' },
  { id: 'review', label: 'Review' },
  { id: 'complete', label: 'Launch' },
] as const

// Map internal steps to visual step index
function getVisualStepIndex(step: CampaignStep): number {
  switch (step) {
    case 'select-recipients':
      return 0
    case 'design':
      return 1
    case 'format-sample':
    case 'review':
      return 2
    case 'complete':
      return 3
    default:
      return 0
  }
}

export default function CampaignStepper({ currentStep, recipientCount, onBack, onBackToRecipients, onLaunch }: CampaignStepperProps) {
  const currentStepIndex = getVisualStepIndex(currentStep)

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-gray-50 border-b">
      {/* Back button - show on design and review steps */}
      <div className="flex-1">
        {currentStep === 'design' && onBackToRecipients && (
          <button
            onClick={onBackToRecipients}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Recipients</span>
          </button>
        )}
        {currentStep === 'review' && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Design</span>
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
        {VISUAL_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex

          return (
            <div key={step.id} className="flex items-center">
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors flex-shrink-0 aspect-square
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${isCurrent ? 'bg-blue-600 text-white' : ''}
                    ${isPending ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    text-sm font-medium hidden sm:block
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isCurrent ? 'text-blue-600' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {step.id === 'select-recipients' && recipientCount !== undefined && recipientCount > 0
                    ? `${recipientCount} Recipients Selected`
                    : step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < VISUAL_STEPS.length - 1 && (
                <div
                  className={`
                    w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 transition-colors
                    ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Launch button - only show on review step */}
      <div className="flex-1 flex justify-end">
        {currentStep === 'review' && onLaunch && (
          <button
            onClick={onLaunch}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Launch</span>
          </button>
        )}
      </div>
    </div>
  )
}

