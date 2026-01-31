'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Prospect, CallStatus } from '@/types/prospect';
import { Phone, Calendar, Clock, CheckCircle, XCircle, Voicemail } from 'lucide-react';

interface CallModalProps {
    prospect: Prospect;
    isOpen: boolean;
    onClose: () => void;
    onLogCall: (data: {
        outcome: CallStatus;
        phoneUsed: string;
        notes: string;
        extras: { webinar: boolean; consultation: boolean };
        followUpDate?: string;
        lockoutUntil?: string;
    }) => void;
}

export default function CallModal({ prospect, isOpen, onClose, onLogCall }: CallModalProps) {
    const [outcome, setOutcome] = useState<CallStatus>('called');
    const [phoneUsed, setPhoneUsed] = useState<string>(prospect.phoneNumbers[0]?.number || '');
    const [notes, setNotes] = useState('');
    const [extras, setExtras] = useState({ webinar: false, consultation: false });
    const [followUpDate, setFollowUpDate] = useState('');
    const [lockoutDate, setLockoutDate] = useState('');

    const handleSubmit = () => {
        onLogCall({
            outcome: outcome === 'answered' ? 'pending_signup' : outcome,
            phoneUsed,
            notes,
            extras,
            followUpDate: outcome === 'follow_up' ? followUpDate : undefined,
            lockoutUntil: outcome === 'locked' ? lockoutDate : undefined
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Log Call with {prospect.ownerName}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Phone Selector */}
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number Used</Label>
                        <Select value={phoneUsed} onValueChange={setPhoneUsed}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select phone number" />
                            </SelectTrigger>
                            <SelectContent>
                                {prospect.phoneNumbers.map((p, idx) => (
                                    <SelectItem key={idx} value={p.number}>
                                        {p.contactName ? `${p.contactName} - ` : ''}{p.number} - <span className="text-muted-foreground bg-muted ml-1 rounded px-1.5 py-0.5 text-sm uppercase">{p.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Outcome Buttons */}
                    <div className="grid gap-2">
                        <Label>Call Outcome</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={outcome === 'answered' ? 'default' : 'outline'}
                                onClick={() => setOutcome('answered')}
                                className="justify-start"
                            >
                                <Phone className="mr-2 h-4 w-4" /> Answered
                            </Button>
                            <Button
                                variant={outcome === 'no_answer' ? 'default' : 'outline'}
                                onClick={() => setOutcome('no_answer')}
                                className="justify-start"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> No Answer
                            </Button>
                            <Button
                                variant={outcome === 'voicemail' ? 'default' : 'outline'}
                                onClick={() => setOutcome('voicemail')}
                                className="justify-start"
                            >
                                <Voicemail className="mr-2 h-4 w-4" /> Voicemail
                            </Button>
                            <Button
                                variant={outcome === 'follow_up' ? 'default' : 'outline'}
                                onClick={() => setOutcome('follow_up')}
                                className="justify-start"
                            >
                                <Calendar className="mr-2 h-4 w-4" /> Follow Up
                            </Button>
                            <Button
                                variant={outcome === 'locked' ? 'default' : 'outline'}
                                onClick={() => setOutcome('locked')}
                                className="justify-start"
                            >
                                <Clock className="mr-2 h-4 w-4" /> Lock Out
                            </Button>
                            <Button
                                variant={outcome === 'rejected' ? 'default' : 'outline'}
                                onClick={() => setOutcome('rejected')}
                                className="justify-start"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Rejected
                            </Button>
                        </div>
                    </div>

                    {/* Conditional Follow Up / Lockout Date */}
                    {outcome === 'follow_up' && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="followUp">Follow Up Date</Label>
                            <input
                                type="date"
                                id="followUp"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background"
                                value={followUpDate}
                                onChange={(e) => setFollowUpDate(e.target.value)}
                            />
                        </div>
                    )}

                    {outcome === 'locked' && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="lockoutUntil">Lock Out Until</Label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="date"
                                    id="lockoutUntil"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background"
                                    value={lockoutDate}
                                    onChange={(e) => setLockoutDate(e.target.value)}
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    (Prospect will be locked until this date)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Extras */}
                    <div className="grid gap-2">
                        <Label>Extras Offered</Label>
                        <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="webinar"
                                    checked={extras.webinar}
                                    onCheckedChange={(c) => setExtras(prev => ({ ...prev, webinar: !!c }))}
                                />
                                <Label htmlFor="webinar">Free Webinar</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="consultation"
                                    checked={extras.consultation}
                                    onCheckedChange={(c) => setExtras(prev => ({ ...prev, consultation: !!c }))}
                                />
                                <Label htmlFor="consultation">Post-Close Consultation</Label>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Call Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="What did they say?..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="h-24"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Log Call</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
