'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Rocket, Mail, Pencil, AlertCircle, ChevronDown, ChevronUp, Eye, RefreshCw, Check, Loader2 } from 'lucide-react'
import EmailEditor from '@/components/email-editor/EmailEditor'
import CampaignStepper, { type CampaignStep } from '@/components/campaign/CampaignStepper'
import FormatSampleStep from '@/components/campaign/FormatSampleStep'
import RegenerateWarningModal from '@/components/campaign/RegenerateWarningModal'
import EmailValidationErrorsModal from '@/components/campaign/EmailValidationErrorsModal'
import { getCampaign, updateCampaign, generateEmails, getStagedEmails, launchCampaign, sendTestEmail, regenerateEmail, type GenerateProgress } from '@/lib/api/campaigns'
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
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null)
  const [testEmail, setTestEmail] = useState('')
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
    }
  } | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingFailed, setLoadingFailed] = useState(false)
  const [retryingFailed, setRetryingFailed] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  // Generation progress state
  const [generateProgress, setGenerateProgress] = useState<GenerateProgress | null>(null)

  // Regeneration state
  const [regeneratingEmailId, setRegeneratingEmailId] = useState<string | null>(null)

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

  const loadFailedEmails = useCallback(async () => {
    if (!campaignId) return
    try {
      setLoadingFailed(true)
      const res = await fetch(`/api/campaigns/${campaignId}/emails?status=failed&limit=200`)
      const json = await res.json()
      if (json?.emails) {
        setFailedEmails(json.emails)
      }
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
      const res = await fetch(`/api/campaigns/${campaignId}/summary`)
      const json = await res.json()
      if (json?.counts) {
        setCampaignSummary({
          ...json.counts,
          lastSentAt: json.lastSentAt,
          nextScheduledFor: json.nextScheduledFor,
          sparkpostMetrics: json.sparkpostMetrics,
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
    if (campaign) {
      if (campaign.status === 'staged') {
        setCurrentStep('review')
        loadStagedEmails()
      } else if (['scheduled', 'sending', 'completed'].includes(campaign.status as string)) {
        setCurrentStep('complete')
      } else {
        setCurrentStep('design')
      }
    }
  }, [campaign?.status])

  useEffect(() => {
    if (currentStep === 'complete') {
      loadSummary()
      loadFailedEmails()
    }
  }, [currentStep, loadSummary, loadFailedEmails])

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

  // Generate all emails with specified format
  const handleGenerateAllWithFormat = useCallback(async (format: EmailFormat) => {
    if (!campaign || !csvFile) return

    try {
      setGenerating(true)
      setError(null)
      setGenerateProgress(null)

      // Save the format to the campaign first
      await updateCampaign(campaign.id || campaignId, { emailFormat: format })

      // Generate emails with the CSV and track progress
      const result = await generateEmails(
        campaign.id || campaignId,
        csvFile,
        (progress) => setGenerateProgress(progress)
      )

      // Reload campaign and staged emails
      await loadCampaign()
      await loadStagedEmails()

      // Show validation errors modal if there are any
      if (result.errors && result.errors.length > 0) {
        setValidationErrors(result.errors)
      }

      // Move to review step
      setCurrentStep('review')
    } catch (err: any) {
      setError('Failed to generate emails: ' + err.message)
    } finally {
      setGenerating(false)
      setGenerateProgress(null)
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
      await sendTestEmail(campaign.id || campaignId, testEmail, testRecipientEmailId || undefined)
      setTestEmail('')
      setTestRecipientEmailId(null)
      alert('Test email sent successfully!')
    } catch (err: any) {
      setError('Failed to send test email: ' + err.message)
    } finally {
      setSendingTest(false)
    }
  }

  // Set default test recipient when staged emails load
  useEffect(() => {
    if (stagedEmails.length > 0 && !testRecipientEmailId) {
      setTestRecipientEmailId(stagedEmails[0].id)
      setTestEmail(stagedEmails[0].toEmail)
    }
  }, [stagedEmails, testRecipientEmailId])

  const handleRetryFailed = useCallback(async () => {
    if (!campaign) return

    try {
      setRetryingFailed(true)
      setError(null)
      setInfo(null)
      const res = await fetch(`/api/campaigns/${campaign.id || campaignId}/retry-failed`, {
        method: 'POST',
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to retry failed emails')
      }
      setInfo(`Retried ${data?.retried ?? 0} failed emails.`)
      await loadSummary()
      await loadFailedEmails()
      await loadCampaign()
    } catch (err: any) {
      setError(err.message || 'Failed to retry failed emails')
    } finally {
      setRetryingFailed(false)
    }
  }, [campaign, campaignId, loadSummary, loadFailedEmails])

  // Regenerate single email
  const handleRegenerateEmail = async (emailId: string) => {
    if (!campaign) return

    try {
      setRegeneratingEmailId(emailId)
      setError(null)
      const result = await regenerateEmail(campaign.id || campaignId, emailId)

      // Update the email in the local state
      setStagedEmails(prev => prev.map(e =>
        e.id === emailId
          ? { ...e, subject: result.email.subject, body: result.email.body, isEdited: result.email.isEdited }
          : e
      ))
    } catch (err: any) {
      setError('Failed to regenerate email: ' + err.message)
    } finally {
      setRegeneratingEmailId(null)
    }
  }

  // Auto-regenerate if body is empty whn expanded
  useEffect(() => {
    if (expandedEmailId) {
      const email = stagedEmails.find(e => e.id === expandedEmailId)
      if (email && !email.body && !regeneratingEmailId) {
        handleRegenerateEmail(email.id)
      }
    }
  }, [expandedEmailId, stagedEmails, regeneratingEmailId])

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
          </div>
        </div>
      </div>

      {/* Stepper */}
      <CampaignStepper 
        currentStep={currentStep} 
        recipientCount={stagedCount} 
        onBack={currentStep === 'review' ? handleBackToDesign : undefined}
        onLaunch={currentStep === 'review' ? () => setShowLaunchModal(true) : undefined}
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
            onGenerateAll={handleGenerateAllWithFormat}
            isGeneratingAll={generating}
            generateProgress={generateProgress}
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
                          const selectedEmail = stagedEmails.find(e => e.id === selectedId)
                          if (selectedEmail) {
                            setTestEmail(selectedEmail.toEmail)
                          }
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
                      {getStatusLabel(campaign.status)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {campaign.totalRecipients} recipients • {campaign.name}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase text-gray-500 mb-1">Sent</p>
                  <p className="text-xl font-semibold text-gray-900">
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
                  <p className="text-xs uppercase text-gray-500 mb-1">Total</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {campaignSummary ? campaignSummary.total.toLocaleString() : '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">All statuses</p>
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
