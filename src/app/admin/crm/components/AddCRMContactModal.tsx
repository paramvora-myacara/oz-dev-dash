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
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Check } from 'lucide-react';
import { useGlobalEntitySearch } from '../hooks/useGlobalEntitySearch';
import { usePersonNameSearch } from '../hooks/usePersonNameSearch';

interface ContactEntry {
  value: string;
  label: string;
  is_primary: boolean;
}

interface AddCRMContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const emptyEmail = (): ContactEntry => ({ value: '', label: 'work', is_primary: false });
const emptyPhone = (): ContactEntry => ({ value: '', label: 'mobile', is_primary: false });
const emptyLinkedin = (): ContactEntry => ({ value: '', label: 'linkedin', is_primary: false });

function MultiContactField({
  label,
  entries,
  placeholder,
  onAdd,
  onRemove,
  onChange,
  onSetPrimary,
}: {
  label: string;
  entries: ContactEntry[];
  placeholder: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
  onSetPrimary: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="h-6 px-2 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Plus className="w-3 h-3 mr-0.5" />
          Add
        </Button>
      </div>
      <div className="space-y-1.5">
        {entries.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div className="relative flex-1">
              <Input
                value={entry.value}
                placeholder={placeholder}
                onChange={(e) => onChange(idx, e.target.value)}
                className={`h-9 text-sm pr-20 ${entry.is_primary ? 'border-blue-200 bg-blue-50/40' : ''}`}
              />
              {entry.is_primary && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight pointer-events-none">
                  Primary
                </span>
              )}
            </div>
            {/* Primary toggle */}
            <button
              type="button"
              title={entry.is_primary ? 'Primary' : 'Set as primary'}
              onClick={() => onSetPrimary(idx)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${entry.is_primary
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-slate-200 text-slate-200 hover:border-blue-300 hover:text-blue-300'
                }`}
            >
              <Check className="w-3 h-3" />
            </button>
            {/* Remove */}
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddCRMContactModal({ open, onOpenChange, onCreated }: AddCRMContactModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [leadStatus, setLeadStatus] = useState('new');
  const [tags, setTags] = useState('');
  const [title, setTitle] = useState('');
  const [personId, setPersonId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [emails, setEmails] = useState<ContactEntry[]>([{ ...emptyEmail(), is_primary: true }]);
  const [phones, setPhones] = useState<ContactEntry[]>([{ ...emptyPhone(), is_primary: true }]);
  const [linkedins, setLinkedins] = useState<ContactEntry[]>([{ ...emptyLinkedin(), is_primary: true }]);

  const nameSearch = usePersonNameSearch(firstName, lastName);
  const orgSearch = useGlobalEntitySearch('organizations', 'name', 2);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // ── Helpers for multi-entry fields ────────────────────────────────────────

  const makeHandlers = (
    entries: ContactEntry[],
    setEntries: React.Dispatch<React.SetStateAction<ContactEntry[]>>,
    emptyFn: () => ContactEntry,
  ) => ({
    add: () => setEntries((prev) => [...prev, emptyFn()]),
    remove: (idx: number) =>
      setEntries((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        // Ensure at least one primary
        if (prev[idx].is_primary && next.length > 0) next[0].is_primary = true;
        return next;
      }),
    change: (idx: number, value: string) =>
      setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, value } : e))),
    setPrimary: (idx: number) =>
      setEntries((prev) =>
        prev.map((e, i) => ({ ...e, is_primary: i === idx })),
      ),
  });

  const emailHandlers = makeHandlers(emails, setEmails, emptyEmail);
  const phoneHandlers = makeHandlers(phones, setPhones, emptyPhone);
  const linkedinHandlers = makeHandlers(linkedins, setLinkedins, emptyLinkedin);

  // ── Populate from existing person ─────────────────────────────────────────

  const handleSelectPerson = (person: any) => {
    setPersonId(person.id);
    setFirstName(person.first_name || '');
    setLastName(person.last_name || '');
    setLeadStatus(person.lead_status || 'new');
    setTags(person.tags?.join(', ') || '');

    const primaryOrg =
      person.person_organizations?.find((po: any) => po.is_primary) ||
      person.person_organizations?.[0];
    if (primaryOrg) {
      setTitle(primaryOrg.title || '');
      setSelectedOrgId(primaryOrg.organizations?.id);
      orgSearch.setQuery(primaryOrg.organizations?.name || '');
    }

    if (person.person_emails?.length) {
      setEmails(
        person.person_emails.map((pe: any) => ({
          value: pe.emails?.address || '',
          label: pe.label || 'work',
          is_primary: pe.is_primary,
        })),
      );
    }

    if (person.person_phones?.length) {
      setPhones(
        person.person_phones.map((pp: any) => ({
          value: pp.phones?.number || '',
          label: pp.label || 'mobile',
          is_primary: pp.is_primary,
        })),
      );
    }

    if (person.person_linkedin?.length) {
      setLinkedins(
        person.person_linkedin.map((pl: any) => ({
          value: pl.linkedin_profiles?.url || '',
          label: 'linkedin',
          is_primary: pl.is_primary,
        })),
      );
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

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
          .map((t) => t.trim())
          .filter(Boolean),
        emails: emails
          .filter((e) => e.value.trim())
          .map((e) => ({ address: e.value.trim(), is_primary: e.is_primary, label: e.label })),
        phones: phones
          .filter((p) => p.value.trim())
          .map((p) => ({ number: p.value.trim(), is_primary: p.is_primary, label: p.label })),
        linkedin: linkedins
          .filter((l) => l.value.trim())
          .map((l) => ({ url: l.value.trim(), is_primary: l.is_primary })),
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
      handleReset();
      onOpenChange(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPersonId(null);
    setFirstName('');
    setLastName('');
    setLeadStatus('new');
    setTags('');
    setTitle('');
    setSelectedOrgId(null);
    orgSearch.setQuery('');
    setEmails([{ ...emptyEmail(), is_primary: true }]);
    setPhones([{ ...emptyPhone(), is_primary: true }]);
    setLinkedins([{ ...emptyLinkedin(), is_primary: true }]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleReset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{personId ? 'Update Contact' : 'Add Contact'}</DialogTitle>
          <DialogDescription>
            {personId
              ? 'Update existing person and their linked contact entities.'
              : 'Create a new person and link global contact entities when matches exist.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name Row */}
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
                className={personId ? 'bg-blue-50/50 border-blue-200' : ''}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={lastName}
                className={personId ? 'bg-blue-50/50 border-blue-200' : ''}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Existing person link indicator */}
          {personId && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700 font-medium animate-in fade-in slide-in-from-top-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Linking to existing person: {firstName} {lastName}
            </div>
          )}

          {/* Name search suggestions */}
          {nameSearch.results.length > 0 && !personId && (
            <div className="bg-blue-50/50 p-2 rounded-md border border-blue-100 space-y-1.5">
              <p className="text-[10px] font-medium text-blue-600 uppercase tracking-tight px-1">
                Potential Matches
              </p>
              <div className="grid grid-cols-1 gap-1">
                {nameSearch.results.map((r: any) => (
                  <button
                    key={r.id}
                    type="button"
                    className="flex items-center justify-between text-left text-xs bg-white border rounded-md px-3 py-2 hover:border-blue-300 hover:shadow-sm transition-all"
                    onClick={() => handleSelectPerson(r)}
                  >
                    <div>
                      <span className="font-semibold">
                        {r.first_name} {r.last_name}
                      </span>
                      {r.person_organizations?.[0]?.organizations?.name && (
                        <span className="text-slate-500 ml-2">
                          @ {r.person_organizations[0].organizations.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-medium px-1.5 py-0.5 rounded uppercase">
                      Use existing
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lead Status + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lead Status</Label>
              <select
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value)}
                className="w-full h-9 border rounded-md px-3 text-sm bg-background"
              >
                <option value="new">New</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="hot">Hot</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="investor, family_office"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200" />

          {/* Multi-entry: Emails */}
          <MultiContactField
            label="Email Addresses"
            entries={emails}
            placeholder="email@example.com"
            onAdd={emailHandlers.add}
            onRemove={emailHandlers.remove}
            onChange={emailHandlers.change}
            onSetPrimary={emailHandlers.setPrimary}
          />

          {/* Multi-entry: Phones */}
          <MultiContactField
            label="Phone Numbers"
            entries={phones}
            placeholder="+1 (555) 000-0000"
            onAdd={phoneHandlers.add}
            onRemove={phoneHandlers.remove}
            onChange={phoneHandlers.change}
            onSetPrimary={phoneHandlers.setPrimary}
          />

          {/* Multi-entry: LinkedIn */}
          <MultiContactField
            label="LinkedIn Profiles"
            entries={linkedins}
            placeholder="https://linkedin.com/in/..."
            onAdd={linkedinHandlers.add}
            onRemove={linkedinHandlers.remove}
            onChange={linkedinHandlers.change}
            onSetPrimary={linkedinHandlers.setPrimary}
          />

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200" />

          {/* Organization + Title */}
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
              {orgSearch.results.length > 0 && (
                <div className="border rounded-md overflow-hidden shadow-sm bg-white">
                  {orgSearch.results.map((r: any) => (
                    <button
                      key={r.id}
                      type="button"
                      className="w-full text-left text-xs border-b last:border-0 px-3 py-2 hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setSelectedOrgId(r.id);
                        orgSearch.setQuery(r.name);
                      }}
                    >
                      <span className="font-medium">{r.name}</span>
                      {selectedOrgId === r.id && (
                        <Badge className="ml-2 bg-blue-100 text-blue-700 text-[9px] border-blue-200">
                          Linked
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Partner"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving
              ? personId
                ? 'Updating...'
                : 'Creating...'
              : personId
                ? 'Update Contact'
                : 'Create Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
