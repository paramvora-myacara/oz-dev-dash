'use client'

import { useState, useEffect, useMemo } from 'react'
import { Users, Check, X, Loader2, ChevronDown, ChevronRight, EyeOff, AlertTriangle, Search, Filter, Mail } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { searchContactsForCampaign, getAllContactIds, type Contact, type ContactFilters } from '@/lib/api/contacts'
import { getEmails, isMultipleEmails } from '@/lib/api/contacts/utils'
import { getCampaigns } from '@/lib/api/campaigns-backend'
import { type Campaign } from '@/types/email-editor'
import { isValidEmail } from '@/lib/utils/validation'

interface ContactSelectionStepProps {
  campaignId: string
  onContinue: (selectedContactIds: string[]) => void
  onBack: () => void
}

const API_BASE = '/api/backend-proxy/campaigns'

export default function ContactSelectionStep({ campaignId, onContinue, onBack }: ContactSelectionStepProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectAllGlobal, setIsSelectAllGlobal] = useState(false)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())
  const [selectedEmails, setSelectedEmails] = useState<Record<string, string>>({})
  const [emailSelectionQueue, setEmailSelectionQueue] = useState<Contact[]>([])
  const [activeResolutionContactId, setActiveResolutionContactId] = useState<string | null>(null)
  const [skippedResolutionIds, setSkippedResolutionIds] = useState<Set<string>>(new Set())
  const [totalCount, setTotalCount] = useState(0)
  const [advancedFilters, setAdvancedFilters] = useState<{
    locationFilter: string;
    source: string;
    contactTypes: string[];
    history: string;
    emailStatus: string;
    leadStatus: 'warm' | 'cold' | 'all';
    tags: string[];
    websiteEventTypes: string[];
    websiteOperator: 'any' | 'all';
    campaignResponse?: { campaignId: string, response: 'replied' | 'no_reply' | 'bounced' | 'all' };
  }>({
    locationFilter: '',
    source: 'all',
    contactTypes: [],
    history: 'all',
    emailStatus: 'all',
    leadStatus: 'all',
    tags: [],
    websiteEventTypes: [],
    websiteOperator: 'any'
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedContactIds, setExpandedContactIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [showFilters, setShowFilters] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignData = await getCampaigns()
        setCampaigns(campaignData)
      } catch (error) {
        console.error('Failed to fetch campaigns:', error)
      }
    }
    fetchCampaigns()
  }, [])

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true)
      try {
        let campaignHistoryFilter: ContactFilters['campaignHistory'] = undefined
        if (advancedFilters.history !== 'all') {
          const isCampaignId = campaigns.some(campaign => campaign.id === advancedFilters.history)
          if (isCampaignId) {
            campaignHistoryFilter = advancedFilters.history
          } else {
            campaignHistoryFilter = advancedFilters.history as 'none' | 'any'
          }
        }

        const filters: ContactFilters = {
          location: advancedFilters.locationFilter,
          source: advancedFilters.source === 'all' ? undefined : advancedFilters.source,
          contactType: advancedFilters.contactTypes.length > 0 ? advancedFilters.contactTypes : undefined,
          campaignHistory: campaignHistoryFilter,
          emailStatus: advancedFilters.emailStatus === 'all' ? undefined : advancedFilters.emailStatus,
          leadStatus: advancedFilters.leadStatus === 'all' ? undefined : advancedFilters.leadStatus,
          tags: advancedFilters.tags.length > 0 ? advancedFilters.tags : undefined,
          websiteEvents: advancedFilters.websiteEventTypes.length > 0 ? { eventTypes: advancedFilters.websiteEventTypes, operator: advancedFilters.websiteOperator } : undefined,
          campaignResponse: (advancedFilters.campaignResponse && advancedFilters.campaignResponse.response !== 'all')
            ? { ...advancedFilters.campaignResponse, response: advancedFilters.campaignResponse.response as any }
            : undefined
        }

        const { data, count } = await searchContactsForCampaign(filters, page, pageSize)
        setContacts(data || [])
        setTotalCount(count || 0)
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchContacts, 300)
    return () => clearTimeout(timer)
  }, [advancedFilters, page, pageSize, campaigns])

  useEffect(() => {
    setPage(0)
    setIsSelectAllGlobal(false)
    setExcludedIds(new Set())
  }, [advancedFilters, pageSize])

  const handleSelectAll = () => {
    if (isSelectAllGlobal) {
      setIsSelectAllGlobal(false)
      setExcludedIds(new Set())
      setSelectedIds(new Set())
      setEmailSelectionQueue([])
      setSkippedResolutionIds(new Set())
    } else {
      const allPageIds = contacts.map(c => c.id)
      const isPageSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.has(id))

      if (isPageSelected) {
        const newSelected = new Set(selectedIds)
        allPageIds.forEach(id => newSelected.delete(id))
        setSelectedIds(newSelected)
      } else {
        const newSelected = new Set(selectedIds)
        allPageIds.forEach(id => newSelected.add(id))
        setSelectedIds(newSelected)

        const ambiguousContacts = contacts.filter(c => isMultipleEmails(c.email))
        if (ambiguousContacts.length > 0) {
          setEmailSelectionQueue(prev => {
            const existingIds = new Set(prev.map(c => c.id))
            const newContacts = ambiguousContacts.filter(c => !existingIds.has(c.id))
            return [...prev, ...newContacts]
          })
          if (!activeResolutionContactId) {
            setActiveResolutionContactId(ambiguousContacts[0].id)
          }
        }
      }
    }
  }

  const handleSelectContact = (contact: Contact) => {
    const contactId = contact.id
    if (isSelectAllGlobal) {
      const newExcluded = new Set(excludedIds)
      if (newExcluded.has(contactId)) newExcluded.delete(contactId)
      else newExcluded.add(contactId)
      setExcludedIds(newExcluded)
      return
    }

    const newSelected = new Set(selectedIds)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
      const newSelectedEmails = { ...selectedEmails }
      delete newSelectedEmails[contactId]
      setSelectedEmails(newSelectedEmails)
      setSelectedIds(newSelected)
      return
    }

    if (isMultipleEmails(contact.email)) {
      if (!emailSelectionQueue.find(c => c.id === contact.id)) {
        setEmailSelectionQueue(prev => [...prev, contact])
        if (!activeResolutionContactId) setActiveResolutionContactId(contact.id)
      }
    } else {
      newSelected.add(contactId)
      setSelectedIds(newSelected)
    }
  }

  const handleSelectAllGlobal = () => {
    setIsSelectAllGlobal(true)
    setExcludedIds(new Set())
    setSkippedResolutionIds(new Set())
    setSelectedIds(new Set(contacts.map(c => c.id)))
    const ambiguousContacts = contacts.filter(c => isMultipleEmails(c.email))
    if (ambiguousContacts.length > 0) {
      setEmailSelectionQueue(prev => {
        const existingIds = new Set(prev.map(c => c.id))
        const newContacts = ambiguousContacts.filter(c => !existingIds.has(c.id))
        return [...prev, ...newContacts]
      })
      if (!activeResolutionContactId) setActiveResolutionContactId(ambiguousContacts[0].id)
    }
  }

  const handleEmailSelectionConfirm = (contactId: string, email: string) => {
    if (skippedResolutionIds.has(contactId)) {
      setSkippedResolutionIds(prev => {
        const next = new Set(prev)
        next.delete(contactId)
        return next
      })
      if (isSelectAllGlobal) setExcludedIds(prev => {
        const next = new Set(prev)
        next.delete(contactId)
        return next
      })
      else setSelectedIds(prev => new Set(prev).add(contactId))
    } else {
      setSelectedIds(prev => new Set(prev).add(contactId))
    }
    setSelectedEmails(prev => ({ ...prev, [contactId]: email }))
    const currentIndex = emailSelectionQueue.findIndex(c => c.id === contactId)
    if (currentIndex < emailSelectionQueue.length - 1) setActiveResolutionContactId(emailSelectionQueue[currentIndex + 1].id)
  }

  const handleSkippedSelection = (contactId: string) => {
    setSkippedResolutionIds(prev => new Set(prev).add(contactId))
    if (isSelectAllGlobal) setExcludedIds(prev => new Set(prev).add(contactId))
    else setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(contactId)
      return next
    })
    setSelectedEmails(prev => {
      const next = { ...prev }
      delete next[contactId]
      return next
    })
    const currentIndex = emailSelectionQueue.findIndex(c => c.id === contactId)
    if (currentIndex < emailSelectionQueue.length - 1) setActiveResolutionContactId(emailSelectionQueue[currentIndex + 1].id)
  }

  const closeResolutionModal = () => {
    const unresolved = emailSelectionQueue.filter(contact => !selectedEmails[contact.id] && !skippedResolutionIds.has(contact.id))
    if (unresolved.length > 0) {
      if (isSelectAllGlobal) setExcludedIds(prev => {
        const next = new Set(prev); unresolved.forEach(c => next.add(c.id)); return next
      })
      else setSelectedIds(prev => {
        const next = new Set(prev); unresolved.forEach(c => next.delete(c.id)); return next
      })
    }
    setEmailSelectionQueue([])
    setActiveResolutionContactId(null)
    setSkippedResolutionIds(new Set())
  }

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      let payload: any;
      if (isSelectAllGlobal) {
        let campaignHistoryFilter: ContactFilters['campaignHistory'] = undefined
        if (advancedFilters.history !== 'all') {
          const isCampaignId = campaigns.some(campaign => campaign.id === advancedFilters.history)
          if (isCampaignId) campaignHistoryFilter = advancedFilters.history
          else campaignHistoryFilter = advancedFilters.history as 'none' | 'any'
        }
        payload = {
          selectAllMatching: true,
          filters: {
            location: advancedFilters.locationFilter,
            campaignHistory: campaignHistoryFilter,
            emailStatus: advancedFilters.emailStatus === 'all' ? undefined : advancedFilters.emailStatus,
            leadStatus: advancedFilters.leadStatus === 'all' ? undefined : advancedFilters.leadStatus,
            tags: advancedFilters.tags.length > 0 ? advancedFilters.tags : undefined,
            contactType: advancedFilters.contactTypes.length > 0 ? advancedFilters.contactTypes : undefined,
            websiteEvents: advancedFilters.websiteEventTypes.length > 0 ? { eventTypes: advancedFilters.websiteEventTypes, operator: advancedFilters.websiteOperator } : undefined,
            campaignResponse: advancedFilters.campaignResponse
          },
          exclusions: Array.from(excludedIds),
          explicitSelections: selectedEmails
        }
      } else {
        payload = { contact_ids: Array.from(selectedIds), explicitSelections: selectedEmails }
      }
      const res = await fetch(`${API_BASE}/${campaignId}/recipients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text())
      onContinue(Array.from(selectedIds))
    } catch (err) {
      console.error('Failed to save recipients:', err)
      alert('Failed to save recipients. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setAdvancedFilters({
      locationFilter: '',
      source: 'all',
      contactTypes: [],
      history: 'all',
      emailStatus: 'all',
      leadStatus: 'all',
      tags: [],
      websiteEventTypes: [],
      websiteOperator: 'any'
    })
    setIsSelectAllGlobal(false)
  }

  const selectedCount = isSelectAllGlobal ? totalCount - excludedIds.size : selectedIds.size

  const toggleTag = (tagName: string) => {
    setAdvancedFilters(prev => {
      const next = prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName];
      return { ...prev, tags: next };
    });
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Select Recipients</h1>
          <p className="text-sm text-gray-500 mt-1">Choose contacts from your database to include in this campaign</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <Filter className="w-6 h-6 text-blue-600" />
              Advanced Filters
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="State, City, or Code..."
                    value={advancedFilters.locationFilter}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, locationFilter: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Types</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  {['developer', 'investor', 'fund', 'broker'].map(type => (
                    <label key={type} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white cursor-pointer text-sm font-medium transition-colors">
                      <input
                        type="checkbox"
                        checked={advancedFilters.contactTypes.includes(type)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...advancedFilters.contactTypes, type]
                            : advancedFilters.contactTypes.filter(t => t !== type);
                          setAdvancedFilters(prev => ({ ...prev, contactTypes: next }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{type}s</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Website Activity</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  {[
                    { id: 'tax_calculator_used', label: 'Used Tax Calculator' },
                    { id: 'investor_qualification_submitted', label: 'Qualified Investor' },
                    { id: 'oz_check_completed', label: 'OZ Check' },
                    { id: 'viewed_listings', label: 'Viewed Listings' },
                    { id: 'community_interest_expressed', label: 'Expressed Interest' }
                  ].map(event => (
                    <label key={event.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white cursor-pointer text-sm font-medium transition-colors">
                      <input
                        type="checkbox"
                        checked={advancedFilters.websiteEventTypes.includes(event.id)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...advancedFilters.websiteEventTypes, event.id]
                            : advancedFilters.websiteEventTypes.filter(id => id !== event.id);
                          setAdvancedFilters(prev => ({ ...prev, websiteEventTypes: next }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags / Specialization</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  {[
                    { id: 'family-office', label: 'Family Office' },
                    { id: 'multi-family-office', label: 'Multi-Family Office' }
                  ].map(tag => (
                    <label key={tag.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white cursor-pointer text-sm font-medium transition-colors">
                      <input
                        type="checkbox"
                        checked={advancedFilters.tags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{tag.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Response</label>
                <div className="flex gap-2">
                  <select
                    value={advancedFilters.campaignResponse?.response || 'all'}
                    onChange={(e) => {
                      const val = e.target.value as any
                      setAdvancedFilters(prev => ({
                        ...prev,
                        campaignResponse: val === 'all' ? undefined : { campaignId: prev.campaignResponse?.campaignId || '', response: val }
                      }))
                    }}
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="all">Any Status</option>
                    <option value="replied">Replied</option>
                    <option value="no_reply">No Reply</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </div>
                <select
                  disabled={!advancedFilters.campaignResponse || advancedFilters.campaignResponse.response === 'all'}
                  value={advancedFilters.campaignResponse?.campaignId || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setAdvancedFilters(prev => ({
                      ...prev,
                      campaignResponse: prev.campaignResponse ? { ...prev.campaignResponse, campaignId: val } : undefined
                    }))
                  }}
                  className="w-full mt-2 px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50"
                >
                  <option value="">Campaign...</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Status</label>
                  <select
                    value={advancedFilters.emailStatus}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, emailStatus: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="all">All Status</option>
                    <option value="Valid">Verified</option>
                    <option value="Catch-all">Catch-all</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Status</label>
                  <select
                    value={advancedFilters.leadStatus}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, leadStatus: e.target.value as any }))}
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="all">Any Status</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Outreach History</label>
                <select
                  value={advancedFilters.history}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, history: e.target.value }))}
                  className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="all">All Outreach Status</option>
                  <option value="none">Never Contacted</option>
                  <option value="any">Previously Contacted</option>
                  {campaigns.filter(c => c.id !== campaignId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button onClick={clearFilters} className="w-full px-6 py-3 text-sm font-bold text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all uppercase tracking-widest active:scale-[0.98]">
                Reset All Filters
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between z-10">
          <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={contacts.length > 0 && (isSelectAllGlobal ? contacts.every(c => !excludedIds.has(c.id)) : contacts.every(c => selectedIds.has(c.id)))}
              readOnly
              className="rounded border-gray-300 text-blue-600"
            />
            Select Page ({contacts.length})
          </button>
          <div className="text-sm text-gray-500">{selectedCount} total selected</div>
        </div>

        {!isSelectAllGlobal && contacts.length > 0 && contacts.every(c => selectedIds.has(c.id)) && totalCount > contacts.length && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 text-sm text-blue-700 text-center">
            All {contacts.length} on this page selected. <button onClick={handleSelectAllGlobal} className="font-bold underline">Select all {totalCount}</button>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-white">
          <div className="divide-y divide-gray-200">
            {contacts.map((contact) => {
              const isSelected = isSelectAllGlobal ? !excludedIds.has(contact.id) : selectedIds.has(contact.id)
              const isExpanded = expandedContactIds.has(contact.id)
              return (
                <div key={contact.id}>
                  <div className={`px-4 sm:px-6 py-4 hover:bg-gray-50 flex items-start gap-3 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectContact(contact)}
                      className="mt-1 rounded border-gray-300 text-blue-600"
                    />
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="md:col-span-1">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{contact.name || 'Unknown'}</h3>
                        <p className="text-xs text-gray-500 truncate font-medium">{selectedEmails[contact.id] || contact.email}</p>
                        {isMultipleEmails(contact.email) && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 rounded-full font-bold uppercase tracking-tight">Multi-Email</span>}
                      </div>

                      <div className="md:col-span-1">
                        <p className="text-sm text-gray-700 truncate font-medium">{contact.company}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.contact_types ? contact.contact_types.map(t => (
                            <span key={t} className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${t === 'developer' ? 'bg-blue-100 text-blue-700 border border-blue-200' : t === 'investor' ? 'bg-green-100 text-green-700 border border-green-200' :
                              t === 'fund' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}>{t}</span>
                          )) : <span className="text-[10px] text-gray-500 uppercase font-black">{contact.contact_type}</span>}
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        {contact.history && contact.history.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {contact.history.slice(0, 2).map((h: any, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 truncate max-w-[120px] font-bold">
                                {h.campaigns?.name}
                              </span>
                            ))}
                            {contact.history.length > 2 && <span className="text-[10px] text-gray-400 font-bold">+{contact.history.length - 2}</span>}
                          </div>
                        ) : <span className="text-xs text-gray-400 italic">No history</span>}
                      </div>

                      <div className="md:col-span-1 flex items-center justify-end gap-2">
                        <span className="text-[11px] font-bold text-gray-500 truncate max-w-[120px] uppercase tracking-wide">{contact.location}</span>
                        <button
                          className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all"
                          onClick={() => setExpandedContactIds(prev => {
                            const next = new Set(prev); if (next.has(contact.id)) next.delete(contact.id); else next.add(contact.id); return next
                          })}
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="bg-gray-50 px-12 py-6 border-t border-b text-xs shadow-inner">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-bold text-gray-400 uppercase tracking-widest mb-3">Profile Data</h4>
                          <pre className="overflow-auto max-h-60 bg-white p-4 rounded-xl border border-gray-100 font-mono text-[10px]">{JSON.stringify(contact.details, null, 2)}</pre>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-400 uppercase tracking-widest mb-3">Communication Logs</h4>
                          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-center h-40">
                            <p className="text-gray-400 italic">Activity log coming soon...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border-t px-4 sm:px-6 py-3 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Results {Math.min(page * pageSize + 1, totalCount)} – {Math.min((page + 1) * pageSize, totalCount)} / {totalCount}</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronRight className="rotate-180 w-4 h-4 text-gray-600" /></button>
            <span className="text-xs font-semibold text-gray-900">PAGE {page + 1}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * pageSize >= totalCount} className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
          </div>
        </div>
      </div>

      {(selectedIds.size > 0 || isSelectAllGlobal) && (
        <div className="bg-white border-t px-4 sm:px-6 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <div>
            <p className="text-base font-bold text-gray-900">{selectedCount} RECIPIENTS SELECTED</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSelectedIds(new Set()); setIsSelectAllGlobal(false); setExcludedIds(new Set()) }} className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 border border-gray-100 rounded-lg transition-all">UNSELECT ALL</button>
            <button onClick={handleContinue} disabled={isLoading} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md flex items-center gap-2 transition-all transform active:scale-95 disabled:grayscale">
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'CONTINUE TO SEQUENCE'}
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {emailSelectionQueue.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-xl text-gray-900 tracking-tight flex items-center gap-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                  RESOLVE MULTIPLE EMAILS
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{emailSelectionQueue.length} Contacts require selection</p>
              </div>
              <button
                onClick={closeResolutionModal}
                className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-100"
              ><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 bg-gray-50/50 border-r overflow-y-auto overflow-x-hidden">
                {emailSelectionQueue.map(c => (
                  <button key={c.id} onClick={() => setActiveResolutionContactId(c.id)} className={`w-full text-left p-6 border-b border-gray-100 transition-all relative ${activeResolutionContactId === c.id ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}>
                    {activeResolutionContactId === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-sm" />}
                    <p className={`font-bold truncate ${activeResolutionContactId === c.id ? 'text-blue-600' : 'text-gray-900'}`}>{c.name}</p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">{selectedEmails[c.id] || 'WAITING FOR SELECTION'}</p>
                  </button>
                ))}
              </div>
              <div className="flex-1 p-16 flex flex-col items-center justify-center bg-white">
                {activeResolutionContactId ? (() => {
                  const c = emailSelectionQueue.find(x => x.id === activeResolutionContactId)!
                  return (
                    <div className="w-full max-w-sm animate-in slide-in-from-right-4 duration-300">
                      <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 font-black text-2xl">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <h4 className="font-black text-2xl text-gray-900 tracking-tight">{c.name}</h4>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Select Primary Outreach Address</p>
                      </div>
                      <div className="space-y-3">
                        {getEmails(c.email).map(e => (
                          <button key={e} onClick={() => handleEmailSelectionConfirm(c.id, e)} className={`w-full p-5 border border-gray-200 rounded-lg text-left transition-all flex items-center justify-between group ${selectedEmails[c.id] === e ? 'border-blue-600 bg-blue-50' : 'hover:border-blue-200 hover:bg-blue-50/30'}`}>
                            <span className={`font-bold ${selectedEmails[c.id] === e ? 'text-blue-700' : 'text-gray-600'}`}>{e}</span>
                            <Check className={`w-5 h-5 ${selectedEmails[c.id] === e ? 'text-blue-600 scale-110' : 'text-transparent group-hover:text-blue-200'} transition-all`} />
                          </button>
                        ))}
                      </div>
                      <button onClick={() => handleSkippedSelection(c.id)} className="mt-8 w-full text-center text-red-500 text-xs font-semibold uppercase tracking-widest hover:text-red-700 transition-colors">REMOVE FROM CAMPAIGN</button>
                    </div>
                  )
                })() : <p className="text-gray-400 font-bold uppercase tracking-widest">Select a contact to resolve</p>}
              </div>
            </div>
            <div className="px-8 py-6 border-t flex justify-end bg-gray-50/50">
              <button onClick={closeResolutionModal} className="bg-gray-900 text-white px-10 py-3 rounded-lg font-bold text-sm tracking-tight hover:bg-black transition-all">DONE RESOLVING</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
