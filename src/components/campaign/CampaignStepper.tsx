'use client'

import { Check } from 'lucide-react'

// Internal step includes format-sample, but visually we show 3 steps
export type CampaignStep = 'design' | 'format-sample' | 'review' | 'complete'

interface CampaignStepperProps {
  currentStep: CampaignStep
  recipientCount?: number
}

// Visual steps shown in the stepper (3 steps)
const VISUAL_STEPS = [
  { id: 'design', label: 'Design Email' },
  { id: 'review', label: 'Review' },
  { id: 'complete', label: 'Launch' },
] as const

// Map internal steps to visual step index
function getVisualStepIndex(step: CampaignStep): number {
  switch (step) {
    case 'design':
      return 0
    case 'format-sample':
    case 'review':
      return 1
    case 'complete':
      return 2
    default:
      return 0
  }
}

export default function CampaignStepper({ currentStep, recipientCount }: CampaignStepperProps) {
  const currentStepIndex = getVisualStepIndex(currentStep)

  return (
    <div className="flex items-center justify-center py-4 px-6 bg-gray-50 border-b">
      <div className="flex items-center gap-2 sm:gap-4">
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
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
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
                  {step.label}
                  {step.id === 'review' && recipientCount !== undefined && recipientCount > 0 && (
                    <span className="ml-1 text-xs">({recipientCount})</span>
                  )}
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
    </div>
  )
}

