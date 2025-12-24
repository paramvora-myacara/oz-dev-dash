'use client'

import { useState, useEffect, useMemo } from 'react'

import { Users, Check, X, Loader2, ChevronDown } from 'lucide-react'

import { searchContacts, getAllContactIds, type Contact, type ContactFilters } from '@/lib/api/contacts'
import { getCampaigns } from '@/lib/api/campaigns-backend'
import { type Campaign } from '@/types/email-editor'
import { isValidEmail } from '@/lib/utils/validation'

// Helper to detect multiple emails
const getEmails = (emailStr: string) => {
  return emailStr.split(',').map(e => e.trim()).filter(Boolean);
}

const isMultipleEmails = (emailStr: string) => {
  return getEmails(emailStr).length > 1;
}

const API_BASE = '/api/campaigns'

// State mapping for smart location filtering
const STATE_MAPPING: Record<string, string> = {
  // State codes to names
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia'
}

// Create reverse mapping (state names to codes)
const STATE_NAME_TO_CODE = Object.entries(STATE_MAPPING).reduce((acc, [code, name]) => {
  acc[name.toLowerCase()] = code
  acc[code.toLowerCase()] = code // Also map code to itself for consistency
  return acc
}, {} as Record<string, string>)

const getLocationSearchTerms = (input: string): string[] => {
  // Simple pass-through since backend handles fuzzy matching now
  return [input]
}

// Removed Mock Contacts


interface ContactSelectionStepProps {
  campaignId: string
  onContinue: (selectedContactIds: string[]) => void
  onBack: () => void
}

export default function ContactSelectionStep({ campaignId, onContinue, onBack }: ContactSelectionStepProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [isSelectAllGlobal, setIsSelectAllGlobal] = useState(false)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())
  // Track specifically chosen email for contacts with multiple options
  const [selectedEmails, setSelectedEmails] = useState<Record<string, string>>({})

  // Modal state
  // Modal state
  const [emailSelectionQueue, setEmailSelectionQueue] = useState<Contact[]>([])
  const [activeResolutionContactId, setActiveResolutionContactId] = useState<string | null>(null)
  const [skippedResolutionIds, setSkippedResolutionIds] = useState<Set<string>>(new Set())

  const [totalCount, setTotalCount] = useState(0)
  const [advancedFilters, setAdvancedFilters] = useState({
    locationFilter: '',
    source: '',
    history: 'all' // 'all', 'none', 'any', or campaign UUID
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)

  // Fetch campaigns for filter options
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

  // Fetch contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true)
      try {
        let campaignHistoryFilter: ContactFilters['campaignHistory'] = undefined
        if (advancedFilters.history !== 'all') {
          // Check if the selected value is a campaign UUID (not 'none' or 'any')
          const isCampaignId = campaigns.some(campaign => campaign.id === advancedFilters.history)
          if (isCampaignId) {
            campaignHistoryFilter = advancedFilters.history
          } else {
            campaignHistoryFilter = advancedFilters.history as 'none' | 'any'
          }
        }

        const filters: ContactFilters = {
          location: advancedFilters.locationFilter,
          campaignHistory: campaignHistoryFilter
        }

        const { data, count } = await searchContacts(filters, page, pageSize)
        setContacts(data || [])
        setTotalCount(count || 0)
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(fetchContacts, 300)
    return () => clearTimeout(timer)
  }, [advancedFilters, page, pageSize])

  // Reset page when filters or page size change
  useEffect(() => {
    setPage(0)
    // Clear selection when filters change (optional, but safer to avoid stale selections)
    // For now keeping selection as user might want to select-search-select
    setIsSelectAllGlobal(false)
    setExcludedIds(new Set())
    setSelectedIds(new Set())
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
        // Deselect all on this page, keep others
        const newSelected = new Set(selectedIds)
        allPageIds.forEach(id => newSelected.delete(id))
        setSelectedIds(newSelected)
      } else {
        // Select all on this page, keep others
        const newSelected = new Set(selectedIds)
        allPageIds.forEach(id => newSelected.add(id))
        setSelectedIds(newSelected)

        // Check for ambiguous contacts on this page and add to queue
        const ambiguousContacts = contacts.filter(c => isMultipleEmails(c.email))
        if (ambiguousContacts.length > 0) {
          setEmailSelectionQueue(prev => {
            const existingIds = new Set(prev.map(c => c.id))
            const newContacts = ambiguousContacts.filter(c => !existingIds.has(c.id))
            return [...prev, ...newContacts]
          })
          if (!activeResolutionContactId && ambiguousContacts.length > 0) {
            setActiveResolutionContactId(ambiguousContacts[0].id)
          }
        }
      }
    }
  }

  const handleSelectContact = (contact: Contact) => {
    const contactId = contact.id

    // Global Mode Logic
    if (isSelectAllGlobal) {
      const newExcluded = new Set(excludedIds)
      if (newExcluded.has(contactId)) {
        newExcluded.delete(contactId)
      } else {
        newExcluded.add(contactId)
      }
      setExcludedIds(newExcluded)
      return
    }

    const newSelected = new Set(selectedIds)

    // If unselecting, just remove
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
      // Cleanup specific email choice if any
      const newSelectedEmails = { ...selectedEmails }
      delete newSelectedEmails[contactId]
      setSelectedEmails(newSelectedEmails)
      setSelectedIds(newSelected)
      return
    }

    // If selecting
    if (isMultipleEmails(contact.email)) {
      // Add to queue if not present
      if (!emailSelectionQueue.find(c => c.id === contact.id)) {
        setEmailSelectionQueue(prev => [...prev, contact])
        if (!activeResolutionContactId) {
          setActiveResolutionContactId(contact.id)
        }
      }
    } else {
      // Single email, just select
      newSelected.add(contactId)
      setSelectedIds(newSelected)
    }
  }

  // Global Select All Handler
  const handleSelectAllGlobal = async () => {
    setIsSelectAllGlobal(true)
    setExcludedIds(new Set())
    setSkippedResolutionIds(new Set())

    // Visually select all info on current page for consistency
    const allOnPage = new Set(contacts.map(c => c.id))
    setSelectedIds(allOnPage)

    // Check for ambiguous contacts on the current page to resolve
    const ambiguousContacts = contacts.filter(c => isMultipleEmails(c.email))
    if (ambiguousContacts.length > 0) {
      setEmailSelectionQueue(prev => {
        const existingIds = new Set(prev.map(c => c.id))
        const newContacts = ambiguousContacts.filter(c => !existingIds.has(c.id))
        return [...prev, ...newContacts]
      })
      if (!activeResolutionContactId && ambiguousContacts.length > 0) {
        setActiveResolutionContactId(ambiguousContacts[0].id)
      }
    }
  }

  const handleEmailSelectionConfirm = (contactId: string, email: string) => {
    // If it was skipped, unskip it
    if (skippedResolutionIds.has(contactId)) {
      const newSkipped = new Set(skippedResolutionIds)
      newSkipped.delete(contactId)
      setSkippedResolutionIds(newSkipped)

      // Re-enable in global/local selection
      if (isSelectAllGlobal) {
        const newExcluded = new Set(excludedIds)
        newExcluded.delete(contactId)
        setExcludedIds(newExcluded)
      } else {
        const newSelected = new Set(selectedIds)
        newSelected.add(contactId)
        setSelectedIds(newSelected)
      }
    } else {
      // Standard selection logic
      const newSelected = new Set(selectedIds)
      newSelected.add(contactId)
      setSelectedIds(newSelected)
    }


    setSelectedEmails(prev => ({
      ...prev,
      [contactId]: email
    }))

    // Auto-advance
    const currentIndex = emailSelectionQueue.findIndex(c => c.id === contactId)
    if (currentIndex < emailSelectionQueue.length - 1) {
      setActiveResolutionContactId(emailSelectionQueue[currentIndex + 1].id)
    }
  }

  const handleSkippedSelection = (contactId: string) => {
    // Mark as skipped visual
    const newSkipped = new Set(skippedResolutionIds)
    newSkipped.add(contactId)
    setSkippedResolutionIds(newSkipped)

    // Remove from selection / Add to exclusion
    if (isSelectAllGlobal) {
      const newExcluded = new Set(excludedIds)
      newExcluded.add(contactId)
      setExcludedIds(newExcluded)
    } else {
      const newSelected = new Set(selectedIds)
      newSelected.delete(contactId)
      setSelectedIds(newSelected)
    }

    // Cleanup specific email choice if any
    const newSelectedEmails = { ...selectedEmails }
    delete newSelectedEmails[contactId]
    setSelectedEmails(newSelectedEmails)

    // Auto-advance
    const currentIndex = emailSelectionQueue.findIndex(c => c.id === contactId)
    if (currentIndex < emailSelectionQueue.length - 1) {
      setActiveResolutionContactId(emailSelectionQueue[currentIndex + 1].id)
    }
  }

  const closeResolutionModal = () => {
    // Auto-deselect unresolved contacts
    const unresolvedContacts = emailSelectionQueue.filter(contact =>
      !selectedEmails[contact.id] && !skippedResolutionIds.has(contact.id)
    )

    if (unresolvedContacts.length > 0) {
      if (isSelectAllGlobal) {
        const newExcluded = new Set(excludedIds)
        unresolvedContacts.forEach(c => newExcluded.add(c.id))
        setExcludedIds(newExcluded)
      } else {
        const newSelected = new Set(selectedIds)
        unresolvedContacts.forEach(c => newSelected.delete(c.id))
        setSelectedIds(newSelected)
      }
    }

    setEmailSelectionQueue([])
    setActiveResolutionContactId(null)
    setSkippedResolutionIds(new Set())
  }

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      // Build payload
      let payload: any;

      if (isSelectAllGlobal) {
        let campaignHistoryFilter: ContactFilters['campaignHistory'] = undefined
        if (advancedFilters.history !== 'all') {
          // Check if the selected value is a campaign UUID (not 'none' or 'any')
          const isCampaignId = campaigns.some(campaign => campaign.id === advancedFilters.history)
          if (isCampaignId) {
            campaignHistoryFilter = advancedFilters.history
          } else {
            campaignHistoryFilter = advancedFilters.history as 'none' | 'any'
          }
        }

        const filters: ContactFilters = {
          location: advancedFilters.locationFilter,
          campaignHistory: campaignHistoryFilter
        }

        payload = {
          selectAllMatching: true,
          filters,
          exclusions: Array.from(excludedIds),
          explicitSelections: selectedEmails // Still need these for email overrides if any
        }
      } else {
        const selections = Array.from(selectedIds).map(id => ({
          contact_id: id,
          selected_email: selectedEmails[id] // might be undefined if single
        }))
        payload = { selections }
      }

      // Save to backend
      const res = await fetch(`${API_BASE}/${campaignId}/recipients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      // Navigate
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
      source: '',
      history: 'all'
    })
    setIsSelectAllGlobal(false)
  }

  const selectedContacts = contacts.filter(c =>
    (isSelectAllGlobal && !excludedIds.has(c.id)) ||
    (!isSelectAllGlobal && selectedIds.has(c.id))
  )
  const previouslyContactedCount = selectedContacts.filter(c => c.history && c.history.length > 0).length



  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Select Recipients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose contacts from your database to include in this campaign
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Contains
            </label>
            <input
              type="text"
              placeholder="e.g. California, CA, New York..."
              value={advancedFilters.locationFilter}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, locationFilter: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>



          {/* History Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact History
            </label>
            <select
              value={advancedFilters.history}
              onChange={(e) => setAdvancedFilters(prev => ({
                ...prev,
                history: e.target.value
              }))}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Show All</option>
              <option value="none">Never Contacted</option>
              <option value="any">Previously Contacted</option>
              {campaigns
                .filter((campaign) => campaign.id !== campaignId)
                .map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="bg-white border-t px-4 py-3 flex items-center justify-between sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * pageSize >= totalCount}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min(page * pageSize + 1, totalCount)}</span> to <span className="font-medium">{Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="block w-24 pl-3 pr-8 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={1000}>1000</option>
              </select>
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * pageSize >= totalCount}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Scrollable List Container (adjusted to not conflict with flex layout) */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col"> {/* Changed to flex-col to stack list and pagination if needed inside, but pagination is outside now */}
          {/* Main List Area */}
          {/* Contact List */}
          <div className="flex-1 overflow-auto bg-white">
            {/* Selection Header */}
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={
                      isSelectAllGlobal
                        ? (contacts.every(c => !excludedIds.has(c.id)))
                        : (contacts.length > 0 && contacts.every(c => selectedIds.has(c.id)))
                    }
                    readOnly
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Select All ({contacts.length})
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {isSelectAllGlobal
                  ? `${totalCount - excludedIds.size} selected`
                  : `${selectedIds.size} selected`
                }
              </div>
            </div>

            {/* Contact Items */}

            {/* "Select All" Banner */}
            {!isSelectAllGlobal && contacts.length > 0 && contacts.every(c => selectedIds.has(c.id)) && totalCount > contacts.length && (
              <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 text-sm text-blue-700 text-center">
                <span className="font-medium">All {contacts.length} contacts on this page are selected.</span>
                {' '}
                <button
                  onClick={handleSelectAllGlobal}
                  className="font-bold underline hover:text-blue-900"
                >
                  Select all {totalCount} contacts matching this search
                </button>
              </div>
            )}

            {isSelectAllGlobal && (
              <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 text-sm text-blue-700 text-center">
                <span className="font-medium">All {totalCount} contacts matching this search are selected.</span>
                {' '}
                <button
                  onClick={() => setIsSelectAllGlobal(false)}
                  className="font-bold underline hover:text-blue-900"
                >
                  Clear selection
                </button>
              </div>
            )}

            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => {
                const isSelected = isSelectAllGlobal
                  ? !excludedIds.has(contact.id)
                  : selectedIds.has(contact.id)
                const hasHistory = contact.history && contact.history.length > 0

                return (
                  <div
                    key={contact.id}
                    className={`px-4 sm:px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''
                      }`}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Contact Info */}
                          <div className="min-w-0 w-1/3 max-w-xs flex-none">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {contact.name || 'Unknown Name'}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-500 truncate">
                                {/* Show chosen email if multiple and selected, otherwise show raw */}
                                {isSelected && selectedEmails[contact.id]
                                  ? selectedEmails[contact.id]
                                  : contact.email}
                              </p>
                              {isMultipleEmails(contact.email) && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 rounded-full" title="Multiple Emails">
                                  Multi
                                </span>
                              )}
                              {!isMultipleEmails(contact.email) && !isValidEmail(contact.email) && (
                                <span className="text-red-500 text-xs flex items-center gap-0.5" title="Invalid Email">
                                  ⚠️
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                          </div>

                          {/* Middle: Outreach History Preview */}
                          <div className="flex-1 min-w-0 px-2">
                            {hasHistory ? (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Previously contacted in:</div>
                                <div className="flex flex-wrap gap-1">
                                  {contact.history!.map((h: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {h.campaigns?.name || 'Unknown Campaign'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              // Spacer if no history to keep alignment clean
                              <div></div>
                            )}
                          </div>

                          {/* Right: Location */}
                          <div className="text-right shrink-0 w-48">
                            <p className="text-sm text-gray-500">{contact.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {contacts.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                <p className="text-gray-500">
                  {advancedFilters.locationFilter || advancedFilters.history !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No contacts available'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {(selectedIds.size > 0 || isSelectAllGlobal) && (
        <div className="bg-white border-t px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {isSelectAllGlobal
                    ? `${totalCount - excludedIds.size} contacts selected`
                    : `${selectedIds.size} contacts selected`
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {previouslyContactedCount} previously contacted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedIds(new Set())
                  setIsSelectAllGlobal(false)
                  setExcludedIds(new Set())
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Continuing...
                  </>
                ) : (
                  <>
                    Continue to Design Email
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Multiple Email Selection Modal (Two-Pane) */}
      {emailSelectionQueue.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-full h-[600px] max-h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resolve Email Addresses</h3>
                <p className="text-sm text-gray-500">
                  Select the correct email for {emailSelectionQueue.length} contact{emailSelectionQueue.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={closeResolutionModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Pane: Contact List */}
              <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {emailSelectionQueue.map((contact) => {
                    const isResolved = !!selectedEmails[contact.id]
                    const isSkipped = skippedResolutionIds.has(contact.id)
                    const isActive = activeResolutionContactId === contact.id

                    return (
                      <button
                        key={contact.id}
                        onClick={() => setActiveResolutionContactId(contact.id)}
                        className={`w-full text-left px-4 py-4 hover:bg-white transition-colors flex items-start gap-3 ${isActive ? 'bg-white border-l-4 border-blue-600 shadow-sm' : 'border-l-4 border-transparent'
                          }`}
                      >
                        <div className={`mt-0.5 rounded-full p-1 ${isResolved ? 'bg-green-100 text-green-600' :
                          isSkipped ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-400'
                          }`}>
                          {isResolved && <Check className="w-3 h-3" />}
                          {isSkipped && <X className="w-3 h-3" />}
                          {!isResolved && !isSkipped && <div className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                            {contact.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {isResolved ? selectedEmails[contact.id] : isSkipped ? 'Ignored' : 'Selection required'}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right Pane: Email Options */}
              <div className="w-2/3 bg-white overflow-y-auto p-6 lg:p-10">
                {activeResolutionContactId ? (
                  (() => {
                    const contact = emailSelectionQueue.find(c => c.id === activeResolutionContactId)!
                    const currentSelection = selectedEmails[contact.id]

                    return (
                      <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                            {contact.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <h4 className="text-xl font-medium text-gray-900 mb-1">{contact.name}</h4>
                          {contact.company && (
                            <p className="text-md text-gray-700 font-medium mb-3">{contact.company}</p>
                          )}
                          <p className="text-gray-500">
                            Found multiple email addresses. Which one should act as the primary contact?
                          </p>
                        </div>

                        <div className="space-y-3">
                          {getEmails(contact.email).map((email) => (
                            <button
                              key={email}
                              onClick={() => handleEmailSelectionConfirm(contact.id, email)}
                              className={`w-full relative flex items-center p-4 rounded-xl border-2 text-left transition-all ${currentSelection === email
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                            >
                              <div className="flex-1">
                                <span className={`block font-medium ${currentSelection === email ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {email}
                                </span>
                                {!isValidEmail(email) && <span className="text-red-500 text-xs">Invalid format</span>}
                              </div>
                              {currentSelection === email && (
                                <div className="bg-blue-600 text-white p-1 rounded-full">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                          <button
                            onClick={() => handleSkippedSelection(contact.id)}
                            className="flex items-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Remove from selection
                          </button>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>Select a contact to resolve</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {Object.keys(selectedEmails).filter(id => emailSelectionQueue.find(c => c.id === id)).length} of {emailSelectionQueue.length} resolved
              </div>
              <button
                onClick={closeResolutionModal}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
