'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, EyeOff, AlertTriangle, RefreshCw, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, Search, Filter, Mail, Tag, History, CheckCircle2, Loader2, Check } from 'lucide-react'
import { searchContacts, type Contact, type ContactFilters } from '@/lib/api/contacts'
import { getEmails, isMultipleEmails } from '@/lib/api/contacts/utils'
import { isValidEmail } from '@/lib/utils/validation'
import { ContactDetailPanel } from '@/components/contacts'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [advancedFilters, setAdvancedFilters] = useState<{
    locationFilter: string;
    source: string;
    contactTypes: string[];
    history: string;
    emailStatus: string;
    tags: string[];
    leadStatus: 'warm' | 'cold' | 'all';
    websiteEventTypes: string[];
    websiteOperator: 'any' | 'all';
    campaignResponse?: { campaignId: string, response: 'replied' | 'no_reply' | 'bounced' | 'all' };
  }>({
    locationFilter: '',
    source: 'all',
    contactTypes: [],
    history: 'all',
    emailStatus: 'all',
    tags: [],
    leadStatus: 'all',
    websiteEventTypes: [],
    websiteOperator: 'any'
  })
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [showFilters, setShowFilters] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/backend-proxy/campaigns')
        if (res.ok) setCampaigns(await res.json() || [])
      } catch (err) { console.error(err) }
    }
    fetchCampaigns()
  }, [])

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
          contactType: advancedFilters.contactTypes.length > 0 ? advancedFilters.contactTypes : undefined,
          campaignHistory: campaignHistoryFilter,
          emailStatus: advancedFilters.emailStatus === 'all' ? undefined : advancedFilters.emailStatus,
          leadStatus: advancedFilters.leadStatus === 'all' ? undefined : advancedFilters.leadStatus,
          tags: advancedFilters.tags.length > 0 ? advancedFilters.tags : undefined,
          websiteEvents: advancedFilters.websiteEventTypes.length > 0 ? { eventTypes: advancedFilters.websiteEventTypes, operator: advancedFilters.websiteOperator } : undefined,
          campaignResponse: (advancedFilters.campaignResponse && advancedFilters.campaignResponse.response !== 'all') ? advancedFilters.campaignResponse as any : undefined
        }

        const { data, count } = await searchContacts(filters, page, pageSize)
        setContacts(data || [])
        setTotalCount(count || 0)
      } catch (err) { console.error(err) }
      finally { setIsLoading(false) }
    }
    const timer = setTimeout(fetchContacts, 300)
    return () => clearTimeout(timer)
  }, [advancedFilters, page, pageSize])

  const clearFilters = () => {
    setAdvancedFilters({
      locationFilter: '',
      source: 'all',
      contactTypes: [],
      history: 'all',
      emailStatus: 'all',
      tags: [],
      leadStatus: 'all',
      websiteEventTypes: [],
      websiteOperator: 'any'
    })
    setPage(0)
  }

  const toggleTag = (tagName: string) => {
    setAdvancedFilters(p => ({
      ...p,
      tags: p.tags.includes(tagName) ? p.tags.filter(t => t !== tagName) : [...p.tags, tagName]
    }));
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin/campaigns" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Contact Database</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{totalCount} TOTAL RECORDS</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg border transition-all font-semibold text-xs uppercase tracking-widest shadow-sm active:scale-95 ${showFilters ? 'bg-blue-600 border-blue-600 text-white shadow-blue-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Filter className={`w-4 h-4 ${showFilters ? 'text-white' : 'text-gray-400'}`} />
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
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Search Location</label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text" placeholder="State, City, or Code..."
                    value={advancedFilters.locationFilter}
                    onChange={(e) => setAdvancedFilters(p => ({ ...p, locationFilter: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">Contact Types</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  {['developer', 'investor', 'fund', 'broker'].map(type => (
                    <label key={type} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white cursor-pointer text-sm font-medium transition-all border border-transparent hover:border-gray-200">
                      <input
                        type="checkbox"
                        checked={advancedFilters.contactTypes.includes(type)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...advancedFilters.contactTypes, type]
                            : advancedFilters.contactTypes.filter(t => t !== type);
                          setAdvancedFilters(prev => ({ ...prev, contactTypes: next }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="capitalize">{type}s</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">Website Activity</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  {[
                    { id: 'tax_calculator_used', label: 'Tax Calc' },
                    { id: 'investor_qualification_submitted', label: 'Invs Qual' },
                    { id: 'oz_check_completed', label: 'OZ Check' },
                    { id: 'viewed_listings', label: 'Listings' },
                  ].map(event => (
                    <label key={event.id} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white cursor-pointer text-sm font-medium transition-all border border-transparent hover:border-gray-200 uppercase tracking-tight">
                      <input
                        type="checkbox"
                        checked={advancedFilters.websiteEventTypes.includes(event.id)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...advancedFilters.websiteEventTypes, event.id]
                            : advancedFilters.websiteEventTypes.filter(id => id !== event.id);
                          setAdvancedFilters(prev => ({ ...prev, websiteEventTypes: next }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">Specialization Tags</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  {[
                    { id: 'family-office', label: 'Family Office' },
                    { id: 'multi-family-office', label: 'Multi-Family' }
                  ].map(tag => (
                    <label key={tag.id} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white cursor-pointer text-sm font-medium transition-all border border-transparent hover:border-gray-200 uppercase">
                      <input
                        type="checkbox"
                        checked={advancedFilters.tags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>{tag.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">Campaign Performance</label>
                <div className="space-y-3">
                  <select
                    value={advancedFilters.campaignResponse?.response || 'all'}
                    onChange={(e) => setAdvancedFilters(p => ({ ...p, campaignResponse: e.target.value === 'all' ? undefined : { campaignId: p.campaignResponse?.campaignId || '', response: e.target.value as any } }))}
                    className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                  >
                    <option value="all">Any Status</option>
                    <option value="replied">Replied</option>
                    <option value="no_reply">No Reply</option>
                    <option value="bounced">Bounced</option>
                  </select>
                  <select
                    value={advancedFilters.campaignResponse?.campaignId || ''}
                    disabled={!advancedFilters.campaignResponse}
                    onChange={(e) => setAdvancedFilters(p => ({ ...p, campaignResponse: p.campaignResponse ? { ...p.campaignResponse, campaignId: e.target.value } : undefined }))}
                    className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-30 font-medium text-gray-600"
                  >
                    <option value="">Select Target Campaign...</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Status</label>
                  <select
                    value={advancedFilters.emailStatus}
                    onChange={(e) => setAdvancedFilters(p => ({ ...p, emailStatus: e.target.value }))}
                    className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                  >
                    <option value="all">All Status</option>
                    <option value="Valid">Verified</option>
                    <option value="Catch-all">Catch-all</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Lead Potential</label>
                  <select
                    value={advancedFilters.leadStatus}
                    onChange={(e) => setAdvancedFilters(p => ({ ...p, leadStatus: e.target.value as any }))}
                    className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                  >
                    <option value="all">Any Status</option>
                    <option value="warm">Warm Leads</option>
                    <option value="cold">Cold Leads</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Outreach History</label>
                <select
                  value={advancedFilters.history}
                  onChange={(e) => setAdvancedFilters(p => ({ ...p, history: e.target.value }))}
                  className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                >
                  <option value="all">Full History</option>
                  <option value="none">Never Contacted</option>
                  <option value="any">Previously Contacted</option>
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

      <div className="flex-1 overflow-auto px-8 py-8 bg-gray-50/50">
        <div className="grid grid-cols-1 gap-6 max-w-[1600px] mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : contacts.map(contact => (
            <div key={contact.id} onClick={() => setSelectedContactId(contact.id)} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between relative active:scale-[0.995]">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-600 transition-all" />

              <div className="flex items-center gap-6 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-base text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors truncate">{contact.name || 'Unknown'}</h3>
                    <div className="flex gap-1.5">
                      {contact.contact_types ? contact.contact_types.map(t => (
                        <span key={t} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${t === 'developer' ? 'bg-blue-50 text-blue-600 border-blue-100' : t === 'investor' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                          }`}>{t}</span>
                      )) : <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{contact.contact_type}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500 font-bold truncate">{contact.email}</p>
                    {isMultipleEmails(contact.email) && <span className="text-[9px] font-black bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-md uppercase">Multi</span>}
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-56 px-6 text-center border-l border-r border-gray-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Company</p>
                <p className="text-sm font-bold text-gray-800 truncate px-2">{contact.company || '—'}</p>
              </div>

              <div className="hidden lg:block w-56 px-6 border-r border-gray-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 text-center">Location</p>
                <p className="text-xs font-bold text-gray-600 text-center truncate uppercase tracking-tighter">{contact.location || '—'}</p>
              </div>

              <div className="w-16 flex justify-end">
                <div className="p-3 rounded-2xl bg-gray-50 text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
          {!isLoading && contacts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-100">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">No Contacts Found</h3>
              <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t px-8 py-5 flex items-center justify-between z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Page {page + 1} – Showing {pageSize} records</p>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
            className="px-3 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 disabled:opacity-20 transition-all hover:border-gray-300 shadow-sm active:scale-95"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * pageSize >= totalCount} className="px-6 py-3 border border-blue-100 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-20 transition-all font-bold text-sm tracking-tight flex items-center gap-2 shadow-sm active:scale-95 shadow-blue-100">NEXT PAGE <ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {selectedContactId && <ContactDetailPanel contactId={selectedContactId} onClose={() => setSelectedContactId(null)} />}
    </div>
  )
}
