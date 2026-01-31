'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Prospect, CallStatus } from '@/types/prospect';
import { Phone, Calendar, Clock, CheckCircle, XCircle, PhoneOff } from 'lucide-react';

interface CallModalProps {
    prospect: Prospect;
    isOpen: boolean;
    onClose: () => void;
    onLogCall: (data: {
        outcome: CallStatus;
        phoneUsed: string;
        email?: string;
        extras: { webinar: boolean; consultation: boolean };
        followUpDate?: string;
        lockoutUntil?: string;
    }) => void;
}

export default function CallModal({ prospect, isOpen, onClose, onLogCall }: CallModalProps) {
    const [outcome, setOutcome] = useState<CallStatus>('called');
    const [phoneUsed, setPhoneUsed] = useState<string>(prospect.phoneNumbers[0]?.number || '');
    const [email, setEmail] = useState(prospect.ownerEmail || '');
    const [originalEmail, setOriginalEmail] = useState<string>(prospect.ownerEmail || '');
    const [extras, setExtras] = useState({ webinar: false, consultation: false });
    const [followUpDate, setFollowUpDate] = useState('');
    const [lockoutDate, setLockoutDate] = useState('');
    const [noAnswerFollowUpDays, setNoAnswerFollowUpDays] = useState<number>(1);
    const [showEmailConfirm, setShowEmailConfirm] = useState(false);

    // Reset form when modal opens or prospect changes
    useEffect(() => {
        if (isOpen) {
            setOutcome('called');
            setPhoneUsed(prospect.phoneNumbers[0]?.number || '');
            const currentEmail = prospect.ownerEmail || '';
            setEmail(currentEmail);
            setOriginalEmail(currentEmail);
            setExtras({ webinar: false, consultation: false });
            setFollowUpDate('');
            setLockoutDate('');
            setNoAnswerFollowUpDays(1);
            setShowEmailConfirm(false);
        }
    }, [isOpen, prospect.id, prospect.ownerEmail]);

    const handleSubmit = () => {
        // Validate no_answer requires follow-up days
        if (outcome === 'no_answer' && (!noAnswerFollowUpDays || noAnswerFollowUpDays < 1)) {
            return; // Don't submit if no follow-up days set
        }

        const trimmedEmail = email.trim();
        const originalTrimmed = originalEmail.trim();
        
        // Check if email was changed and original email existed
        if (originalTrimmed && trimmedEmail !== originalTrimmed) {
            setShowEmailConfirm(true);
            return;
        }

        // Calculate follow-up date for no_answer
        let calculatedFollowUpDate: string | undefined;
        if (outcome === 'no_answer') {
            const followUpDateObj = new Date();
            followUpDateObj.setDate(followUpDateObj.getDate() + noAnswerFollowUpDays);
            calculatedFollowUpDate = followUpDateObj.toISOString().split('T')[0];
        } else if (outcome === 'follow_up') {
            calculatedFollowUpDate = followUpDate;
        }

        // Proceed with submission
        onLogCall({
            outcome: outcome === 'answered' ? 'pending_signup' : outcome,
            phoneUsed,
            email: trimmedEmail ? trimmedEmail : undefined,
            extras,
            followUpDate: calculatedFollowUpDate,
            lockoutUntil: outcome === 'locked' ? lockoutDate : undefined
        });
        onClose();
    };

    const handleConfirmEmailUpdate = () => {
        // Validate no_answer requires follow-up days
        if (outcome === 'no_answer' && (!noAnswerFollowUpDays || noAnswerFollowUpDays < 1)) {
            setShowEmailConfirm(false);
            return;
        }

        const trimmedEmail = email.trim();

        // Calculate follow-up date for no_answer
        let calculatedFollowUpDate: string | undefined;
        if (outcome === 'no_answer') {
            const followUpDateObj = new Date();
            followUpDateObj.setDate(followUpDateObj.getDate() + noAnswerFollowUpDays);
            calculatedFollowUpDate = followUpDateObj.toISOString().split('T')[0];
        } else if (outcome === 'follow_up') {
            calculatedFollowUpDate = followUpDate;
        }

        onLogCall({
            outcome: outcome === 'answered' ? 'pending_signup' : outcome,
            phoneUsed,
            email: trimmedEmail ? trimmedEmail : undefined,
            extras,
            followUpDate: calculatedFollowUpDate,
            lockoutUntil: outcome === 'locked' ? lockoutDate : undefined
        });
        setShowEmailConfirm(false);
        onClose();
    };

    const handleCancelEmailUpdate = () => {
        setShowEmailConfirm(false);
    };

    return (
        <>
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
                                variant={outcome === 'invalid_number' ? 'default' : 'outline'}
                                onClick={() => setOutcome('invalid_number')}
                                className="justify-start"
                            >
                                <PhoneOff className="mr-2 h-4 w-4" /> Invalid Number
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

                    {outcome === 'no_answer' && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="noAnswerFollowUp">Follow up on</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="noAnswerFollowUp"
                                    type="number"
                                    min="1"
                                    value={noAnswerFollowUpDays}
                                    onChange={(e) => {
                                        const days = parseInt(e.target.value) || 1;
                                        setNoAnswerFollowUpDays(Math.max(1, days));
                                    }}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">
                                    {noAnswerFollowUpDays === 1 ? 'day' : 'days'} from now
                                    {noAnswerFollowUpDays > 0 && (
                                        <span className="ml-2 text-xs">
                                            ({new Date(Date.now() + noAnswerFollowUpDays * 24 * 60 * 60 * 1000).toLocaleDateString()})
                                        </span>
                                    )}
                                </span>
                            </div>
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

                    {/* Email Field - Always show, editable */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address from call..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={outcome === 'no_answer' && (!noAnswerFollowUpDays || noAnswerFollowUpDays < 1)}
                        >
                            Log Call
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Email Update Confirmation Dialog */}
            <Dialog open={showEmailConfirm} onOpenChange={setShowEmailConfirm}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Email Address?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            The email address for this prospect will be updated.
                        </p>
                        <div className="space-y-2">
                            <div>
                                <Label className="text-xs text-muted-foreground">Current Email:</Label>
                                <p className="text-sm font-medium">{originalEmail || '(none)'}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">New Email:</Label>
                                <p className="text-sm font-medium">{email.trim() || '(none)'}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelEmailUpdate}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmEmailUpdate}>
                            Update Email & Log Call
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
