'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useGlobalEntitySearch } from '../hooks/useGlobalEntitySearch';
import { Phone, Calendar, XCircle, PhoneOff, AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTemplate } from '@/lib/email/templates';

type CallOutcome = 'answered' | 'no_answer' | 'follow_up' | 'invalid_number' | 'rejected' | 'do_not_contact';

interface CRMCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: any;
  currentUser?: string | null;
  onLogged?: () => void;
}

export function CRMCallModal({ open, onOpenChange, person, currentUser, onLogged }: CRMCallModalProps) {
  const [outcome, setOutcome] = useState<CallOutcome>('answered');
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');
  const [noAnswerFollowUpDays, setNoAnswerFollowUpDays] = useState<number>(1);
  const [skipEmail, setSkipEmail] = useState(false);
  const [extras, setExtras] = useState({
    webinar: false,
    consultation: false
  });
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const phones = useMemo(() => person?.person_phones || [], [person]);
  const emails = useMemo(() => person?.person_emails || [], [person]);

  const {
    query: phoneQuery,
    setQuery: setPhoneQuery,
    results: phoneMatches,
  } = useGlobalEntitySearch('phones', 'number');

  const {
    query: emailQuery,
    setQuery: setEmailQuery,
    results: emailMatches,
  } = useGlobalEntitySearch('emails', 'address');

  useEffect(() => {
    if (open) {
      setOutcome('answered');
      setSelectedPhoneId(phones[0]?.phone_id || phones[0]?.phones?.id || null);
      setSelectedEmailId(emails[0]?.email_id || emails[0]?.emails?.id || null);
      setManualEmail('');
      setFollowUpAt('');
      setNoAnswerFollowUpDays(1);
      setSkipEmail(false);
      setExtras({ webinar: false, consultation: false });
      setIsEmailPreviewOpen(false);
      setPhoneQuery('');
      setEmailQuery('');
    }
  }, [open]);

  const selectedPhone = phones.find((p: any) => (p.phone_id || p.phones?.id) === selectedPhoneId);
  const selectedEmail = emails.find((e: any) => (e.email_id || e.emails?.id) === selectedEmailId);

  const targetEmail = manualEmail.trim() || selectedEmail?.emails?.address || emailQuery || null;
  const hasTargetEmail = !!targetEmail;

  const getEmailPreview = () => {
    if (skipEmail || !hasTargetEmail) return null;
    const eligibleOutcomes = ['answered', 'no_answer', 'invalid_number'];
    if (!eligibleOutcomes.includes(outcome)) return null;

    const finalEmailOutcome = outcome === 'answered' ? 'pending_signup' : outcome;
    const propertyName = person?.person_properties?.[0]?.properties?.property_name || 'your project';

    try {
      const { subject, html } = getTemplate(finalEmailOutcome, {
        prospectName: person?.display_name || 'Developer',
        propertyName: propertyName,
        callerName: currentUser || 'OZ Listings Team',
        extras
      });
      return { subject, html };
    } catch (err) {
      console.error('Preview error:', err);
      return null;
    }
  };

  const emailPreview = getEmailPreview();

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let calculatedFollowUpAt = followUpAt;
      if (outcome === 'no_answer') {
        const date = new Date();
        date.setDate(date.getDate() + noAnswerFollowUpDays);
        calculatedFollowUpAt = date.toISOString();
      }

      const payload = {
        outcome,
        caller_name: currentUser || null,
        phone_id: selectedPhoneId,
        phone_number: selectedPhone?.phones?.number || phoneQuery || null,
        email_id: selectedEmailId,
        email: targetEmail,
        follow_up_at: calculatedFollowUpAt || null,
        skip_email: skipEmail,
        extras: extras
      };

      const res = await fetch(`/api/backend-proxy/crm/people/${person.id}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to log call');
      }

      onLogged?.();
      onOpenChange(false);
    } catch (err: any) {
      alert(err.message || 'Failed to log call');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Log Call with {person?.display_name || 'contact'}</DialogTitle>
          <DialogDescription className="text-lg">
            Record call outcome for this individual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Outcome Selection Buttons */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Call Outcome</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={outcome === 'answered' ? 'default' : 'outline'}
                onClick={() => setOutcome('answered')}
                className={cn("justify-start h-14 text-base px-4", outcome === 'answered' && "bg-green-600 hover:bg-green-700 text-white")}
              >
                <Phone className="mr-2 h-5 w-5" /> Answered
              </Button>
              <Button
                variant={outcome === 'no_answer' ? 'default' : 'outline'}
                onClick={() => setOutcome('no_answer')}
                className={cn("justify-start h-14 text-base px-4", outcome === 'no_answer' && "bg-yellow-500 hover:bg-yellow-600 text-white")}
              >
                <Calendar className="mr-2 h-5 w-5" /> No Answer
              </Button>
              <Button
                variant={outcome === 'follow_up' ? 'default' : 'outline'}
                onClick={() => setOutcome('follow_up')}
                className={cn("justify-start h-14 text-base px-4", outcome === 'follow_up' && "bg-yellow-500 hover:bg-yellow-600 text-white")}
              >
                <Clock className="mr-2 h-5 w-5" /> Follow Up
              </Button>
              <Button
                variant={outcome === 'invalid_number' ? 'default' : 'outline'}
                onClick={() => setOutcome('invalid_number')}
                className={cn("justify-start h-14 text-base px-4", outcome === 'invalid_number' && "bg-red-600 hover:bg-red-700 text-white")}
              >
                <PhoneOff className="mr-2 h-5 w-5" /> Invalid Number
              </Button>
              <Button
                variant={outcome === 'rejected' ? 'default' : 'outline'}
                onClick={() => setOutcome('rejected')}
                className={cn("justify-start h-14 text-base px-4", outcome === 'rejected' && "bg-red-600 hover:bg-red-700 text-white")}
              >
                <XCircle className="mr-2 h-5 w-5" /> Rejected
              </Button>
              <Button
                variant={outcome === 'do_not_contact' ? 'default' : 'outline'}
                onClick={() => setOutcome('do_not_contact')}
                className={cn("justify-start h-14 text-base px-4", outcome === 'do_not_contact' && "bg-red-600 hover:bg-red-700 text-white")}
              >
                <XCircle className="mr-2 h-5 w-5" /> DNC
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Phone Selection */}
              <div className="space-y-2">
                <Label className="font-semibold text-sm">Phone Used</Label>
                {phones.length > 0 ? (
                  <select
                    value={selectedPhoneId || ''}
                    onChange={(e) => setSelectedPhoneId(e.target.value)}
                    className="w-full h-10 border rounded-md px-3 text-sm"
                  >
                    {phones.map((p: any) => {
                      const pid = p.phone_id || p.phones?.id;
                      return (
                        <option key={pid} value={pid}>
                          {p.phones?.number}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <Input placeholder="Type phone number..." value={phoneQuery} onChange={(e) => setPhoneQuery(e.target.value)} />
                )}
              </div>

              {/* Email Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="font-semibold text-sm">Email Target</Label>
                  {!hasTargetEmail && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                {emails.length > 0 && (
                  <select
                    value={selectedEmailId || ''}
                    onChange={(e) => setSelectedEmailId(e.target.value)}
                    className="w-full h-10 border rounded-md px-3 text-sm mb-2"
                  >
                    <option value="">No linked email</option>
                    {emails.map((em: any) => {
                      const eid = em.email_id || em.emails?.id;
                      return (
                        <option key={eid} value={eid}>
                          {em.emails?.address}
                        </option>
                      );
                    })}
                  </select>
                )}
                <Input
                  placeholder="Capture new email..."
                  value={manualEmail}
                  onChange={(e) => {
                    setManualEmail(e.target.value);
                    setEmailQuery(e.target.value);
                  }}
                  className={cn(!hasTargetEmail && "border-amber-500 focus:ring-amber-500")}
                />
              </div>

              {/* Extras */}
              <div className="space-y-2">
                <Label className="font-semibold text-sm">Extras Offered</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="webinar"
                      checked={extras.webinar}
                      onCheckedChange={(c) => setExtras(v => ({ ...v, webinar: !!c }))}
                    />
                    <Label htmlFor="webinar" className="text-sm cursor-pointer">Free Webinar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consultation"
                      checked={extras.consultation}
                      onCheckedChange={(c) => setExtras(v => ({ ...v, consultation: !!c }))}
                    />
                    <Label htmlFor="consultation" className="text-sm cursor-pointer">Consultation</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Follow Up Logic */}
              {outcome === 'no_answer' && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-md border text-sm">
                  <Label className="font-semibold">Automatic Follow-up</Label>
                  <div className="flex items-center gap-2">
                    <span>Follow up on</span>
                    <Input
                      type="number"
                      min="1"
                      className="w-16 h-8"
                      value={noAnswerFollowUpDays}
                      onChange={(e) => setNoAnswerFollowUpDays(parseInt(e.target.value) || 1)}
                    />
                    <span>days from now</span>
                  </div>
                </div>
              )}

              {outcome === 'follow_up' && (
                <div className="space-y-2">
                  <Label>Scheduled Follow Up</Label>
                  <Input
                    type="datetime-local"
                    value={followUpAt}
                    onChange={(e) => setFollowUpAt(e.target.value)}
                  />
                </div>
              )}

              {/* Skip Logic */}
              {['answered', 'no_answer', 'invalid_number'].includes(outcome) && (
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox id="skip-follow-up" checked={skipEmail} onCheckedChange={(c) => setSkipEmail(!!c)} />
                  <Label htmlFor="skip-follow-up" className="text-sm font-medium">Skip follow-up email</Label>
                </div>
              )}
            </div>
          </div>

          {/* Email Preview Section */}
          {emailPreview && (
            <div className="border rounded-md overflow-hidden bg-white">
              <button
                onClick={() => setIsEmailPreviewOpen(!isEmailPreviewOpen)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors border-b"
              >
                <div className="flex items-center gap-2">
                  <Label className="font-semibold cursor-pointer">Email Preview</Label>
                  <span className="text-xs text-muted-foreground">({emailPreview.subject})</span>
                </div>
                {isEmailPreviewOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isEmailPreviewOpen && (
                <div className="p-4 max-h-[400px] overflow-y-auto">
                  <div
                    key={emailPreview.html}
                    style={{ pointerEvents: 'none' }}
                    dangerouslySetInnerHTML={{ __html: emailPreview.html }}
                  />
                </div>
              )}
            </div>
          )}

          {!hasTargetEmail && ['answered', 'no_answer', 'invalid_number'].includes(outcome) && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Email is required to send the follow-up. Please capture an email or "Skip follow-up" to proceed.</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || (!skipEmail && !hasTargetEmail && ['answered', 'no_answer', 'invalid_number'].includes(outcome))}
            className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
          >
            {saving ? 'Logging...' : 'Log Call'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
