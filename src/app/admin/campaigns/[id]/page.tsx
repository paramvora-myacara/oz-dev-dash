'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Rocket, Mail, Pencil, AlertCircle, ChevronDown, ChevronUp, Eye, RefreshCw, Check, Loader2 } from 'lucide-react'
import EmailEditor from '@/components/email-editor/EmailEditor'
import CampaignStepper, { type CampaignStep } from '@/components/campaign/CampaignStepper'
import ContactSelectionStep from '@/components/campaign/ContactSelectionStep'
import FormatSampleStep from '@/components/campaign/FormatSampleStep'
import RegenerateWarningModal from '@/components/campaign/RegenerateWarningModal'
import EmailValidationErrorsModal from '@/components/campaign/EmailValidationErrorsModal'
import { updateCampaign, generateEmails, getStagedEmails, launchCampaign, sendTestEmail, getCampaignSampleRecipients, retryFailed, getCampaignSummary, getEmails } from '@/lib/api/campaigns-backend'
import { useCampaignStatus } from '@/hooks/useCampaignStatus'
import { getStatusLabel } from '@/lib/utils/status-labels'
import { isValidEmail } from '@/lib/utils/validation'
import type { QueuedEmail, Section, SectionMode, SampleData, EmailFormat } from '@/types/email-editor'
import { createClient } from '@/utils/supabase/client'

export default function CampaignEditPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  // campaignData comes from useCampaignStatus hook (consolidated state)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [stagedEmails, setStagedEmails] = useState<QueuedEmail[]>([])
  const [stagedCount, setStagedCount] = useState(0)
  const [editedCount, setEditedCount] = useState(0)
  const [invalidEmails, setInvalidEmails] = useState<{ id: string, email: string }[]>([])
  const [validCount, setValidCount] = useState(0)
  const [currentStep, setCurrentStep] = useState<CampaignStep>('design')
  const [showLaunchModal, setShowLaunchModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [testRecipientEmailId, setTestRecipientEmailId] = useState<string | null>(null)
  const [sendingTest, setSendingTest] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null)

  const [failedEmails, setFailedEmails] = useState<QueuedEmail[]>([])
  const [campaignSummary, setCampaignSummary] = useState<{
    sent: number
    failed: number
    queued: number
    processing: number
    staged: number
    total: number
    lastSentAt: string | null
    nextScheduledFor: string | null
    sparkpostMetrics?: {
      deliveryRate: number | null
      bounceRate: number | null
      countDelivered: number | null
      countBounced: number | null
      unsubscribeRate: number | null
      countUnsubscribed: number | null
    }
  } | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingFailed, setLoadingFailed] = useState(false)
  const [retryingFailed, setRetryingFailed] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  // Campaign data hook (includes status, polling for progress)
  const { status: campaignData, refresh: refreshCampaignData, isLoading: dataLoading } = useCampaignStatus(campaignId)

  // Regeneration state

  // Contact selection state
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])

  // Sample data from database (replaces CSV)
  const [sampleData, setSampleData] = useState<SampleData | null>(null)

  // Fetch current admin user email
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          console.log('Fetched admin email:', user.email)
          setAdminEmail(user.email)

          // Only set test email if it's currently empty
          setTestEmail(prev => prev || user.email!)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    fetchUser()
  }, [])

  // Campaign data loads automatically via useCampaignStatus hook

  // Campaign data loads automatically via useCampaignStatus hook
  // Set loading to false when campaignData is loaded or fails to load
  useEffect(() => {
    if (campaignData || (!dataLoading && !campaignData)) {
      setLoading(false)
    }
  }, [campaignData, dataLoading])

  // Load sample data when campaignData is available and has recipients
  useEffect(() => {
    if (campaignData && campaignData.totalRecipients > 0) {
      loadSampleData()
    }
  }, [campaignData])

  const loadSampleData = async () => {
    try {
      const data = await getCampaignSampleRecipients(campaignId)
      setSampleData(data)
    } catch (err) {
      console.error('Failed to load sample data:', err)
      // Set empty structure to prevent undefined errors
      setSampleData({ rows: [], columns: [] })
    }
  }

  const loadStagedEmails = async () => {
    try {
      // First, get all staged emails to validate them (paginate to handle large datasets)
      const PAGE_SIZE = 1000
      let allEmails: any[] = []
      let offset = 0
      let hasMore = true

      while (hasMore) {
        const result = await getStagedEmails(campaignId, { limit: PAGE_SIZE, offset })
        const emails = result.emails
        allEmails = allEmails.concat(emails)

        // If we got fewer emails than requested, we've reached the end
        if (emails.length < PAGE_SIZE) {
          hasMore = false
        } else {
          offset += PAGE_SIZE
        }
      }

      // Total count is the actual number of emails we fetched
      const totalCount = allEmails.length

      // Validate emails
      const invalid: { id: string, email: string }[] = []
      const validEmails = allEmails.filter(email => {
        if (!isValidEmail(email.toEmail)) {
          invalid.push({ id: email.id, email: email.toEmail })
          return false
        }
        return true
      })

      setInvalidEmails(invalid)
      setValidCount(validEmails.length)
      setStagedCount(totalCount)

      // Get the first 50 for display (prioritize valid emails)
      const displayEmails = validEmails.slice(0, 50)
      setStagedEmails(displayEmails)

      // Count edited emails from display set
      const edited = displayEmails.filter(e => e.isEdited).length
      setEditedCount(edited)
    } catch (err) {
      // Ignore errors - campaign might not have staged emails yet
      console.error('Error loading staged emails:', err)
    }
  }

  const loadFailedEmails = useCallback(async () => {
    if (!campaignId) return
    try {
      setLoadingFailed(true)
      const emails = await getEmails(campaignId, 'failed', 200)
      setFailedEmails(emails)
    } catch (err) {
      console.error('Failed to load failed emails', err)
    } finally {
      setLoadingFailed(false)
    }
  }, [campaignId])

  const loadSummary = useCallback(async () => {
    if (!campaignId) return
    try {
      setLoadingSummary(true)
      const summary = await getCampaignSummary(campaignId)
      if (summary) {
        setCampaignSummary({
          ...summary.counts,
          lastSentAt: summary.lastSentAt,
          nextScheduledFor: summary.nextScheduledFor,
          sparkpostMetrics: summary.sparkpostMetrics,
        })
      }
    } catch (err) {
      console.error('Failed to load campaign summary', err)
    } finally {
      setLoadingSummary(false)
    }
  }, [campaignId])

  // Update step when campaign status changes
  useEffect(() => {
    // Use smart status: if polling shows staged emails, treat as staged regardless of campaignData.status
    if (campaignData) {
      const hasStagedEmails = campaignData.staged_count > 0
      const effectiveStatus = hasStagedEmails ? 'staged' : campaignData.status

      if (effectiveStatus === 'staged') {
        setCurrentStep('review')
        loadStagedEmails()
      } else if (['scheduled', 'sending', 'completed'].includes(effectiveStatus as string)) {
        setCurrentStep('complete')
      } else if (effectiveStatus === 'draft') {
        // For draft campaigns: route based on recipients
        if (campaignData.totalRecipients === 0) {
          setCurrentStep('select-recipients')
        } else {
          // Has recipients - go to design (allows format-sample as sub-step)
          if (currentStep !== 'design' && currentStep !== 'format-sample') {
            setCurrentStep('design')
          }
        }
      } else {
        setCurrentStep('design')
      }
    }
  }, [campaignData, currentStep])

  useEffect(() => {
    if (currentStep === 'complete') {
      loadSummary()
      loadFailedEmails()
    }
  }, [currentStep, loadSummary, loadFailedEmails])

  // Autosave handler - returns true on success, false on failure

  // Continue from recipient selection to design step
  const handleContinueFromRecipients = useCallback((contactIds: string[]) => {
    setSelectedContactIds(contactIds)
    // Campaign data updates automatically, just set the step
    setCurrentStep('design')
  }, [])

  // Back from design to recipient selection
  const handleBackToRecipients = useCallback(() => {
    setCurrentStep('select-recipients')
  }, [])

  // Continue from design to format-sample step
  const handleContinueToFormatSample = useCallback(async (data: {
    sections: Section[]
    subjectLine: { mode: SectionMode; content: string }
    emailFormat: 'html' | 'text'
  }) => {
    if (!campaignData) return

    try {
      setError(null)

      // EmailEditor handles step syncing internally via syncUnsavedChanges()
      // We just need to handle campaign-level data (format, etc.) if needed
      if (data.emailFormat !== campaignData?.emailFormat) {
        await updateCampaign(campaignData?.id || campaignId, {
          emailFormat: data.emailFormat,
        })
      }

      // Refresh campaign data and move to format-sample step
      await refreshCampaignData()
      setCurrentStep('format-sample')
    } catch (err: any) {
      setError('Failed to save campaign: ' + err.message)
    }
  }, [campaignData, campaignId, refreshCampaignData])

  // Generate all emails with specified format
  const handleGenerateAllWithFormat = useCallback(async (format: EmailFormat) => {
    if (!campaignData) return
    // Allow generation if we have database recipients
    const totalRecipients = campaignData?.totalRecipients || 0
    if (totalRecipients === 0) return

    try {
      setGenerating(true)
      setError(null)

      // Save the format to the campaign first
      await updateCampaign(campaignData?.id || campaignId, { emailFormat: format })

      // Start generation (returns immediately - background job)
      await generateEmails(
        campaignData?.id || campaignId,
        null, // No CSV
        undefined, // No progress callback - use status polling instead
        { useDatabaseRecipients: true }
      )

      // Refresh status immediately and start polling
      await refreshCampaignData()

    } catch (err: any) {
      setGenerating(false)
      setError('Failed to start email generation: ' + err.message)
    }
  }, [campaignData, campaignId, refreshCampaignData])

  // Watch for generation completion
  // Check both campaign status and staged count for reliable detection
  // campaignData.campaign_status is more reliable as it's fetched fresh from the status endpoint
  useEffect(() => {
    if (generating && campaignData &&
      campaignData.status === 'staged' &&
      campaignData.staged_count > 0) {
      setGenerating(false)
      loadStagedEmails()
      setCurrentStep('review')
    }
  }, [generating, campaignData, loadStagedEmails])

  // Poll status while generating
  useEffect(() => {
    if (!generating) return

    const interval = setInterval(() => {
      refreshCampaignData()
    }, 2000)

    const timeout = setTimeout(() => {
      if (generating) {
        setGenerating(false)
        setError('Generation is taking longer than expected. Please refresh to check status.')
      }
    }, 60000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [generating, refreshCampaignData])



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
    if (!campaignData) return

    try {
      setIsDeleting(true)
      setError(null)

      // Update campaign status back to draft (this will trigger deletion of staged emails on next generate)
      await updateCampaign(campaignData?.id || campaignId, {
        status: 'draft' as any, // Reset to draft
      })

      // Clear local state
      setStagedEmails([])
      setStagedCount(0)
      setEditedCount(0)

      // Refresh campaign data
      await refreshCampaignData()

      setShowRegenerateModal(false)
      setCurrentStep('design')
    } catch (err: any) {
      setError('Failed to discard emails: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }, [campaignData, campaignId])

  const handleLaunch = async () => {
    if (!campaignData) return

    try {
      setLaunching(true)
      setError(null)

      // Start launch (returns immediately - background job)
      await launchCampaign(campaignData?.id || campaignId)

      // Refresh campaign data immediately
      await refreshCampaignData()

    } catch (err: any) {
      setLaunching(false)
      setError('Failed to start campaign launch: ' + err.message)
    }
  }

  // Watch for launch completion
  // Check both campaign status and queued count for reliable detection
  // campaignData.campaign_status is more reliable as it's fetched fresh from the status endpoint
  useEffect(() => {
    if (launching && campaignData &&
      campaignData.status === 'scheduled' &&
      campaignData.queued_count > 0) {
      setLaunching(false)
      setShowLaunchModal(false)
      setCurrentStep('complete')
      alert(`Campaign launched! ${campaignData.queued_count} emails queued.`)
      // Stay on the campaign page to view the complete step with campaign statistics
    }
  }, [launching, campaignData])

  // Poll status while launching
  useEffect(() => {
    if (!launching) return

    const interval = setInterval(() => {
      refreshCampaignData()
    }, 2000)

    const timeout = setTimeout(() => {
      if (launching) {
        setLaunching(false)
        setError('Launch is taking longer than expected. Please refresh to check status.')
      }
    }, 60000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [launching, refreshCampaignData])

  const handleTestSend = async () => {
    if (!campaignData || !testEmail) return

    try {
      setSendingTest(true)
      setError(null)
      await sendTestEmail(campaignData?.id || campaignId, testEmail, testRecipientEmailId || undefined)

      // Reset to admin email instead of clearing entirely
      if (adminEmail) {
        setTestEmail(adminEmail)
      } else {
        setTestEmail('')
      }

      // Keep the selected recipient context
      // setTestRecipientEmailId(null) 
      alert('Test email sent successfully!')
    } catch (err: any) {
      setError('Failed to send test email: ' + err.message)
    } finally {
      setSendingTest(false)
    }
  }

  // Set default test recipient when staged emails load
  // Set default test recipient when staged emails load
  useEffect(() => {
    if (stagedEmails.length > 0 && !testRecipientEmailId) {
      setTestRecipientEmailId(stagedEmails[0].id)
      // Warning: Do NOT overwrite the testEmail here as it should be the logged-in admin's email
      // setTestEmail(stagedEmails[0].toEmail) 
    }
  }, [stagedEmails, testRecipientEmailId])

  const handleRetryFailed = useCallback(async () => {
    if (!campaignData) return

    try {
      setRetryingFailed(true)
      setError(null)
      setInfo(null)

      // Start retry (returns immediately - background job)
      await retryFailed(campaignData?.id || campaignId)

      setInfo('Retry started. Emails will be rescheduled. Refresh to see updates.')

      // Poll status and reload after a delay
      setTimeout(async () => {
        await refreshCampaignData()
        await loadSummary()
        await loadFailedEmails()
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to retry failed emails')
    } finally {
      setRetryingFailed(false)
    }
  }, [campaignData, campaignId, loadSummary, loadFailedEmails, refreshCampaignData])


  // Remove invalid recipient
  const handleRemoveInvalidRecipient = async (emailId: string) => {
    if (!campaignData) return

    try {
      const res = await fetch(`/api/campaigns/${campaignData?.id || campaignId}/emails/${emailId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      // Update local state - remove from invalid emails and reload staged emails
      setInvalidEmails(prev => prev.filter(e => e.id !== emailId))
      await loadStagedEmails()
    } catch (err: any) {
      setError('Failed to remove invalid recipient: ' + err.message)
    }
  }

  // Remove all invalid recipients
  const handleRemoveAllInvalidRecipients = async () => {
    if (!campaignData || invalidEmails.length === 0) return

    try {
      setError(null)
      // Delete all invalid emails in parallel
      const deletePromises = invalidEmails.map(invalid =>
        fetch(`/api/campaigns/${campaignData?.id || campaignId}/emails/${invalid.id}`, {
          method: 'DELETE',
        })
      )

      const results = await Promise.allSettled(deletePromises)

      // Check for any failures
      const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok))
      if (failures.length > 0) {
        throw new Error(`Failed to remove ${failures.length} invalid email(s)`)
      }

      // Clear invalid emails from state and reload staged emails
      setInvalidEmails([])
      await loadStagedEmails()
    } catch (err: any) {
      setError('Failed to remove all invalid recipients: ' + err.message)
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

  if (!campaignData && !dataLoading) {
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
              <h1 className="text-lg sm:text-xl font-bold">{campaignData?.name || 'New Campaign'}</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {getStatusLabel((campaignData?.status as any) || 'draft')}
                {campaignData?.totalRecipients && campaignData.totalRecipients > 0 && ` • ${campaignData.totalRecipients} recipients`}
              </p>
            </div>
          </div>

          {/* Header actions based on step */}
          <div className="flex items-center gap-2">
          </div>
        </div>
      </div>

      {/* Stepper */}
      <CampaignStepper
        currentStep={currentStep}
        recipientCount={currentStep === 'review' || currentStep === 'format-sample'
          ? (stagedCount || (campaignData?.totalRecipients || 0))
          : (campaignData?.totalRecipients || 0)}
        onBack={currentStep === 'review' ? handleBackToDesign : undefined}
        onBackToRecipients={currentStep === 'design' ? handleBackToRecipients : undefined}
        onLaunch={currentStep === 'review' ? () => {
          if (invalidEmails.length > 0) {
            setError(`Cannot launch campaign with ${invalidEmails.length} invalid email address${invalidEmails.length !== 1 ? 'es' : ''}. Please remove them first.`)
            return
          }
          setShowLaunchModal(true)
        } : undefined}
      />

      {/* Info / Error Banner */}
      {(info || error) && (
        <div className={`${error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border-b px-4 py-3`}>
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
            <p className={`text-sm flex-1 ${error ? 'text-red-700' : 'text-green-700'}`}>{error || info}</p>
            <button
              onClick={() => { setError(null); setInfo(null); }}
              className={`${error ? 'text-red-400 hover:text-red-600' : 'text-green-500 hover:text-green-700'} text-sm`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content based on step */}
      <div className="flex-1 overflow-hidden">
        {currentStep === 'select-recipients' && (
          <ContactSelectionStep
            campaignId={campaignId}
            onContinue={handleContinueFromRecipients}
            onBack={() => router.push('/admin/campaigns')}
          />
        )}

        {currentStep === 'design' && (
          <EmailEditor
            campaignId={campaignId}
            campaign={campaignData as any}
            sampleData={sampleData}
            recipientCount={campaignData?.totalRecipients || 0}
            onContinue={handleContinueToFormatSample}
            isContinuing={false}
          />
        )}

        {currentStep === 'format-sample' && (
          <FormatSampleStep
            campaignId={campaignData?.id || campaignId}
            sampleData={sampleData}
            recipientCount={campaignData?.totalRecipients || 0}
            initialFormat={campaignData?.emailFormat === 'text' ? 'text' : 'html'}
            onBack={handleBackToDesignFromFormatSample}
            onGenerateAll={handleGenerateAllWithFormat}
            isGeneratingAll={generating}
            campaignStatus={campaignData}
            onRefreshStatus={() => refreshCampaignData()}
          />
        )}

        {currentStep === 'review' && (
          <div className="h-full overflow-auto bg-gray-50">
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
              {/* Status indicator for generation/launch */}
              {(generating || launching) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">
                          {generating && 'Generating emails...'}
                          {launching && 'Launching campaign...'}
                        </p>
                        <p className="text-xs text-yellow-700 mt-0.5">
                          {generating && `${campaignData?.staged_count || 0} staged`}
                          {launching && `${campaignData?.queued_count || 0} queued`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => refreshCampaignData()}
                      disabled={dataLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-yellow-700 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              )}

              {/* Info banner when returning to edit */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>{validCount} of {stagedCount} emails</strong> are valid and ready to send. Review them below, send a test, or launch when ready.
                  If you edit the template, emails will be regenerated.
                </p>
              </div>

              {/* Test Send Row */}
              {stagedEmails.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border mb-4">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-900">Send Test Email</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Test the email personalized for a specific recipient
                    </p>
                  </div>
                  <div className="px-4 py-3 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Use recipient data from:
                      </label>
                      <select
                        value={testRecipientEmailId || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value
                          setTestRecipientEmailId(selectedId)
                          // Only update context, don't change the "Send to" email
                          // const selectedEmail = stagedEmails.find(e => e.id === selectedId)
                          // if (selectedEmail) {
                          //   setTestEmail(selectedEmail.toEmail)
                          // }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {stagedEmails.map((email) => (
                          <option key={email.id} value={email.id}>
                            {email.toEmail} {email.metadata?.Name ? `(${email.metadata.Name})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Send to email address:
                      </label>
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleTestSend}
                        disabled={!testEmail || sendingTest}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {sendingTest ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
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
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-gray-700">
                        Emails in this campaign
                      </p>
                      {invalidEmails.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>{invalidEmails.length} invalid</span>
                        </div>
                      )}
                    </div>
                    <div className="border border-gray-200 rounded-lg bg-gray-50 max-h-48 overflow-auto">
                      {/* Invalid emails section */}
                      {invalidEmails.length > 0 && (
                        <div className="border-b border-red-200 bg-red-50">
                          <div className="px-3 py-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-medium text-red-800">
                                  Invalid Email Addresses ({invalidEmails.length})
                                </span>
                              </div>
                              <button
                                onClick={handleRemoveAllInvalidRecipients}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1 transition-colors"
                              >
                                Remove All
                              </button>
                            </div>
                            <div className="space-y-1">
                              {invalidEmails.slice(0, 5).map((invalid) => (
                                <div key={invalid.id} className="flex items-center justify-between bg-white rounded px-2 py-1">
                                  <span className="text-xs text-red-700 font-mono truncate flex-1">{invalid.email}</span>
                                  <button
                                    onClick={() => handleRemoveInvalidRecipient(invalid.id)}
                                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              {invalidEmails.length > 5 && (
                                <div className="text-xs text-red-600 text-center py-1">
                                  ... and {invalidEmails.length - 5} more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Valid emails section */}
                      {stagedEmails.slice(0, 20).map((email) => (
                        <div
                          key={email.id}
                          className="px-3 py-2 text-sm text-gray-700 border-b last:border-b-0 flex items-center justify-between gap-3"
                        >
                          <div className="truncate">
                            <div className="font-medium truncate">{email.toEmail}</div>
                            {email.metadata?.Name && (
                              <div className="text-xs text-gray-500 truncate">{email.metadata.Name}</div>
                            )}
                          </div>
                          {email.metadata?.Company && (
                            <div className="text-xs text-gray-500 truncate">{email.metadata.Company}</div>
                          )}
                        </div>
                      ))}
                      {stagedEmails.length === 0 && invalidEmails.length === 0 && (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">
                          No staged emails yet.
                        </div>
                      )}
                      {stagedEmails.length > 20 && (
                        <div className="px-3 py-2 text-xs text-gray-500 text-center border-t">
                          Showing first 20 of {stagedEmails.length} recipients
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="h-full overflow-auto bg-gray-50">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
              <div className="bg-white border rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 tracking-wide">Campaign status</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {getStatusLabel((campaignData?.status as any) || 'draft')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {campaignData?.totalRecipients} recipients • {campaignData?.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/admin/campaigns"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <ArrowLeft size={16} />
                    Back to Campaigns
                  </Link>
                </div>
              </div>

              {/* Summary cards with refresh button */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Campaign Statistics</h2>
                <button
                  onClick={loadSummary}
                  disabled={loadingSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Refresh statistics"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              {/* First row: Total, Sent, Queued, Failed */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase text-gray-500 mb-1">Total</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {campaignSummary ? campaignSummary.total.toLocaleString() : '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">All statuses</p>
                </div>
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase text-gray-500 mb-1">Sent</p>
                  <p className="text-xl font-semibold text-green-600">
                    {campaignSummary ? campaignSummary.sent.toLocaleString() : '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Last: {campaignSummary?.lastSentAt ? new Date(campaignSummary.lastSentAt).toLocaleString() : '—'}
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase text-gray-500 mb-1">Queued</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {campaignSummary ? (campaignSummary.queued + campaignSummary.processing).toLocaleString() : '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Next: {campaignSummary?.nextScheduledFor ? new Date(campaignSummary.nextScheduledFor).toLocaleString() : '—'}
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase text-gray-500 mb-1">Failed</p>
                  <p className="text-xl font-semibold text-red-600">
                    {campaignSummary ? campaignSummary.failed.toLocaleString() : '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">Needs retry</p>
                </div>
              </div>

              {/* Second row: Delivery Rate, Bounce Rate, Unsubscribe Rate */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase text-gray-500 mb-1">Delivery Rate</p>
                  <p className="text-xl font-semibold text-green-600">
                    {campaignSummary?.sparkpostMetrics?.deliveryRate !== null && campaignSummary?.sparkpostMetrics?.deliveryRate !== undefined
                      ? `${campaignSummary.sparkpostMetrics.deliveryRate.toFixed(1)}%`
                      : '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {campaignSummary?.sparkpostMetrics?.countDelivered !== null && campaignSummary?.sparkpostMetrics?.countDelivered !== undefined
                      ? `${campaignSummary.sparkpostMetrics.countDelivered.toLocaleString()} delivered`
                      : 'No data'}
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase text-gray-500 mb-1">Bounce Rate</p>
                  <p className="text-xl font-semibold text-orange-600">
                    {campaignSummary?.sparkpostMetrics?.bounceRate !== null && campaignSummary?.sparkpostMetrics?.bounceRate !== undefined
                      ? `${campaignSummary.sparkpostMetrics.bounceRate.toFixed(1)}%`
                      : '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {campaignSummary?.sparkpostMetrics?.countBounced !== null && campaignSummary?.sparkpostMetrics?.countBounced !== undefined
                      ? `${campaignSummary.sparkpostMetrics.countBounced.toLocaleString()} bounced`
                      : 'No data'}
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase text-gray-500 mb-1">Unsubscribe Rate</p>
                  <p className="text-xl font-semibold text-red-600">
                    {campaignSummary?.sparkpostMetrics?.unsubscribeRate !== null && campaignSummary?.sparkpostMetrics?.unsubscribeRate !== undefined
                      ? `${campaignSummary.sparkpostMetrics.unsubscribeRate.toFixed(1)}%`
                      : '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {campaignSummary?.sparkpostMetrics?.countUnsubscribed !== null && campaignSummary?.sparkpostMetrics?.countUnsubscribed !== undefined && campaignSummary?.sparkpostMetrics?.countDelivered !== null && campaignSummary?.sparkpostMetrics?.countDelivered !== undefined
                      ? `${campaignSummary.sparkpostMetrics.countUnsubscribed.toLocaleString()} unsubs / ${campaignSummary.sparkpostMetrics.countDelivered.toLocaleString()} delivered`
                      : 'No data'}
                  </p>
                </div>
              </div>

              {/* Failed emails + retry */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div>
                    <h3 className="font-semibold text-gray-900">Failed emails</h3>
                    <p className="text-xs text-gray-500">
                      Showing up to 200 failed emails. Retry uses the same 3.5 min + jitter scheduling.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={loadFailedEmails}
                      disabled={loadingFailed}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingFailed ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    <button
                      onClick={handleRetryFailed}
                      disabled={retryingFailed || failedEmails.length === 0}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${retryingFailed ? 'animate-spin' : ''}`} />
                      Retry failed
                    </button>
                  </div>
                </div>
                {failedEmails.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {loadingFailed ? 'Loading failures...' : 'No failed emails.'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {failedEmails.map((email) => (
                      <div key={email.id} className="px-4 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{email.toEmail}</p>
                            <p className="text-xs text-gray-500 truncate">{email.subject}</p>
                            {email.errorMessage && (
                              <p className="text-xs text-red-600 mt-1 truncate">Error: {email.errorMessage}</p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created {new Date(email.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Launch Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
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


      {/* Regenerate Warning Modal */}
      <RegenerateWarningModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onConfirm={handleConfirmDiscard}
        totalEmails={stagedCount}
        editedCount={editedCount}
        isDeleting={isDeleting}
      />

      {/* Email Validation Errors Modal */}
      <EmailValidationErrorsModal
        isOpen={validationErrors !== null}
        onClose={() => setValidationErrors(null)}
        stagedCount={stagedCount}
        errors={validationErrors || []}
      />
    </div>
  )
}
