'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Users, Check, X, ChevronDown, Loader2 } from 'lucide-react'

// Mock contact data - in real implementation this would come from API
interface Contact {
  id: string
  name: string
  email: string
  company: string
  location: string
  phone?: string
  role?: string
  source: string
  tags: string[]
  outreachHistory?: {
    campaignName: string
    sentAt: string
    status: 'sent' | 'opened' | 'clicked' | 'bounced'
  }[]
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
  const terms = [input.toLowerCase()]
  const upperInput = input.toUpperCase()

  // If input is a state code, add the state name
  if (STATE_MAPPING[upperInput]) {
    terms.push(STATE_MAPPING[upperInput].toLowerCase())
  }

  // If input is a state name, add the state code
  const stateCode = STATE_NAME_TO_CODE[input.toLowerCase()]
  if (stateCode) {
    terms.push(stateCode.toLowerCase())
  }

  return terms
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'A. Jay Young',
    email: 'info@dcius.pro',
    company: 'Dci',
    location: 'Fayetteville, AR',
    phone: '4794447880',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Q1 Developer Pipeline', sentAt: '2024-01-15', status: 'opened' },
      { campaignName: 'Holiday Season Outreach', sentAt: '2023-12-10', status: 'sent' }
    ]
  },
  {
    id: '2',
    name: 'A. Robert Paratte',
    email: 'rparatte@kilroyrealty.com',
    company: 'Kilroy Realty, L.p.',
    location: 'Los Angeles, California',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '3',
    name: 'A. Tom Harb',
    email: 'tharb@ph-dev.com',
    company: 'Phoenicia Development LLC',
    location: 'Orlando, Florida',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Florida Market Expansion', sentAt: '2024-02-20', status: 'opened' }
    ]
  },
  {
    id: '4',
    name: 'Aaron Boyd',
    email: 'aboyd@dpccompanies.com',
    company: 'Dpc Companies',
    location: 'Greenwood Village, Co',
    phone: '303.796.8288',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Colorado Real Estate Summit', sentAt: '2024-01-08', status: 'clicked' }
    ]
  },
  {
    id: '5',
    name: 'Aaron Budilov',
    email: 'abudilov@bainbridgere.com',
    company: 'The Bainbridge Companies',
    location: 'Wellington, Florida',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Southeast Developer Network', sentAt: '2024-02-01', status: 'clicked' },
      { campaignName: 'Multi-Family Investment Series', sentAt: '2023-11-15', status: 'opened' }
    ]
  },
  {
    id: '6',
    name: 'A.J. Klenk',
    email: 'InvestorRelations@catalystcp.com',
    company: 'Catalyst Capital Partners',
    location: 'Charlotte, NC',
    phone: '7047051665',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '7',
    name: 'Alan Cohen',
    email: 'acohen@trammellcrow.com',
    company: 'Trammell Crow Residential',
    location: 'Dallas, TX',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Texas Market Outreach', sentAt: '2024-01-20', status: 'sent' }
    ]
  },
  {
    id: '8',
    name: 'Alex Rose',
    email: 'arose@brookfield.com',
    company: 'Brookfield Properties',
    location: 'New York, NY',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '9',
    name: 'Alexander C. (Sandy) McLean',
    email: 'smclean@jbg.com',
    company: 'JBG SMITH',
    location: 'Washington, DC',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'East Coast Outreach', sentAt: '2024-02-10', status: 'bounced' }
    ]
  },
  {
    id: '10',
    name: 'Alfred T. (Al) de Castro',
    email: 'adecastro@catellus.com',
    company: 'Catellus Development Corporation',
    location: 'San Francisco, CA',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '11',
    name: 'Alice Polk Hill',
    email: 'ahill@hillwood.com',
    company: 'Hillwood Development',
    location: 'Dallas, TX',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '12',
    name: 'Allan Swaringen',
    email: 'aswaringen@swaringen.com',
    company: 'Swaringen Development',
    location: 'Houston, TX',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Texas Gulf Coast Pipeline', sentAt: '2024-01-20', status: 'opened' },
      { campaignName: 'Energy Sector Developers', sentAt: '2023-10-05', status: 'sent' }
    ]
  },
  {
    id: '13',
    name: 'Andrew F. Cogan',
    email: 'acogan@cogan.com',
    company: 'Cogan Properties',
    location: 'Boston, MA',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '14',
    name: 'Andrew Frey',
    email: 'afrey@freydev.com',
    company: 'Frey Development',
    location: 'Austin, TX',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '15',
    name: 'Andrew M. Bursky',
    email: 'abursky@turnberry.com',
    company: 'Turnberry Associates',
    location: 'Aventura, FL',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Florida Market Outreach', sentAt: '2024-02-05', status: 'clicked' }
    ]
  },
  {
    id: '16',
    name: 'Angela R. Chao',
    email: 'achao@chaoconstruction.com',
    company: 'Chao Construction',
    location: 'Metairie, LA',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '17',
    name: 'Anita L. Foard',
    email: 'afoard@foardinc.com',
    company: 'Foard Inc.',
    location: 'Houston, TX',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '18',
    name: 'Anthony P. (Tony) Politano',
    email: 'apolitano@politano.com',
    company: 'Politano Development',
    location: 'Cleveland, OH',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '19',
    name: 'Antonio J. (Tony) Consolo',
    email: 'aconsolo@consolo.com',
    company: 'Consolo Development',
    location: 'Tampa, FL',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Florida Market Outreach', sentAt: '2024-02-05', status: 'sent' }
    ]
  },
  {
    id: '20',
    name: 'Archie Bennett',
    email: 'abennett@bennettgroup.com',
    company: 'Bennett Group',
    location: 'Atlanta, GA',
    role: 'CEO',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '21',
    name: 'Arnold F. (Arnie) Lerner',
    email: 'alerner@lernercorp.com',
    company: 'Lerner Corporation',
    location: 'Cleveland, OH',
    role: 'Chairman',
    source: 'docs/DEVELOPERS.xlsx',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '22',
    name: 'Arthur M. (Art) Gensler Jr.',
    email: 'agensler@gensler.com',
    company: 'Gensler',
    location: 'San Francisco, CA',
    role: 'Principal',
    source: 'docs/DEVELOPERS.xlsx',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '23',
    name: 'B. Joseph White',
    email: 'bwhite@whiteenterprises.com',
    company: 'White Enterprises',
    location: 'Cleveland, OH',
    role: 'President',
    source: 'developers.csv',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '24',
    name: 'Barbara J. (BJ) McGraw',
    email: 'bmcgraw@mcgrawdev.com',
    company: 'McGraw Development',
    location: 'Denver, CO',
    role: 'Managing Director',
    source: 'oz_development_list.xlsx',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '25',
    name: 'Barry Sternlicht',
    email: 'bsternlicht@starwood.com',
    company: 'Starwood Capital Group',
    location: 'Greenwich, CT',
    role: 'Founder & Chairman',
    source: 'docs/DEVELOPERS.xlsx',
    tags: ['developer'],
    outreachHistory: [
      { campaignName: 'Luxury Hospitality Portfolio', sentAt: '2024-01-25', status: 'opened' },
      { campaignName: 'Private Equity Roundtable', sentAt: '2023-09-12', status: 'clicked' },
      { campaignName: 'Real Estate Investment Summit', sentAt: '2023-06-18', status: 'sent' }
    ]
  },
  {
    id: '26',
    name: 'Aaron Carter',
    email: 'acarter@simon.com',
    company: 'Simon Property Group',
    location: 'Indianapolis, Indiana',
    role: 'Director Of Property Tax',
    source: 'docs/DEVELOPERS.xlsx',
    tags: ['developer'],
    outreachHistory: []
  },
  {
    id: '27',
    name: 'Michael Johnson',
    email: 'mjohnson@equityone.com',
    company: 'Equity One',
    location: 'North Miami, FL',
    role: 'VP of Acquisitions',
    source: 'real_estate_firms.xlsx',
    tags: ['investor'],
    outreachHistory: [
      { campaignName: 'Florida Market Expansion', sentAt: '2024-02-20', status: 'sent' }
    ]
  },
  {
    id: '28',
    name: 'Sarah Williams',
    email: 'swilliams@blackstone.com',
    company: 'Blackstone Group',
    location: 'New York, NY',
    role: 'Senior Managing Director',
    source: 'investors.csv',
    tags: ['investor'],
    outreachHistory: []
  }
]

interface ContactSelectionStepProps {
  campaignId: string
  onContinue: (selectedContactIds: string[]) => void
  onBack: () => void
}

export default function ContactSelectionStep({ campaignId, onContinue, onBack }: ContactSelectionStepProps) {
  const [contacts] = useState<Contact[]>(MOCK_CONTACTS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [showSourcesDropdown, setShowSourcesDropdown] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    role: '',
    locationFilter: '',
    source: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Get unique sources for filter options
  const availableSources = useMemo(() => {
    const sources = new Set<string>()
    contacts.forEach(contact => sources.add(contact.source))
    return Array.from(sources).sort()
  }, [contacts])

  // Filter contacts based on search and filters
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Main search query filter (searches across primary fields)
      const matchesSearch = !searchQuery ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (() => {
          const searchTerms = getLocationSearchTerms(searchQuery)
          const locationLower = contact.location.toLowerCase()
          return searchTerms.some(term => locationLower.includes(term))
        })()

      // Source filter (from both main filters and advanced filters)
      const matchesSources = selectedSources.size === 0 ||
        selectedSources.has(contact.source)

      // Advanced filters
      const matchesRole = !advancedFilters.role ||
        contact.role?.toLowerCase().includes(advancedFilters.role.toLowerCase())

      const matchesLocationFilter = !advancedFilters.locationFilter ||
        (() => {
          const searchTerms = getLocationSearchTerms(advancedFilters.locationFilter)
          const locationLower = contact.location.toLowerCase()
          return searchTerms.some(term => locationLower.includes(term))
        })()

      const matchesAdvancedSource = !advancedFilters.source ||
        contact.source === advancedFilters.source

      return matchesSearch && matchesSources && matchesRole && matchesLocationFilter && matchesAdvancedSource
    })
  }, [contacts, searchQuery, selectedSources, advancedFilters])

  const handleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)))
    }
  }

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedIds(newSelected)
  }

  const handleContinue = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    onContinue(Array.from(selectedIds))
    setIsLoading(false)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSources(new Set())
    setAdvancedFilters({
      role: '',
      locationFilter: '',
      source: ''
    })
  }

  const selectedContacts = contacts.filter(c => selectedIds.has(c.id))
  const previouslyContactedCount = selectedContacts.filter(c => c.outreachHistory && c.outreachHistory.length > 0).length

  // Multi-select dropdown helpers
  const toggleSource = (source: string) => {
    const newSources = new Set(selectedSources)
    if (newSources.has(source)) {
      newSources.delete(source)
    } else {
      newSources.add(source)
    }
    setSelectedSources(newSources)
  }

  const MultiSelectDropdown = ({
    label,
    options,
    selected,
    isOpen,
    onToggle,
    onClose,
    onSelect,
  }: {
    label: string
    options: string[]
    selected: Set<string>
    isOpen: boolean
    onToggle: () => void
    onClose: () => void
    onSelect: (option: string) => void
  }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 text-sm text-left bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
      >
        <span className={selected.size === 0 ? 'text-gray-500' : 'text-gray-900'}>
          {selected.size === 0
            ? `Select ${label.toLowerCase()}...`
            : `${selected.size} selected`
          }
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
            {options.map(option => (
              <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(option)}
                  onChange={() => onSelect(option)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm capitalize">{option}</span>
              </label>
            ))}
          </div>
          <div className="fixed inset-0 z-0" onClick={onClose}></div>
        </>
      )}
    </div>
  )

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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, company, location (CA/Texas)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              (selectedSources.size > 0 ||
               advancedFilters.role || advancedFilters.locationFilter || advancedFilters.source)
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedSources.size > 0 ||
              advancedFilters.role || advancedFilters.locationFilter || advancedFilters.source) && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {selectedSources.size +
                 (advancedFilters.role ? 1 : 0) +
                 (advancedFilters.locationFilter ? 1 : 0) +
                 (advancedFilters.source ? 1 : 0)}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
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

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. CEO, Director..."
                  value={advancedFilters.role}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sources Filter */}
              <MultiSelectDropdown
                label="Sources"
                options={availableSources}
                selected={selectedSources}
                isOpen={showSourcesDropdown}
                onToggle={() => setShowSourcesDropdown(!showSourcesDropdown)}
                onClose={() => setShowSourcesDropdown(false)}
                onSelect={toggleSource}
              />

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
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
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
                    checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                    readOnly
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Select All ({filteredContacts.length})
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {selectedIds.size} selected
              </div>
            </div>

            {/* Contact Items */}
            <div className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => {
                const isSelected = selectedIds.has(contact.id)
                const hasHistory = contact.outreachHistory && contact.outreachHistory.length > 0

                return (
                  <div
                    key={contact.id}
                    className={`px-4 sm:px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelectContact(contact.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {contact.name}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{contact.email}</p>
                            <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-500">{contact.location}</p>
                          </div>
                        </div>

                        {/* Outreach History Preview */}
                        {hasHistory && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Previously contacted in:</div>
                            <div className="flex flex-wrap gap-1">
                              {contact.outreachHistory!.slice(0, 2).map((history, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {history.campaignName}
                                </span>
                              ))}
                              {contact.outreachHistory!.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{contact.outreachHistory!.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedSources.size > 0
                    ? 'Try adjusting your search or filters'
                    : 'No contacts available'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-white border-t px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium text-gray-900">{selectedIds.size} contacts selected</p>
                <p className="text-sm text-gray-500">
                  {previouslyContactedCount} previously contacted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds(new Set())}
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
    </div>
  )
}
