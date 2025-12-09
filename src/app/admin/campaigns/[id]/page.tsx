'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Rocket, Mail, Pencil, AlertCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import EmailEditor from '@/components/email-editor/EmailEditor'
import CampaignStepper, { type CampaignStep } from '@/components/campaign/CampaignStepper'
import FormatSampleStep from '@/components/campaign/FormatSampleStep'
import RegenerateWarningModal from '@/components/campaign/RegenerateWarningModal'
import { getCampaign, updateCampaign, generateEmails, generateSamples, getStagedEmails, launchCampaign, sendTestEmail } from '@/lib/api/campaigns'
import { getStatusLabel } from '@/lib/utils/status-labels'
import type { Campaign, QueuedEmail, Section, SectionMode, SampleData, EmailFormat } from '@/types/email-editor'

export default function CampaignEditPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [stagedEmails, setStagedEmails] = useState<QueuedEmail[]>([])
  const [stagedCount, setStagedCount] = useState(0)
  const [editedCount, setEditedCount] = useState(0)
  const [currentStep, setCurrentStep] = useState<CampaignStep>('design')
  const [showLaunchModal, setShowLaunchModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null)
  
  // CSV state (lifted from EmailEditor)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvFileName, setCsvFileName] = useState<string | null>(null)
  const [sampleData, setSampleData] = useState<SampleData | null>(null)

  // Load campaign and determine initial step based on status
  useEffect(() => {
    if (campaignId && campaignId !== 'new') {
      loadCampaign()
    } else {
      setLoading(false)
    }
  }, [campaignId])

  // Update step when campaign status changes
  useEffect(() => {
    if (campaign) {
      if (campaign.status === 'staged') {
        setCurrentStep('review')
        loadStagedEmails()
      } else if (campaign.status === 'sending' || campaign.status === 'completed') {
        setCurrentStep('complete')
      } else {
        setCurrentStep('design')
      }
    }
  }, [campaign?.status])

  const loadCampaign = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCampaign(campaignId)
      setCampaign(data)
    } catch (err: any) {
      setError('Failed to load campaign: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStagedEmails = async () => {
    try {
      const result = await getStagedEmails(campaignId, { limit: 50 })
      setStagedEmails(result.emails)
      setStagedCount(result.total)
      // Count edited emails
      const edited = result.emails.filter(e => e.isEdited).length
      setEditedCount(edited)
    } catch (err) {
      // Ignore errors - campaign might not have staged emails yet
    }
  }

  // CSV handlers (lifted from EmailEditor)
  const handleCsvUpload = useCallback((file: File, fileName: string, data: SampleData) => {
    setCsvFile(file)
    setCsvFileName(fileName)
    setSampleData(data)
  }, [])

  const handleCsvRemove = useCallback(() => {
    setCsvFile(null)
    setCsvFileName(null)
    setSampleData(null)
  }, [])

  // Autosave handler - returns true on success, false on failure
  const handleAutoSave = useCallback(async (
    sections: Section[], 
    subjectLine: { mode: SectionMode; content: string }, 
    emailFormat: 'html' | 'text'
  ): Promise<boolean> => {
    if (!campaign) return false

    try {
      const updated = await updateCampaign(campaign.id || campaignId, {
        sections,
        subjectLine,
        emailFormat,
      })
      setCampaign(updated)
      return true
    } catch (err: any) {
      console.error('Autosave failed:', err)
      return false
    }
  }, [campaign, campaignId])

  // Continue from design to format-sample step
  const handleContinueToFormatSample = useCallback(async (data: {
    sections: Section[]
    subjectLine: { mode: SectionMode; content: string }
    emailFormat: 'html' | 'text'
  }) => {
    if (!campaign) return

    try {
      setError(null)
      // Save campaign content first
      await updateCampaign(campaign.id || campaignId, {
        sections: data.sections,
        subjectLine: data.subjectLine,
        emailFormat: data.emailFormat,
      })
      await loadCampaign()
      // Move to format-sample step
      setCurrentStep('format-sample')
    } catch (err: any) {
      setError('Failed to save campaign: ' + err.message)
    }
  }, [campaign, campaignId])

  // Generate sample emails
  const handleGenerateSamples = useCallback(async (format: EmailFormat) => {
    if (!campaign || !csvFile) throw new Error('Missing campaign or CSV')
    
    const result = await generateSamples(campaign.id || campaignId, csvFile, format)
    return {
      samples: result.samples,
      totalRecipients: result.totalRecipients,
    }
  }, [campaign, campaignId, csvFile])

  // Generate all emails
  const handleGenerateAll = useCallback(async () => {
    if (!campaign || !csvFile) return

    try {
      setGenerating(true)
      setError(null)

      // Generate emails with the CSV
      const result = await generateEmails(campaign.id || campaignId, csvFile)
      
      if (result.errors && result.errors.length > 0) {
        console.warn('Generation had some errors:', result.errors)
      }

      // Reload campaign and staged emails
      await loadCampaign()
      await loadStagedEmails()
      
      // Move to review step
      setCurrentStep('review')
    } catch (err: any) {
      setError('Failed to generate emails: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }, [campaign, campaignId, csvFile])

  // Back to design from format-sample
  const handleBackToDesignFromFormatSample = useCallback(() => {
    setCurrentStep('design')
  }, [])

  // Back to design from review (shows warning if emails exist)
  const handleBackToDesign = useCallback(() => {
    if (stagedCount > 0) {
      setShowRegenerateModal(true)
    } else {
      setCurrentStep('design')
    }
  }, [stagedCount])

  // Confirm discard and go back to design
  const handleConfirmDiscard = useCallback(async () => {
    if (!campaign) return

    try {
      setIsDeleting(true)
      setError(null)
      
      // Update campaign status back to draft (this will trigger deletion of staged emails on next generate)
      await updateCampaign(campaign.id || campaignId, {
        status: 'draft' as any, // Reset to draft
      })
      
      // Clear local state
      setStagedEmails([])
      setStagedCount(0)
      setEditedCount(0)
      
      // Reload campaign
      await loadCampaign()
      
      setShowRegenerateModal(false)
      setCurrentStep('design')
    } catch (err: any) {
      setError('Failed to discard emails: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }, [campaign, campaignId])

  const handleLaunch = async () => {
    if (!campaign) return

    try {
      setLaunching(true)
      setError(null)
      const result = await launchCampaign(campaign.id || campaignId)
      await loadCampaign()
      setShowLaunchModal(false)
      setCurrentStep('complete')
      
      // Show success and redirect
      alert(`Campaign launched! ${result.queued} emails queued.`)
      router.push('/admin/campaigns')
    } catch (err: any) {
      setError('Failed to launch campaign: ' + err.message)
    } finally {
      setLaunching(false)
    }
  }

  const handleTestSend = async () => {
    if (!campaign || !testEmail) return

    try {
      setSendingTest(true)
      setError(null)
      await sendTestEmail(campaign.id || campaignId, testEmail)
      setShowTestModal(false)
      setTestEmail('')
      alert('Test email sent successfully!')
    } catch (err: any) {
      setError('Failed to send test email: ' + err.message)
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-medium">Campaign not found</p>
          <Link href="/admin/campaigns" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Back to campaigns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/admin/campaigns" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} />
          </Link>
          <div>
              <h1 className="text-lg sm:text-xl font-bold">{campaign.name || 'New Campaign'}</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {getStatusLabel(campaign.status)}
                {campaign.totalRecipients > 0 && ` • ${campaign.totalRecipients} recipients`}
              </p>
            </div>
          </div>
          
          {/* Header actions based on step */}
        <div className="flex items-center gap-2">
            {currentStep === 'review' && (
              <>
                <button
                  onClick={handleBackToDesign}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Pencil size={16} />
                  <span className="hidden sm:inline">Edit Template</span>
                </button>
              <button
                onClick={() => setShowTestModal(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                  <Mail size={16} />
                  <span className="hidden sm:inline">Test Send</span>
              </button>
              <button
                onClick={() => setShowLaunchModal(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                  <Rocket size={16} />
                  <span className="hidden sm:inline">Launch</span>
              </button>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <CampaignStepper currentStep={currentStep} recipientCount={stagedCount} />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content based on step */}
      <div className="flex-1 overflow-hidden">
        {currentStep === 'design' && (
          <EmailEditor
            initialTemplate={campaign.templateSlug ? { slug: campaign.templateSlug } as any : undefined}
            initialSections={campaign.sections}
            initialSubjectLine={campaign.subjectLine}
            initialEmailFormat={campaign.emailFormat}
            onAutoSave={handleAutoSave}
            csvFile={csvFile}
            csvFileName={csvFileName}
            sampleData={sampleData}
            onCsvUpload={handleCsvUpload}
            onCsvRemove={handleCsvRemove}
            onContinue={handleContinueToFormatSample}
            isContinuing={false}
          />
        )}

        {currentStep === 'format-sample' && csvFile && sampleData && (
          <FormatSampleStep
            campaignId={campaign.id || campaignId}
            csvFile={csvFile}
            sampleData={sampleData}
            initialFormat={campaign.emailFormat || 'text'}
            onBack={handleBackToDesignFromFormatSample}
            onGenerateSamples={handleGenerateSamples}
            onGenerateAll={handleGenerateAll}
            isGeneratingAll={generating}
          />
        )}

        {currentStep === 'review' && (
          <div className="h-full overflow-auto bg-gray-50">
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
              {/* Info banner when returning to edit */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>{stagedCount} emails</strong> are ready to send. Review them below, send a test, or launch when ready.
                  If you edit the template, emails will be regenerated.
                </p>
              </div>

              {/* Email list */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h3 className="font-medium text-gray-900">Generated Emails</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing {stagedEmails.length} of {stagedCount} emails
                  </p>
                </div>
                
                {stagedEmails.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No emails generated yet.</p>
                    <button
                      onClick={handleBackToDesign}
                      className="mt-4 text-blue-600 hover:underline"
                    >
                      ← Go back to design your email
                    </button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {stagedEmails.map((email) => (
                      <div key={email.id} className="hover:bg-gray-50">
                        <button
                          onClick={() => setExpandedEmailId(expandedEmailId === email.id ? null : email.id)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {email.toEmail}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {email.subject}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              email.isEdited 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {email.isEdited ? 'Edited' : 'Generated'}
                            </span>
                            {expandedEmailId === email.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        {expandedEmailId === email.id && (
                          <div className="px-4 pb-4 border-t bg-gray-50">
                            <div className="mt-3">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Subject
                              </label>
                              <p className="mt-1 text-sm text-gray-900">{email.subject}</p>
                            </div>
                            <div className="mt-3">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Body
                              </label>
                              <div className="mt-1 p-3 bg-white border rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-auto">
                                {email.body}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {stagedCount > stagedEmails.length && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Showing first {stagedEmails.length} emails. 
                  {stagedCount - stagedEmails.length} more emails not shown.
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Campaign Launched!</h2>
              <p className="text-gray-600 mb-6">
                Your campaign is now {campaign.status === 'sending' ? 'being sent' : 'completed'}.
              </p>
              <Link
                href="/admin/campaigns"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ArrowLeft size={16} />
                Back to Campaigns
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Launch Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Rocket className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">Launch Campaign</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to launch this campaign? <strong>{stagedCount} emails</strong> will be scheduled for sending.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLaunchModal(false)}
                disabled={launching}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {launching ? (
                  <>
                    <span className="animate-spin">◐</span>
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    Launch Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Send Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Send Test Email</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Send a test email to verify everything looks correct before launching.
            </p>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowTestModal(false)}
                disabled={sendingTest}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTestSend}
                disabled={!testEmail || sendingTest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {sendingTest ? (
                  <>
                    <span className="animate-spin">◐</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Warning Modal */}
      <RegenerateWarningModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onConfirm={handleConfirmDiscard}
        totalEmails={stagedCount}
        editedCount={editedCount}
        isDeleting={isDeleting}
      />
    </div>
  )
}
