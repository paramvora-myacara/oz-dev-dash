'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGlobalEntitySearch } from '../hooks/useGlobalEntitySearch';
import { usePersonNameSearch } from '../hooks/usePersonNameSearch';

interface AddCRMContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function AddCRMContactModal({ open, onOpenChange, onCreated }: AddCRMContactModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [leadStatus, setLeadStatus] = useState('new');
  const [tags, setTags] = useState('');
  const [title, setTitle] = useState('');
  const [personId, setPersonId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const nameSearch = usePersonNameSearch(firstName, lastName);
  const emailSearch = useGlobalEntitySearch('emails', 'address');
  const phoneSearch = useGlobalEntitySearch('phones', 'number');
  const linkedinSearch = useGlobalEntitySearch('linkedin_profiles', 'url');
  const orgSearch = useGlobalEntitySearch('organizations', 'name', 2);

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const handleSelectPerson = (person: any) => {
    setPersonId(person.id);
    setFirstName(person.first_name || '');
    setLastName(person.last_name || '');
    setLeadStatus(person.lead_status || 'new');
    setTags(person.tags?.join(', ') || '');

    // Auto-fill title and org
    const primaryOrg = person.person_organizations?.find((po: any) => po.is_primary) || person.person_organizations?.[0];
    if (primaryOrg) {
      setTitle(primaryOrg.title || '');
      setSelectedOrgId(primaryOrg.organizations?.id);
      orgSearch.setQuery(primaryOrg.organizations?.name || '');
    }

    // Auto-fill emails
    const primaryEmail = person.person_emails?.find((pe: any) => pe.is_primary) || person.person_emails?.[0];
    if (primaryEmail) {
      emailSearch.setQuery(primaryEmail.emails?.address || '');
    }

    // Auto-fill phones
    const primaryPhone = person.person_phones?.find((pp: any) => pp.is_primary) || person.person_phones?.[0];
    if (primaryPhone) {
      phoneSearch.setQuery(primaryPhone.phones?.number || '');
    }

    // Auto-fill LinkedIn
    const primaryLinkedin = person.person_linkedin?.find((pl: any) => pl.is_primary) || person.person_linkedin?.[0];
    if (primaryLinkedin) {
      linkedinSearch.setQuery(primaryLinkedin.linkedin_profiles?.url || '');
    }
  };

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      alert('First name is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        person_id: personId,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        lead_status: leadStatus,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        emails: emailSearch.query.trim()
          ? [{ address: emailSearch.query.trim(), is_primary: true, label: 'work' }]
          : [],
        phones: phoneSearch.query.trim()
          ? [{ number: phoneSearch.query.trim(), is_primary: true, label: 'mobile' }]
          : [],
        linkedin: linkedinSearch.query.trim()
          ? [{ url: linkedinSearch.query.trim(), is_primary: true }]
          : [],
        organization_id: selectedOrgId,
        organization_name: selectedOrgId ? null : orgSearch.query.trim() || null,
        title: title.trim() || null,
      };

      const res = await fetch('/api/crm/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create contact');
      }

      onCreated?.();
      onOpenChange(false);
      setPersonId(null);
      setFirstName('');
      setLastName('');
      setLeadStatus('new');
      setTags('');
      setTitle('');
      setSelectedOrgId(null);
      emailSearch.setQuery('');
      phoneSearch.setQuery('');
      linkedinSearch.setQuery('');
      orgSearch.setQuery('');
    } catch (err: any) {
      alert(err.message || 'Failed to create contact');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{personId ? 'Update Contact' : 'Add Contact'}</DialogTitle>
          <DialogDescription>
            {personId
              ? 'Update existing person and their linked contact entities.'
              : 'Create a new person and link global contact entities when matches exist.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label>First Name</Label>
                {personId && (
                  <button
                    onClick={() => setPersonId(null)}
                    className="text-[10px] text-red-500 hover:underline font-medium"
                  >
                    Cancel Link
                  </button>
                )}
              </div>
              <Input
                value={firstName}
                className={personId ? "bg-blue-50/50 border-blue-200" : ""}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  // if (personId) setPersonId(null); // Let's keep the link even if they edit name for now, or maybe only if they change it significantly?
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={lastName}
                className={personId ? "bg-blue-50/50 border-blue-200" : ""}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
              />
            </div>
          </div>

          {personId && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700 font-medium animate-in fade-in slide-in-from-top-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Linking to existing person: {firstName} {lastName}
            </div>
          )}

          {nameSearch.results.length > 0 && !personId && (
            <div className="bg-blue-50/50 p-2 rounded-md border border-blue-100 space-y-1.5">
              <p className="text-[10px] font-medium text-blue-600 uppercase tracking-tight px-1">Potential Matches</p>
              <div className="grid grid-cols-1 gap-1">
                {nameSearch.results.map((r: any) => (
                  <button
                    key={r.id}
                    type="button"
                    className="flex items-center justify-between text-left text-xs bg-white border rounded-md px-3 py-2 hover:border-blue-300 hover:shadow-sm transition-all"
                    onClick={() => handleSelectPerson(r)}
                  >
                    <div>
                      <span className="font-semibold">{r.first_name} {r.last_name}</span>
                      {r.person_organizations?.[0]?.organizations?.name && (
                        <span className="text-slate-500 ml-2">@ {r.person_organizations[0].organizations.name}</span>
                      )}
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-medium px-1.5 py-0.5 rounded uppercase">Use existing</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lead Status</Label>
              <select
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value)}
                className="w-full h-10 border rounded-md px-3 text-sm"
              >
                <option value="new">New</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="hot">Hot</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="investor, family_office" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={emailSearch.query}
              onChange={(e) => emailSearch.setQuery(e.target.value)}
              placeholder="Type email..."
            />
            {emailSearch.results.map((r: any) => (
              <button
                key={r.id}
                type="button"
                className="w-full text-left text-xs border rounded-md px-2 py-1.5 hover:bg-slate-50"
                onClick={() => emailSearch.setQuery(r.address)}
              >
                Link existing: {r.address}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={phoneSearch.query}
              onChange={(e) => phoneSearch.setQuery(e.target.value)}
              placeholder="Type phone..."
            />
            {phoneSearch.results.map((r: any) => (
              <button
                key={r.id}
                type="button"
                className="w-full text-left text-xs border rounded-md px-2 py-1.5 hover:bg-slate-50"
                onClick={() => phoneSearch.setQuery(r.number)}
              >
                Link existing: {r.number}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>LinkedIn URL</Label>
            <Input
              value={linkedinSearch.query}
              onChange={(e) => linkedinSearch.setQuery(e.target.value)}
              placeholder="Type linkedin URL..."
            />
            {linkedinSearch.results.map((r: any) => (
              <button
                key={r.id}
                type="button"
                className="w-full text-left text-xs border rounded-md px-2 py-1.5 hover:bg-slate-50"
                onClick={() => linkedinSearch.setQuery(r.url)}
              >
                Link existing: {r.url}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Organization</Label>
              <Input
                value={orgSearch.query}
                onChange={(e) => {
                  setSelectedOrgId(null);
                  orgSearch.setQuery(e.target.value);
                }}
                placeholder="Type organization..."
              />
              {orgSearch.results.map((r: any) => (
                <button
                  key={r.id}
                  type="button"
                  className="w-full text-left text-xs border rounded-md px-2 py-1.5 hover:bg-slate-50"
                  onClick={() => {
                    setSelectedOrgId(r.id);
                    orgSearch.setQuery(r.name);
                  }}
                >
                  Link existing: {r.name}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Partner" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (personId ? 'Updating...' : 'Creating...') : (personId ? 'Update Contact' : 'Create Contact')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
