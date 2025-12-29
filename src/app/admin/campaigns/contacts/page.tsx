'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, EyeOff, AlertTriangle, RefreshCw } from 'lucide-react'
import { searchContacts, type Contact, type ContactFilters } from '@/lib/api/contacts'
import { isValidEmail } from '@/lib/utils/validation'

// Helper to detect multiple emails
const getEmails = (emailStr: string) => {
  return emailStr.split(',').map(e => e.trim()).filter(Boolean);
}

const isMultipleEmails = (emailStr: string) => {
  return getEmails(emailStr).length > 1;
}

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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [advancedFilters, setAdvancedFilters] = useState({
    locationFilter: '',
    source: '',
    contactType: 'developer', // 'all', 'developer', 'investor', 'both'
    history: 'all', // 'all', 'none', 'any', or campaign UUID
    emailStatus: 'all' // 'all', 'valid', 'catch-all', 'invalid'
  })
  const [isLoading, setIsLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)

  // Fetch contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true)
      try {
        let campaignHistoryFilter: ContactFilters['campaignHistory'] = undefined
        if (advancedFilters.history !== 'all') {
          campaignHistoryFilter = advancedFilters.history as 'none' | 'any'
        }

        const filters: ContactFilters = {
          location: advancedFilters.locationFilter,
          contactType: advancedFilters.contactType === 'all' ? undefined : advancedFilters.contactType,
          campaignHistory: campaignHistoryFilter,
          emailStatus: advancedFilters.emailStatus === 'all' ? undefined : advancedFilters.emailStatus
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
  }, [advancedFilters, pageSize])

  const clearFilters = () => {
    setAdvancedFilters({
      locationFilter: '',
      source: '',
      contactType: 'developer',
      history: 'all',
      emailStatus: 'all'
    })
  }

  const isContactSuppressed = (contact: Contact): boolean => {
    // Check if contact has suppression fields (assuming they'll be added to Contact type)
    const contactAny = contact as any
    return contactAny.globally_unsubscribed === true || contactAny.globally_bounced === true
  }

  const getSuppressionReason = (contact: Contact): string => {
    const contactAny = contact as any
    if (contactAny.globally_unsubscribed) return 'Unsubscribed'
    if (contactAny.globally_bounced) return 'Bounced'
    return ''
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/campaigns" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">All Contacts</h1>
            <p className="text-sm text-gray-500 mt-1">
              View all contacts in your database
            </p>
          </div>
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

          {/* Contact Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Type
            </label>
            <select
              value={advancedFilters.contactType}
              onChange={(e) => setAdvancedFilters(prev => ({
                ...prev,
                contactType: e.target.value
              }))}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="developer">Developers Only</option>
              <option value="investor">Investors Only</option>
              <option value="fund">Funds Only</option>
              <option value="developer,investor">Dev + Investors</option>
              <option value="developer,fund">Dev + Funds</option>
              <option value="investor,fund">Investors + Funds</option>
              <option value="developer,investor,fund">All Types</option>
            </select>
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
            </select>
          </div>

          {/* Email Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Status
            </label>
            <select
              value={advancedFilters.emailStatus}
              onChange={(e) => setAdvancedFilters(prev => ({
                ...prev,
                emailStatus: e.target.value
              }))}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Show All</option>
              <option value="Valid">Valid Only</option>
              <option value="Catch-all">Catch-all Only</option>
              <option value="invalid">Invalid Only</option>
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
                <option value={500}>500</option>
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
                <RefreshCw className="h-5 w-5 rotate-180" aria-hidden="true" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * pageSize >= totalCount}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Contact List */}
          <div className="flex-1 overflow-auto bg-white">
            {/* Contact Items */}
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => {
                const isSuppressed = isContactSuppressed(contact)
                const isInvalid = contact.details?.email_status === 'invalid'
                const hasHistory = contact.history && contact.history.length > 0
                const statusColor = contact.details?.email_status === 'Valid' ? 'text-green-600' :
                  contact.details?.email_status === 'Catch-all' ? 'text-yellow-600' : 'text-red-500'

                return (
                  <div
                    key={contact.id}
                    className={`px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors ${isSuppressed || isInvalid ? 'bg-red-50 border-l-4 border-red-400' : 'bg-white'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Contact Info */}
                          <div className="min-w-0 w-1/3 max-w-xs flex-none">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {contact.name || 'Unknown Name'}
                              </h3>
                              {/* Contact Type Badge */}
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                contact.contact_type === 'developer' ? 'bg-blue-100 text-blue-800' :
                                contact.contact_type === 'investor' ? 'bg-green-100 text-green-800' :
                                contact.contact_type === 'fund' ? 'bg-orange-100 text-orange-800' :
                                contact.contact_type === 'developer,investor' ? 'bg-purple-100 text-purple-800' :
                                contact.contact_type === 'developer,fund' ? 'bg-cyan-100 text-cyan-800' :
                                contact.contact_type === 'investor,fund' ? 'bg-pink-100 text-pink-800' :
                                contact.contact_type === 'developer,investor,fund' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {contact.contact_type === 'developer,investor' ? 'Dev+Inv' :
                                 contact.contact_type === 'developer,fund' ? 'Dev+Fund' :
                                 contact.contact_type === 'investor,fund' ? 'Inv+Fund' :
                                 contact.contact_type === 'developer,investor,fund' ? 'All' :
                                 contact.contact_type === 'developer' ? 'Dev' :
                                 contact.contact_type === 'investor' ? 'Inv' :
                                 contact.contact_type === 'fund' ? 'Fund' :
                                 contact.contact_type || 'Unknown'}
                              </div>
                              {isSuppressed && (
                                <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <EyeOff size={12} />
                                  Suppressed
                                </div>
                              )}
                              {isInvalid && (
                                <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <AlertTriangle size={12} />
                                  Invalid Email
                                </div>
                              )}
                              {contact.details?.email_status === 'Catch-all' && (
                                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <RefreshCw size={12} />
                                  Catch-all
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-500 truncate">
                                {contact.email}
                              </p>
                              {isMultipleEmails(contact.email) && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 rounded-full" title="Multiple Emails">
                                  Multi
                                </span>
                              )}
                              {!isValidEmail(contact.email) && (
                                <span className="text-red-500 text-xs flex items-center gap-0.5" title="Invalid Email">
                                  ⚠️
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                            {isSuppressed && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle size={12} className="text-red-500" />
                                <span className="text-xs text-red-700">
                                  {getSuppressionReason(contact)}
                                </span>
                              </div>
                            )}
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
    </div>
  )
}
