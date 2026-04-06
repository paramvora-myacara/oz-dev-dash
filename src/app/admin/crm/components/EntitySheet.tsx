'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Star } from "lucide-react";
import { CRMCallModal } from "./CRMCallModal";
import { useGlobalEntitySearch } from '../hooks/useGlobalEntitySearch';

interface EntitySheetProps {
    sheet: { type: string, id: string, data: any };
    index: number;
    onClose?: () => void;
    onOpenRelated: (type: string, id: string, data: any) => void;
    closeAll: () => void;
    currentUser?: string | null;
}

// ── Render details JSONB as a key/value table ─────────────────────────────────
function DetailsTable({ details }: { details: Record<string, unknown> | null | undefined }) {
    if (details == null || Object.keys(details).length === 0) {
        return <div className="text-sm text-muted-foreground">No metadata</div>;
    }
    const rows = Object.entries(details).map(([key, value]) => {
        const display =
            value === null || value === undefined
                ? '—'
                : typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : String(value);
        return { key, display, isObject: typeof value === 'object' && value !== null };
    });
    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="text-left font-medium px-3 py-2 border-b border-slate-200 dark:border-slate-700">Key</th>
                        <th className="text-left font-medium px-3 py-2 border-b border-slate-200 dark:border-slate-700">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ key, display, isObject }) => (
                        <tr key={key} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 align-top whitespace-nowrap">{key}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                {isObject ? (
                                    <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded overflow-x-auto m-0">{display}</pre>
                                ) : (
                                    <span className="break-all">{display}</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Small hook: search properties directly from Supabase ──────────────────────
function usePropertySearch(query: string) {
    const [results, setResults] = useState<any[]>([]);
    useEffect(() => {
        if (query.trim().length < 2) { setResults([]); return; }
        const supabase = createClient();
        const t = setTimeout(async () => {
            const ftsQuery = query.trim().split(/\s+/).filter(Boolean).map(t => `${t}:*`).join(' & ');
            const { data } = await supabase
                .from('properties')
                .select('id, property_name, address, city, state')
                .textSearch('search_vector', ftsQuery, { config: 'english' })
                .limit(6);
            setResults(data || []);
        }, 300);
        return () => clearTimeout(t);
    }, [query]);
    return results;
}

// ── State-sync helper: send full list back to RPC ─────────────────────────────
async function syncPerson(personId: string, patch: Record<string, any>) {
    const res = await fetch('/api/crm/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person_id: personId, ...patch }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Sync failed');
}

// ── Inline org-link form ──────────────────────────────────────────────────────
function LinkOrgForm({ personId, currentEmails, onDone }: {
    personId: string;
    currentEmails: string[];
    onDone: () => void;
}) {
    const orgSearch = useGlobalEntitySearch('organizations', 'name', 2);
    const [titleInput, setTitleInput] = useState('');
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleLink = async () => {
        if (!selectedOrg && !orgSearch.query.trim()) return;
        setIsSaving(true);
        try {
            await syncPerson(personId, {
                organization_id: selectedOrg?.id || null,
                organization_name: selectedOrg ? null : orgSearch.query.trim(),
                title: titleInput.trim() || null,
            });
            onDone();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-3 p-3 bg-blue-50/60 border border-blue-100 rounded-lg space-y-2 animate-in zoom-in-95 duration-150">
            <div className="space-y-1.5">
                <Input
                    autoFocus
                    placeholder="Search or enter organization name..."
                    value={orgSearch.query}
                    onChange={(e) => { setSelectedOrg(null); orgSearch.setQuery(e.target.value); }}
                    className="h-8 text-sm bg-white"
                />
                {orgSearch.results.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-sm border rounded-md shadow-md overflow-hidden">
                        {orgSearch.results.map((r: any) => (
                            <button
                                key={r.id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 transition-colors border-b last:border-0"
                                onClick={() => { setSelectedOrg(r); orgSearch.setQuery(r.name); }}
                            >
                                <span className="font-medium">{r.name}</span>
                                {selectedOrg?.id === r.id && (
                                    <Badge className="ml-2 bg-blue-100 text-blue-700 text-[9px] border-none">✓ Selected</Badge>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <Input
                placeholder="Title at this org (e.g. Partner)"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="h-8 text-sm bg-white"
            />
            <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onDone}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs" disabled={isSaving || (!selectedOrg && !orgSearch.query.trim())} onClick={handleLink}>
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Link Org'}
                </Button>
            </div>
        </div>
    );
}

// ── Inline property-link form ─────────────────────────────────────────────────
function LinkPropertyForm({ personId, onDone }: { personId: string; onDone: () => void }) {
    const [query, setQuery] = useState('');
    const results = usePropertySearch(query);
    const [selectedProp, setSelectedProp] = useState<any>(null);
    const [role, setRole] = useState('owner');
    const [isSaving, setIsSaving] = useState(false);

    const handleLink = async () => {
        if (!selectedProp) return;
        setIsSaving(true);
        try {
            // Direct insert into person_properties (property link not in RPC yet)
            const supabase = createClient();
            const { error } = await supabase
                .from('person_properties')
                .insert({ person_id: personId, property_id: selectedProp.id, role })
                .select();
            if (error && !error.message.includes('duplicate')) throw error;
            onDone();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-3 p-3 bg-blue-50/60 border border-blue-100 rounded-lg space-y-2 animate-in zoom-in-95 duration-150">
            <Input
                autoFocus
                placeholder="Search by address or property name..."
                value={query}
                onChange={(e) => { setSelectedProp(null); setQuery(e.target.value); }}
                className="h-8 text-sm bg-white"
            />
            {results.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm border rounded-md shadow-md overflow-hidden">
                    {results.map((r: any) => (
                        <button
                            key={r.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 transition-colors border-b last:border-0"
                            onClick={() => { setSelectedProp(r); setQuery(r.address || r.property_name); }}
                        >
                            <span className="font-medium">{r.address || r.property_name}</span>
                            {r.address && <span className="text-slate-500 ml-2">{r.property_name}</span>}
                            {r.city && <span className="text-slate-400 ml-2 text-[10px]">{r.city}, {r.state}</span>}
                            {selectedProp?.id === r.id && (
                                <Badge className="ml-2 bg-blue-100 text-blue-700 text-[9px] border-none">✓</Badge>
                            )}
                        </button>
                    ))}
                </div>
            )}
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-8 border rounded-md px-2 text-xs bg-white"
            >
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="trustee">Trustee</option>
                <option value="developer">Developer</option>
                <option value="special_servicer">Special Servicer</option>
            </select>
            <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onDone}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs" disabled={isSaving || !selectedProp} onClick={handleLink}>
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Link Property'}
                </Button>
            </div>
        </div>
    );
}

export function EntitySheet({ sheet, index, onClose, onOpenRelated, closeAll, currentUser }: EntitySheetProps) {
    const { type, id, data: initialData } = sheet;
    const [data, setData] = useState<any>(initialData);
    const [loading, setLoading] = useState(true);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);

    // Contact method state
    const [addingEmailInput, setAddingEmailInput] = useState('');
    const [isAddingEmail, setIsAddingEmail] = useState(false);
    const [addingPhoneInput, setAddingPhoneInput] = useState('');
    const [isAddingPhone, setIsAddingPhone] = useState(false);
    const [isAddingOrg, setIsAddingOrg] = useState(false);
    const [isAddingProperty, setIsAddingProperty] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [isSearchingLinkedin, setIsSearchingLinkedin] = useState(false);
    const [linkedinSearchResults, setLinkedinSearchResults] = useState<any[]>([]);
    const [showLinkedinDiscovery, setShowLinkedinDiscovery] = useState(false);
    const [localExpiredLinkedinIds, setLocalExpiredLinkedinIds] = useState<Set<string>>(new Set());
    const [localRequestSentLinkedinIds, setLocalRequestSentLinkedinIds] = useState<Set<string>>(new Set());

    const refreshPerson = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/crm/people/${id}`);
            const fullData = await res.json();
            if (fullData && !fullData.error) setData(fullData);
        } catch (err) {
            console.error('Failed to refresh', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setData(initialData);

        const fetchFullData = async () => {
            try {
                let endpoint = '';
                if (type === 'person') endpoint = `/api/crm/people/${id}`;
                else if (type === 'company') endpoint = `/api/crm/companies/${id}`;
                else if (type === 'property') endpoint = `/api/crm/properties/${id}`;

                if (endpoint) {
                    const res = await fetch(endpoint);
                    const fullData = await res.json();
                    if (mounted && fullData && !fullData.error) setData(fullData);
                }
            } catch (err) {
                console.error("Failed to fetch full entity", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchFullData();
        return () => { mounted = false; };
    }, [type, id, initialData]);

    useEffect(() => {
        if (showLinkedinDiscovery && type === 'person') {
            fetch(`/api/crm/people/${id}/linkedin/search`)
                .then(res => res.json())
                .then(json => { if (json.data) setLinkedinSearchResults(json.data); })
                .catch(err => console.error('Failed to fetch search results', err));
        }
    }, [showLinkedinDiscovery, id, type]);

    const handleOpenChange = (open: boolean) => {
        if (!open && onClose) onClose();
    };

    // ── Contact method handlers ────────────────────────────────────────────────

    const handleSetPrimaryEmail = async (targetEmailId: string) => {
        if (!data.person_emails?.length) return;
        setSyncing(true);
        try {
            await syncPerson(id, {
                emails: data.person_emails.map((pe: any) => ({
                    address: pe.emails.address,
                    is_primary: pe.emails.id === targetEmailId,
                    label: pe.label || 'work',
                })),
            });
            await refreshPerson();
        } catch (e: any) { alert(e.message); }
        finally { setSyncing(false); }
    };

    const handleQuickAddEmail = async (address: string) => {
        if (!address.trim()) return;
        setSyncing(true);
        try {
            const existing = (data.person_emails || []).map((pe: any) => ({
                address: pe.emails.address,
                is_primary: pe.is_primary,
                label: pe.label || 'work',
            }));
            await syncPerson(id, {
                emails: [...existing, { address: address.trim(), is_primary: false, label: 'work' }],
            });
            setIsAddingEmail(false);
            setAddingEmailInput('');
            await refreshPerson();
        } catch (e: any) { alert(e.message); }
        finally { setSyncing(false); }
    };

    const handleSetPrimaryPhone = async (targetPhoneId: string) => {
        if (!data.person_phones?.length) return;
        setSyncing(true);
        try {
            await syncPerson(id, {
                phones: data.person_phones.map((pp: any) => ({
                    number: pp.phones.number,
                    is_primary: pp.phones.id === targetPhoneId,
                    label: pp.label || 'mobile',
                })),
            });
            await refreshPerson();
        } catch (e: any) { alert(e.message); }
        finally { setSyncing(false); }
    };

    const handleQuickAddPhone = async (number: string) => {
        if (!number.trim()) return;
        setSyncing(true);
        try {
            const existing = (data.person_phones || []).map((pp: any) => ({
                number: pp.phones.number,
                is_primary: pp.is_primary,
                label: pp.label || 'mobile',
            }));
            await syncPerson(id, {
                phones: [...existing, { number: number.trim(), is_primary: false, label: 'mobile' }],
            });
            setIsAddingPhone(false);
            setAddingPhoneInput('');
            await refreshPerson();
        } catch (e: any) { alert(e.message); }
        finally { setSyncing(false); }
    };

    const handleSetPrimaryLinkedin = async (targetLinkedinId: string) => {
        if (!data.person_linkedin?.length) return;
        setSyncing(true);
        try {
            await syncPerson(id, {
                linkedin: data.person_linkedin.map((pl: any) => ({
                    url: pl.linkedin_profiles.url,
                    is_primary: pl.linkedin_profiles.id === targetLinkedinId,
                })),
            });
            await refreshPerson();
        } catch (e: any) { alert(e.message); }
        finally { setSyncing(false); }
    };

    const handleQuickAddLinkedin = async (url: string) => {
        if (!url.trim()) return;
        setSyncing(true);
        try {
            const existing = (data.person_linkedin || []).map((pl: any) => ({
                url: pl.linkedin_profiles.url,
                is_primary: pl.is_primary,
            }));
            await syncPerson(id, {
                linkedin: [...existing, { url: url.trim(), is_primary: false }],
            });
            await refreshPerson();
        } catch (e: any) { alert(e.message); }
        finally { setSyncing(false); }
    };

    const sendLinkedinRequestSent = async (linkedinProfileId: string) => {
        setSyncing(true);
        try {
            const res = await fetch(`/api/backend-proxy/crm/people/${id}/linkedin/request-sent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    linkedin_profile_id: linkedinProfileId,
                    sender: currentUser || null,
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to mark request sent');
            }
            await refreshPerson();
            setLocalRequestSentLinkedinIds((prev) => {
                const next = new Set(prev);
                next.add(linkedinProfileId);
                return next;
            });
        } catch (e: any) {
            alert(e.message || 'Failed to mark request sent');
        } finally {
            setSyncing(false);
        }
    };

    const expireLinkedinProfile = async (linkedinProfileId: string, expired: boolean) => {
        setSyncing(true);
        try {
            const endpoint = expired
                ? `/api/backend-proxy/crm/linkedin-profiles/${linkedinProfileId}/expire`
                : `/api/backend-proxy/crm/linkedin-profiles/${linkedinProfileId}/unexpire`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    person_id: id,
                    actor: currentUser || null,
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to update LinkedIn profile');
            }
            await refreshPerson();
            setLocalExpiredLinkedinIds((prev) => {
                const next = new Set(prev);
                if (expired) next.add(linkedinProfileId);
                else next.delete(linkedinProfileId);
                return next;
            });
        } catch (e: any) {
            alert(e.message || 'Failed to update LinkedIn profile');
        } finally {
            setSyncing(false);
        }
    };

    const toggleLocalRequestSent = (linkedinProfileId: string) => {
        setLocalRequestSentLinkedinIds((prev) => {
            const next = new Set(prev);
            if (next.has(linkedinProfileId)) next.delete(linkedinProfileId);
            else next.add(linkedinProfileId);
            return next;
        });
    };

    const toggleLocalExpired = (linkedinProfileId: string) => {
        setLocalExpiredLinkedinIds((prev) => {
            const next = new Set(prev);
            if (next.has(linkedinProfileId)) next.delete(linkedinProfileId);
            else next.add(linkedinProfileId);
            return next;
        });
    };

    // ──────────────────────────────────────────────────────────────────────────
    // People View
    // ──────────────────────────────────────────────────────────────────────────
    if (type === 'person') {
        return (
            <Sheet open={true} onOpenChange={handleOpenChange}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <SheetTitle className="text-2xl flex items-center gap-2">
                                    {data.display_name}
                                    {(loading || syncing) && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                                </SheetTitle>
                                <SheetDescription>
                                    {data.person_organizations?.map((po: any) => po.title).join(', ') || 'No title'}
                                </SheetDescription>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <Button
                                    onClick={() => setIsCallModalOpen(true)}
                                    className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 font-medium rounded-md"
                                >
                                    Log Call
                                </Button>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="space-y-6">

                        {/* ── Organizations ──────────────────────────────── */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-base">Organizations</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-sm text-blue-600 hover:bg-blue-50 border border-dashed border-transparent hover:border-blue-200 font-medium"
                                    onClick={() => setIsAddingOrg(!isAddingOrg)}
                                >
                                    {isAddingOrg ? 'Cancel' : <><Plus className="w-3 h-3 mr-0.5" /> Link Org</>}
                                </Button>
                            </div>
                            {isAddingOrg && (
                                <LinkOrgForm
                                    personId={id}
                                    currentEmails={[]}
                                    onDone={() => { setIsAddingOrg(false); refreshPerson(); }}
                                />
                            )}
                            {data.person_organizations?.length > 0 ? (
                                <div className="space-y-2 mt-2">
                                    {data.person_organizations.map((po: any) => (
                                        <div
                                            key={po.organizations.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => onOpenRelated('company', po.organizations.id, po.organizations)}
                                        >
                                            <div className="font-semibold text-base">{po.organizations.name}</div>
                                            <div className="text-sm text-muted-foreground">{po.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground mt-2">{loading ? 'Loading...' : 'No organizations linked.'}</div>
                            )}
                        </div>

                        <Separator />

                        {/* ── Contact Methods ────────────────────────────── */}
                        <div>
                            <h4 className="font-semibold text-base mb-3">Contact Methods</h4>

                            {/* Emails */}
                            <div className="mb-3">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">Email</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                                        onClick={() => setIsAddingEmail(!isAddingEmail)}
                                    >
                                        {isAddingEmail ? 'Cancel' : '+ Add'}
                                    </Button>
                                </div>
                                <div className="space-y-1.5">
                                    {data.person_emails?.map((pe: any) => (
                                        <div
                                            key={pe.emails.id}
                                            className="group flex items-center justify-between px-3 py-2 rounded-md bg-slate-50 border border-transparent hover:border-blue-200 transition-all"
                                        >
                                            <div>
                                                <span className="text-base">{pe.emails.address}</span>
                                                {pe.label && <span className="ml-2 text-xs text-slate-400 uppercase">{pe.label}</span>}
                                            </div>
                                            {pe.is_primary ? (
                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-bold shadow-none">Primary</Badge>
                                            ) : (
                                                <button
                                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-all uppercase font-semibold tracking-tight"
                                                    onClick={() => handleSetPrimaryEmail(pe.emails.id)}
                                                >
                                                    <Star className="w-3 h-3" /> Set Primary
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {isAddingEmail && (
                                        <div className="flex gap-2 animate-in slide-in-from-top-1 duration-150">
                                            <Input
                                                autoFocus
                                                className="h-8 text-sm"
                                                placeholder="New email address..."
                                                value={addingEmailInput}
                                                onChange={(e) => setAddingEmailInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleQuickAddEmail(addingEmailInput);
                                                    if (e.key === 'Escape') { setIsAddingEmail(false); setAddingEmailInput(''); }
                                                }}
                                            />
                                            <Button size="sm" className="h-8 shrink-0" onClick={() => handleQuickAddEmail(addingEmailInput)}>Add</Button>
                                        </div>
                                    )}
                                    {!loading && !data.person_emails?.length && !isAddingEmail && (
                                        <div className="text-xs text-muted-foreground">No emails found.</div>
                                    )}
                                </div>
                            </div>

                            {/* Phones */}
                            <div className="mb-3">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phone</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                                        onClick={() => setIsAddingPhone(!isAddingPhone)}
                                    >
                                        {isAddingPhone ? 'Cancel' : '+ Add'}
                                    </Button>
                                </div>
                                <div className="space-y-1.5">
                                    {data.person_phones?.map((pp: any) => (
                                        <div
                                            key={pp.phones.id}
                                            className="group flex items-center justify-between px-3 py-2 rounded-md bg-slate-50 border border-transparent hover:border-blue-200 transition-all"
                                        >
                                            <div>
                                                <span className="text-base">{pp.phones.number}</span>
                                                {pp.label && <span className="ml-2 text-xs text-slate-400 uppercase">{pp.label}</span>}
                                            </div>
                                            {pp.is_primary ? (
                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-bold shadow-none">Primary</Badge>
                                            ) : (
                                                <button
                                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-all uppercase font-semibold tracking-tight"
                                                    onClick={() => handleSetPrimaryPhone(pp.phones.id)}
                                                >
                                                    <Star className="w-3 h-3" /> Set Primary
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {isAddingPhone && (
                                        <div className="flex gap-2 animate-in slide-in-from-top-1 duration-150">
                                            <Input
                                                autoFocus
                                                className="h-8 text-sm"
                                                placeholder="New phone number..."
                                                value={addingPhoneInput}
                                                onChange={(e) => setAddingPhoneInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleQuickAddPhone(addingPhoneInput);
                                                    if (e.key === 'Escape') { setIsAddingPhone(false); setAddingPhoneInput(''); }
                                                }}
                                            />
                                            <Button size="sm" className="h-8 shrink-0" onClick={() => handleQuickAddPhone(addingPhoneInput)}>Add</Button>
                                        </div>
                                    )}
                                    {!loading && !data.person_phones?.length && !isAddingPhone && (
                                        <div className="text-xs text-muted-foreground">No phones found.</div>
                                    )}
                                </div>
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">LinkedIn</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                                        onClick={() => setShowLinkedinDiscovery(!showLinkedinDiscovery)}
                                    >
                                        {showLinkedinDiscovery ? 'Cancel' : 'Discover'}
                                    </Button>
                                </div>

                                {showLinkedinDiscovery && (
                                    <div className="mb-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-3 animate-in zoom-in-95 duration-150">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase text-blue-600">Suggested Profiles</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 px-2 text-[10px] text-blue-600"
                                                disabled={isSearchingLinkedin}
                                                onClick={async () => {
                                                    setIsSearchingLinkedin(true);
                                                    try {
                                                        const context = data.person_organizations?.[0]?.organizations?.name || data.person_properties?.[0]?.properties?.property_name || '';
                                                        const res = await fetch(`/api/crm/people/${id}/linkedin/search`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ name: data.display_name, context })
                                                        });
                                                        const json = await res.json();
                                                        if (json.data) setLinkedinSearchResults(json.data);
                                                    } finally {
                                                        setIsSearchingLinkedin(false);
                                                    }
                                                }}
                                            >
                                                {isSearchingLinkedin ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                                                {linkedinSearchResults.length > 0 ? 'Re-scan' : 'Search with Tavily'}
                                            </Button>
                                        </div>

                                        {linkedinSearchResults.length > 0 && (
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {linkedinSearchResults.map((result) => {
                                                    const alreadyLinked = data.person_linkedin?.some((pl: any) => pl.linkedin_profiles.url === result.profile_url);
                                                    return (
                                                        <div key={result.id} className="p-2 bg-white rounded border border-blue-100 flex items-start justify-between gap-3 shadow-sm">
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-semibold truncate text-slate-800">{result.profile_name}</div>
                                                                <div className="text-[10px] text-slate-500 truncate">{result.profile_title || 'No Title'}</div>
                                                                <a href={result.profile_url} target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 hover:underline truncate block">View Profile ↗</a>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant={alreadyLinked ? "secondary" : "default"}
                                                                className="h-7 px-3 text-xs shrink-0"
                                                                disabled={alreadyLinked || syncing}
                                                                onClick={() => handleQuickAddLinkedin(result.profile_url)}
                                                            >
                                                                {alreadyLinked ? 'Added' : 'Add'}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {!isSearchingLinkedin && linkedinSearchResults.length === 0 && (
                                            <div className="text-[10px] text-slate-400 italic text-center py-2">No results yet. Click search to find profiles using AI.</div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    {(data.person_linkedin || []).map((pl: any, idx: number) => {
                                            const liId = pl.linkedin_profiles.id;
                                            const liUrl = pl.linkedin_profiles.url;
                                            const isExpired =
                                                !!pl?.linkedin_profiles?.is_expired ||
                                                localExpiredLinkedinIds.has(liId);
                                            const isRequestSent = localRequestSentLinkedinIds.has(liId);

                                            return (
                                                <div
                                                    key={liId ?? `linkedin-${idx}`}
                                                    className={`group flex items-start justify-between gap-3 px-3 py-2 rounded-md border transition-all ${
                                                        isExpired
                                                            ? 'bg-slate-50/60 border-slate-200 opacity-80'
                                                            : 'bg-slate-50 border-transparent hover:border-blue-200'
                                                    }`}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <a
                                                            href={liUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={`text-base hover:underline truncate block ${
                                                                isExpired ? 'text-slate-400 line-through' : 'text-blue-500'
                                                            }`}
                                                        >
                                                            {liUrl}
                                                        </a>
                                                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                                                            {pl.is_primary && (
                                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] font-bold shadow-none">Primary</Badge>
                                                            )}
                                                            {isRequestSent && (
                                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold shadow-none">Request sent</Badge>
                                                            )}
                                                            {isExpired && (
                                                                <Badge className="bg-slate-200 text-slate-700 border-slate-300 text-[10px] font-bold shadow-none">Expired</Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={isRequestSent ? "secondary" : "outline"}
                                                            className="h-8 px-3 text-xs"
                                                            onClick={() => {
                                                                if (isRequestSent) {
                                                                    // UI-only undo for now; we'll add backend undo if/when needed.
                                                                    toggleLocalRequestSent(liId);
                                                                } else {
                                                                    sendLinkedinRequestSent(liId);
                                                                }
                                                            }}
                                                            disabled={syncing}
                                                        >
                                                            {isRequestSent ? 'Undo' : 'Request sent'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={isExpired ? "secondary" : "outline"}
                                                            className="h-8 px-3 text-xs"
                                                            onClick={() => {
                                                                // Persist to backend. UI-only toggle is still used as fallback if backend isn't ready.
                                                                expireLinkedinProfile(liId, !isExpired);
                                                            }}
                                                            disabled={syncing}
                                                        >
                                                            {isExpired ? 'Un-expire' : 'Mark expired'}
                                                        </Button>

                                                        {!pl.is_primary && (
                                                            <button
                                                                type="button"
                                                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 transition-all uppercase font-semibold tracking-tight"
                                                                onClick={() => handleSetPrimaryLinkedin(liId)}
                                                            >
                                                                <Star className="w-3 h-3" /> Set Primary
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {!loading && !data.person_linkedin?.length && !showLinkedinDiscovery && (
                                        <div className="text-xs text-muted-foreground">No LinkedIn profiles found.</div>
                                    )}
                                </div>
                            </div>

                        </div>

                        <Separator />

                        {/* ── Properties ─────────────────────────────────── */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-base">Properties</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-sm text-blue-600 hover:bg-blue-50 border border-dashed border-transparent hover:border-blue-200 font-medium"
                                    onClick={() => setIsAddingProperty(!isAddingProperty)}
                                >
                                    {isAddingProperty ? 'Cancel' : <><Plus className="w-3 h-3 mr-0.5" /> Link Property</>}
                                </Button>
                            </div>
                            {isAddingProperty && (
                                <LinkPropertyForm
                                    personId={id}
                                    onDone={() => { setIsAddingProperty(false); refreshPerson(); }}
                                />
                            )}
                            {data.person_properties?.length > 0 ? (
                                <div className="space-y-2 mt-2">
                                    {data.person_properties.map((pp: any) => (
                                        <div
                                            key={pp.property_id}
                                            className="text-sm bg-muted p-2 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => pp.properties && onOpenRelated('property', pp.properties.id, pp.properties)}
                                        >
                                            <span className="font-semibold text-base flex items-center gap-2">
                                                {pp.properties?.property_name || `Property ID: ${pp.properties?.id}`}
                                                <Badge variant="outline" className="text-xs">{pp.role}</Badge>
                                            </span>
                                            {pp.properties?.city && pp.properties?.state && (
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {pp.properties.city}, {pp.properties.state}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground mt-2">{loading ? 'Loading...' : 'No properties linked.'}</div>
                            )}
                        </div>

                        <Separator />

                        {/* ── Outreach Timeline ──────────────────────────── */}
                        <div>
                            <h4 className="font-semibold text-base mb-2">Outreach Timeline</h4>
                            {data.timeline?.length > 0 ? (
                                <div className="space-y-4 border-l-2 border-slate-200 ml-3 pl-4">
                                    {data.timeline.map((event: any) => (
                                        <div key={event.id} className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-400 border-2 border-white" />
                                            <div className="text-base">
                                                <span className="font-semibold">
                                                    {event.channel === 'phone'
                                                        ? 'Called'
                                                        : event.channel === 'website'
                                                            ? 'Website'
                                                            : event.channel === 'linkedin'
                                                                ? 'LinkedIn'
                                                                : 'Emailed'}
                                                </span>
                                                <span className="text-muted-foreground ml-2">{new Date(event.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">{event.description}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">No outreach events yet.</div>
                            )}
                        </div>

                        <Separator />

                        {/* ── Metadata ───────────────────────────────────── */}
                        <div>
                            <h4 className="font-semibold mb-2 text-base">Metadata Details</h4>
                            <DetailsTable details={data.details} />
                        </div>
                    </div>
                </SheetContent>

                <CRMCallModal
                    open={isCallModalOpen}
                    onOpenChange={setIsCallModalOpen}
                    person={data}
                    currentUser={currentUser}
                    onLogged={() => {
                        setIsCallModalOpen(false);
                        refreshPerson();
                    }}
                />
            </Sheet >
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Company View
    // ──────────────────────────────────────────────────────────────────────────
    if (type === 'company') {
        return (
            <Sheet open={true} onOpenChange={handleOpenChange}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <SheetTitle className="text-2xl flex items-center gap-2">
                                    {data.name}
                                    {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                                </SheetTitle>
                                <SheetDescription>
                                    {data.org_type || 'Organization'}
                                </SheetDescription>
                            </div>
                            <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>{data.status}</Badge>
                        </div>
                    </SheetHeader>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Location & Details</h4>
                            <div className="text-sm space-y-1">
                                {data.address && <div><span className="font-medium">Address:</span> {data.address}, {data.city}, {data.state} {data.zip}</div>}
                                {data.website && <div><span className="font-medium">Website:</span> <a href={data.website} target="_blank" className="text-blue-500 hover:underline">{data.website}</a></div>}
                                {data.company_email && <div><span className="font-medium">Company Email:</span> {data.company_email}</div>}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2 text-sm">People</h4>
                            {data.person_organizations?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.person_organizations.map((po: any) => (
                                        <div
                                            key={po.people.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => onOpenRelated('person', po.people.id, po.people)}
                                        >
                                            <div className="font-medium text-sm">{po.people.display_name}</div>
                                            <div className="text-xs text-muted-foreground">{po.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No people found for this company.'}</div>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Properties</h4>
                            {data.property_organizations?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.property_organizations.map((po: any) => (
                                        <div
                                            key={po.properties.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => onOpenRelated('property', po.properties.id, po.properties)}
                                        >
                                            <div className="font-medium text-sm flex items-center gap-2">
                                                {po.properties.property_name || `Property ID: ${po.properties.id}`}
                                                <Badge variant="outline" className="text-[10px]">{po.role}</Badge>
                                            </div>
                                            {(po.properties.address || po.properties.city) && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {po.properties.address}{po.properties.address && po.properties.city ? ', ' : ''}
                                                    {po.properties.city && `${po.properties.city}, ${po.properties.state}`}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No properties linked to this company.'}</div>
                            )}
                        </div>

                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Details (JSONB)</h4>
                            <DetailsTable details={data.details} />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Property View
    // ──────────────────────────────────────────────────────────────────────────
    if (type === 'property') {
        return (
            <Sheet open={true} onOpenChange={handleOpenChange}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <SheetTitle className="text-2xl flex items-center gap-2">
                                    {data.property_name}
                                    {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                                </SheetTitle>
                                <SheetDescription>
                                    {data.city}, {data.state} {data.zip}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Property Details</h4>
                            <div className="text-sm space-y-1">
                                {data.address && <div><span className="font-medium">Address:</span> {data.address}</div>}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Linked Organizations</h4>
                            {data.property_organizations?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.property_organizations.map((po: any) => (
                                        <div
                                            key={po.organizations.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => onOpenRelated('company', po.organizations.id, po.organizations)}
                                        >
                                            <div className="font-medium text-sm">{po.organizations.name}</div>
                                            <div className="text-xs text-muted-foreground">{po.role}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No organizations linked.'}</div>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Linked People</h4>
                            {data.person_properties?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.person_properties.map((pp: any) => (
                                        <div
                                            key={pp.people.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => onOpenRelated('person', pp.people.id, pp.people)}
                                        >
                                            <div className="font-medium text-sm">{pp.people.display_name}</div>
                                            <div className="text-xs text-muted-foreground">{pp.role}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No people found for this property.'}</div>
                            )}
                        </div>

                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Metadata Details (JSONB)</h4>
                            <DetailsTable details={data.details} />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return null;
}
