'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mail, Users, CheckCircle, XCircle } from 'lucide-react'
import type { Campaign, SampleData } from '@/types/email-editor'
import SequenceEditor from '@/components/campaign/SequenceEditor'
import { getCampaignSampleRecipients, replaceCampaignSteps } from '@/lib/api/campaigns-backend'
import SaveChangesModal from '@/components/campaign/SaveChangesModal'
import { useCampaignStore } from '@/stores/campaignStore'
import type { CampaignStep } from '@/types/email-editor'

interface RunningCampaignTabsProps {
  campaign: Campaign
  campaignId: string
  onSave?: () => void
  isSaving?: boolean
  canSave?: boolean
  onSaveStateChange?: (canSave: boolean) => void
  onSavingStateChange?: (isSaving: boolean) => void
  saveHandlerRef?: React.MutableRefObject<((() => void) | null)>
}

type Tab = 'sequence' | 'recipients'

interface Recipient {
  id: string
  email: string
  name?: string
  currentStep: string
  nextEmail: string
  status: 'active' | 'exited' | 'completed'
  exitReason?: string
}

export default function RunningCampaignTabs({ campaign, campaignId, onSave, isSaving: externalIsSaving, canSave: externalCanSave, onSaveStateChange, onSavingStateChange, saveHandlerRef: externalSaveHandlerRef }: RunningCampaignTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sequence')
  const [isPaused, setIsPaused] = useState(false)
  const [sampleData, setSampleData] = useState<SampleData | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [canSave, setCanSave] = useState(false)
  const saveHandlerRef = useRef<(() => void) | null>(null)
  
  // Get store methods for change detection and syncing
  const { getUnsyncedSteps, steps: storeSteps, markStepsSynced } = useCampaignStore()
  
  // Get sorted steps from store for syncing
  const getSortedSteps = useCallback((): CampaignStep[] => {
    return Object.values(storeSteps)
      .filter(step => step.id && (step.campaignId === campaignId || !step.campaignId))
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
      .map(step => {
        // Remove store-specific fields
        const { needsSync, lastModified, ...campaignStep } = step
        return campaignStep as CampaignStep
      })
  }, [storeSteps, campaignId])
  
  // Handle save with change detection
  const handleSave = useCallback(async () => {
    const unsyncedSteps = getUnsyncedSteps()
    
    if (unsyncedSteps.length === 0) {
      // No changes to save
      return
    }
    
    // Show modal to confirm
    setShowSaveModal(true)
  }, [getUnsyncedSteps])

  // Store save handler ref for parent to call
  saveHandlerRef.current = handleSave

  // Expose save handler to parent via useEffect
  useEffect(() => {
    if (onSave && typeof onSave === 'function') {
      // Replace parent's onSave with our handleSave
      // This is a bit hacky but works for now
      const originalOnSave = onSave
      // We'll call handleSave when parent calls onSave
    }
  }, [onSave, handleSave])

  // Update canSave state periodically and notify parent
  useEffect(() => {
    const checkUnsavedChanges = () => {
      const unsyncedSteps = getUnsyncedSteps()
      const hasChanges = unsyncedSteps.length > 0
      setCanSave(hasChanges)
      if (onSaveStateChange) {
        onSaveStateChange(hasChanges)
      }
    }
    
    checkUnsavedChanges()
    const interval = setInterval(checkUnsavedChanges, 1000) // Check every second
    
    return () => clearInterval(interval)
  }, [getUnsyncedSteps, onSaveStateChange])

  // Notify parent of saving state changes
  useEffect(() => {
    if (onSavingStateChange) {
      onSavingStateChange(isSaving)
    }
  }, [isSaving, onSavingStateChange])

  // Expose save handler to parent via ref
  useEffect(() => {
    if (externalSaveHandlerRef) {
      externalSaveHandlerRef.current = handleSave
    }
  }, [handleSave, externalSaveHandlerRef])
  
  // Confirm save - actually sync to server
  const handleConfirmSave = useCallback(async () => {
    try {
      setIsSaving(true)
      const stepsToSync = getSortedSteps()
      
      if (stepsToSync.length === 0) {
        setShowSaveModal(false)
        setIsSaving(false)
        return
      }
      
      // Sync to server
      await replaceCampaignSteps(campaignId, stepsToSync)
      
      // Mark as synced
      const stepIds = stepsToSync.map(step => step.id)
      markStepsSynced(stepIds)
      
      setShowSaveModal(false)
    } catch (error) {
      console.error('Failed to save changes:', error)
      // Keep modal open, show error (changes remain in localStorage)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, getSortedSteps, markStepsSynced])

  // Load sample data for email editor
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        // For always-on campaign, use placeholder sample data
        if (campaignId === 'welcome-drip-lead-magnets' || campaignId?.includes('welcome-drip')) {
          setSampleData({
            rows: [
              {
                Name: 'John Doe',
                FirstName: 'John',
                LastName: 'Doe',
                Email: 'john@example.com',
                Company: 'Example Corp',
                Role: 'Investor',
                Location: 'New York, NY'
              },
              {
                Name: 'Jane Smith',
                FirstName: 'Jane',
                LastName: 'Smith',
                Email: 'jane@example.com',
                Company: 'Smith Investments',
                Role: 'Developer',
                Location: 'Los Angeles, CA'
              }
            ],
            columns: ['Name', 'FirstName', 'LastName', 'Email', 'Company', 'Role', 'Location']
          })
        } else {
          // Try to load real sample data
          const data = await getCampaignSampleRecipients(campaignId)
          setSampleData(data)
        }
      } catch (err) {
        console.error('Failed to load sample data:', err)
        // Fallback to placeholder data
        setSampleData({
          rows: [
            {
              Name: 'John Doe',
              FirstName: 'John',
              LastName: 'Doe',
              Email: 'john@example.com',
              Company: 'Example Corp',
              Role: 'Investor',
              Location: 'New York, NY'
            }
          ],
          columns: ['Name', 'FirstName', 'LastName', 'Email', 'Company', 'Role', 'Location']
        })
      }
    }
    loadSampleData()
  }, [campaignId])

  // Placeholder data
  const activeRecipients = 892

  const recipients: Recipient[] = [
    { id: '1', email: 'john@example.com', name: 'John Doe', currentStep: 'Step 2', nextEmail: 'Day 3', status: 'active' },
    { id: '2', email: 'jane@example.com', name: 'Jane Smith', currentStep: 'Step 1', nextEmail: '5 min', status: 'active' },
    { id: '3', email: 'bob@example.com', name: 'Bob Johnson', currentStep: 'Step 3', nextEmail: 'Day 5', status: 'active' },
    { id: '4', email: 'alice@example.com', name: 'Alice Williams', currentStep: '—', nextEmail: '—', status: 'exited', exitReason: 'replied' },
    { id: '5', email: 'charlie@example.com', name: 'Charlie Brown', currentStep: 'Step 2', nextEmail: 'Day 3', status: 'active' },
    { id: '6', email: 'diana@example.com', name: 'Diana Prince', currentStep: 'Step 4', nextEmail: 'Day 7', status: 'active' },
    { id: '7', email: 'edward@example.com', name: 'Edward Norton', currentStep: '—', nextEmail: '—', status: 'completed' },
    { id: '8', email: 'fiona@example.com', name: 'Fiona Apple', currentStep: 'Step 1', nextEmail: '5 min', status: 'active' }
  ]

  const tabs = [
    { id: 'sequence' as Tab, label: 'Sequence', icon: Mail },
    { id: 'recipients' as Tab, label: 'Recipients', icon: Users }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center gap-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {activeTab === 'sequence' && (
          <div className="h-full flex flex-col">
            {/* Sequence Editor - 3 Panel Layout */}
            <div className="flex-1 overflow-hidden">
              <SequenceEditor
                campaignId={campaignId}
                campaign={campaign}
                sampleData={sampleData}
                recipientCount={campaign.totalRecipients || 0}
                onContinue={handleSave}
                isContinuing={isSaving}
                saveButtonText="Save"
                skipAutoSync={true}
                onSaveStateChange={(canSaveState) => {
                  setCanSave(canSaveState)
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'recipients' && (
          <div className="max-w-6xl mx-auto p-6">
            {/* Active Recipients Card */}
            <div className="mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 inline-block">
                <p className="text-sm text-gray-500 mb-1">Active Recipients</p>
                <p className="text-2xl font-semibold text-blue-600">{activeRecipients.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Currently in sequence</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recipients</h2>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search recipients..."
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All</option>
                  <option>Active</option>
                  <option>Exited</option>
                  <option>Completed</option>
                </select>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Export
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Step
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recipients.map((recipient) => (
                    <tr key={recipient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{recipient.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{recipient.name || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{recipient.currentStep}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{recipient.nextEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {recipient.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            <CheckCircle size={12} />
                            Active
                          </span>
                        )}
                        {recipient.status === 'exited' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            <XCircle size={12} />
                            Exited
                            {recipient.exitReason && (
                              <span className="ml-1 text-xs">({recipient.exitReason})</span>
                            )}
                          </span>
                        )}
                        {recipient.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            <CheckCircle size={12} />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Showing 1-8 of {recipients.length} recipients</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Save Changes Modal */}
      <SaveChangesModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
        isSaving={isSaving}
      />
    </div>
  )
}
