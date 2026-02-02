'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Prospect, CallStatus } from '@/types/prospect';
import { Phone, Calendar, Clock, CheckCircle, XCircle, PhoneOff, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { cn } from '@/lib/utils';
import { getTemplate } from '@/lib/email/templates';

interface CallModalProps {
    prospect: Prospect;
    isOpen: boolean;
    onClose: () => void;
    onLogCall: (data: {
        outcome: CallStatus;
        phoneUsed: string;
        email?: string;
        extras: { webinar: boolean; consultation: boolean };
        followUpAt?: string;
        lockoutUntil?: string;
    }) => void;
    preselectedPhone?: string;
    callerName?: string;
}

interface GroupedPhone {
    number: string;
    roles: string[];
    contactName?: string;
    contactEmail?: string;
}

export default function CallModal({ prospect, isOpen, onClose, onLogCall, preselectedPhone, callerName = 'Team Member' }: CallModalProps) {
    const [outcome, setOutcome] = useState<CallStatus>('called');
    const [phoneUsed, setPhoneUsed] = useState<string>(prospect.phoneNumbers?.[0]?.number || '');
    const [email, setEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [extras, setExtras] = useState({
        webinar: prospect.extras?.webinar || false,
        consultation: prospect.extras?.consultation || false
    });
    const [followUpAt, setFollowUpAt] = useState('');
    const [lockoutDate, setLockoutDate] = useState('');
    const [noAnswerFollowUpDays, setNoAnswerFollowUpDays] = useState<number>(1);
    const [showEmailConfirm, setShowEmailConfirm] = useState(false);
    const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);

    // Deduplicate phone numbers by grouping them
    const getGroupedPhones = (): GroupedPhone[] => {
        if (!prospect?.phoneNumbers) return [];

        const grouped = new Map<string, GroupedPhone>();

        prospect.phoneNumbers.forEach((p) => {
            const key = p.number;
            if (grouped.has(key)) {
                const existing = grouped.get(key)!;
                if (!existing.roles.includes(p.label)) {
                    existing.roles.push(p.label);
                }
                // Use the first contact name/email we find
                if (!existing.contactName && p.contactName) {
                    existing.contactName = p.contactName;
                }
                if (!existing.contactEmail && p.contactEmail) {
                    existing.contactEmail = p.contactEmail;
                }
            } else {
                grouped.set(key, {
                    number: p.number,
                    roles: [p.label],
                    contactName: p.contactName,
                    contactEmail: p.contactEmail,
                });
            }
        });

        return Array.from(grouped.values());
    };

    // Reset form when modal opens or prospect changes
    useEffect(() => {
        if (isOpen) {
            setOutcome('called');
            const groupedPhones = getGroupedPhones();
            // Use preselected phone if provided, otherwise use first phone
            const initialPhone = preselectedPhone || groupedPhones[0]?.number || '';
            setPhoneUsed(initialPhone);
            const currentPhone = groupedPhones.find(p => p.number === initialPhone);
            const currentEmail = currentPhone?.contactEmail || '';
            setEmail(currentEmail);
            setOriginalEmail(currentEmail);
            setExtras({
                webinar: prospect.extras?.webinar || false,
                consultation: prospect.extras?.consultation || false
            });
            setFollowUpAt('');
            setLockoutDate('');
            setNoAnswerFollowUpDays(1);
            setShowEmailConfirm(false);
            setIsEmailPreviewOpen(false);
        }
    }, [isOpen, prospect.id, preselectedPhone]);

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
        let calculatedFollowUpAt: string | undefined;
        if (outcome === 'no_answer') {
            const followUpDateObj = new Date();
            followUpDateObj.setDate(followUpDateObj.getDate() + noAnswerFollowUpDays);
            calculatedFollowUpAt = followUpDateObj.toISOString();
        } else if (outcome === 'follow_up') {
            calculatedFollowUpAt = followUpAt ? new Date(followUpAt).toISOString() : undefined;
        }

        // Proceed with submission
        onLogCall({
            outcome: outcome === 'answered' ? 'pending_signup' : outcome,
            phoneUsed,
            email: trimmedEmail ? trimmedEmail : undefined,
            extras,
            followUpAt: calculatedFollowUpAt,
            lockoutUntil: outcome === 'locked' && lockoutDate ? new Date(lockoutDate).toISOString() : undefined
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
        let calculatedFollowUpAt: string | undefined;
        if (outcome === 'no_answer') {
            const followUpDateObj = new Date();
            followUpDateObj.setDate(followUpDateObj.getDate() + noAnswerFollowUpDays);
            calculatedFollowUpAt = followUpDateObj.toISOString();
        } else if (outcome === 'follow_up') {
            calculatedFollowUpAt = followUpAt ? new Date(followUpAt).toISOString() : undefined;
        }

        onLogCall({
            outcome: outcome === 'answered' ? 'pending_signup' : outcome,
            phoneUsed,
            email: trimmedEmail ? trimmedEmail : undefined,
            extras,
            followUpAt: calculatedFollowUpAt,
            lockoutUntil: outcome === 'locked' && lockoutDate ? new Date(lockoutDate).toISOString() : undefined
        });
        setShowEmailConfirm(false);
        onClose();
    };

    const handleCancelEmailUpdate = () => {
        setShowEmailConfirm(false);
    };

    // Generate email preview based on selected options
    const getEmailPreview = () => {
        // Only show preview for outcomes that trigger emails
        const eligibleOutcomes = ['answered', 'no_answer', 'invalid_number'];
        
        // Show preview if outcome is eligible, regardless of email being entered
        if (!eligibleOutcomes.includes(outcome)) {
            return null;
        }

        // Map 'answered' to 'pending_signup' for template lookup
        const finalOutcome = outcome === 'answered' ? 'pending_signup' : outcome;

        try {
            const { subject, html } = getTemplate(finalOutcome, {
                prospectName: prospect.ownerName || 'Developer',
                propertyName: prospect.propertyName || 'Your Property',
                callerName: callerName,
                extras: extras
            });
            return { subject, html };
        } catch (error) {
            return null;
        }
    };

    const emailPreview = getEmailPreview();

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Log Call with {prospect.ownerName}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        {/* Phone Selector */}
                        <div className="grid gap-3">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="phone" className="text-base font-semibold">Phone Number Used</Label>
                                {(() => {
                                    const currentPhone = getGroupedPhones().find(p => p.number === phoneUsed);
                                    const hasEmail = currentPhone?.contactEmail && currentPhone.contactEmail.trim() !== '';
                                    if (!hasEmail) {
                                        return (
                                            <Tooltip content="We can't send a follow-up email without an email address. Please add an email address below." position="top">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            </Tooltip>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            {preselectedPhone ? (
                                // Display read-only phone number when preselected
                                <div className="flex h-12 w-full items-center rounded-md border border-input bg-muted px-4 py-3 text-base">
                                    {(() => {
                                        const currentPhone = getGroupedPhones().find(p => p.number === phoneUsed);
                                        return (
                                            <>
                                                {currentPhone?.contactName && (
                                                    <span className="font-medium mr-2">{currentPhone.contactName} - </span>
                                                )}
                                                <span className="font-mono">{phoneUsed}</span>
                                                {currentPhone?.roles && currentPhone.roles.length > 0 && (
                                                    <span className="text-muted-foreground ml-2">
                                                        ({currentPhone.roles.join(', ')})
                                                    </span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <Select value={phoneUsed} onValueChange={(val) => {
                                    setPhoneUsed(val);
                                    // Auto-sync email if it matches original or is empty
                                    const groupedPhones = getGroupedPhones();
                                    const currentPhone = groupedPhones.find(p => p.number === val);
                                    const newEmail = currentPhone?.contactEmail || '';
                                    if (email === originalEmail || !email) {
                                        setEmail(newEmail);
                                        setOriginalEmail(newEmail);
                                    }
                                }}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="Select phone number" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getGroupedPhones().map((phone, idx) => (
                                            <SelectItem key={`${phone.number}-${idx}`} value={phone.number} className="text-base">
                                                <div className="flex items-center gap-2">
                                                    {phone.contactName ? `${phone.contactName} - ` : ''}
                                                    {phone.number}
                                                    {phone.roles.length > 0 && (
                                                        <span className="text-muted-foreground ml-1">
                                                            ({phone.roles.join(', ')})
                                                        </span>
                                                    )}
                                                    {(!phone.contactEmail || phone.contactEmail.trim() === '') && (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500 ml-auto" />
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Outcome Buttons */}
                        <div className="grid gap-3">
                            <Label className="text-base font-semibold">Call Outcome</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    variant={outcome === 'answered' ? 'default' : 'outline'}
                                    onClick={() => setOutcome('answered')}
                                    className={cn(
                                        "justify-start h-14 text-base px-4 py-3",
                                        outcome === 'answered' && "bg-green-600 hover:bg-green-700 text-white border-green-600"
                                    )}
                                >
                                    <Phone className="mr-2 h-5 w-5" /> Answered
                                </Button>
                                <Button
                                    variant={outcome === 'follow_up' ? 'default' : 'outline'}
                                    onClick={() => setOutcome('follow_up')}
                                    className={cn(
                                        "justify-start h-14 text-base px-4 py-3",
                                        outcome === 'follow_up' && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                                    )}
                                >
                                    <Calendar className="mr-2 h-5 w-5" /> Follow Up
                                </Button>
                                <Button
                                    variant={outcome === 'no_answer' ? 'default' : 'outline'}
                                    onClick={() => setOutcome('no_answer')}
                                    className={cn(
                                        "justify-start h-14 text-base px-4 py-3",
                                        outcome === 'no_answer' && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                                    )}
                                >
                                    <XCircle className="mr-2 h-5 w-5" /> No Answer
                                </Button>
                                <Button
                                    variant={outcome === 'locked' ? 'default' : 'outline'}
                                    onClick={() => setOutcome('locked')}
                                    className={cn(
                                        "justify-start h-14 text-base px-4 py-3",
                                        outcome === 'locked' && "bg-red-600 hover:bg-red-700 text-white border-red-600"
                                    )}
                                >
                                    <Clock className="mr-2 h-5 w-5" /> Lock Out
                                </Button>
                                <Button
                                    variant={outcome === 'invalid_number' ? 'default' : 'outline'}
                                    onClick={() => setOutcome('invalid_number')}
                                    className={cn(
                                        "justify-start h-14 text-base px-4 py-3",
                                        outcome === 'invalid_number' && "bg-red-600 hover:bg-red-700 text-white border-red-600"
                                    )}
                                >
                                    <PhoneOff className="mr-2 h-5 w-5" /> Invalid Number
                                </Button>
                                <Button
                                    variant={outcome === 'rejected' ? 'default' : 'outline'}
                                    onClick={() => setOutcome('rejected')}
                                    className={cn(
                                        "justify-start h-14 text-base px-4 py-3",
                                        outcome === 'rejected' && "bg-red-600 hover:bg-red-700 text-white border-red-600"
                                    )}
                                >
                                    <XCircle className="mr-2 h-5 w-5" /> Rejected
                                </Button>
                            </div>
                        </div>

                        {/* Conditional Follow Up / Lockout Date */}
                        {outcome === 'follow_up' && (
                            <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="followUp" className="text-base font-semibold">Follow Up Date</Label>
                                <input
                                    type="date"
                                    id="followUp"
                                    className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background"
                                    value={followUpAt}
                                    onChange={(e) => setFollowUpAt(e.target.value)}
                                />
                            </div>
                        )}

                        {outcome === 'no_answer' && (
                            <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="noAnswerFollowUp" className="text-base font-semibold">Follow up on</Label>
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
                                        className="w-24 h-12 text-base"
                                    />
                                    <span className="text-base text-muted-foreground">
                                        {noAnswerFollowUpDays === 1 ? 'day' : 'days'} from now
                                        {noAnswerFollowUpDays > 0 && (
                                            <span className="ml-2 text-sm">
                                                ({new Date(Date.now() + noAnswerFollowUpDays * 24 * 60 * 60 * 1000).toLocaleDateString()})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {outcome === 'locked' && (
                            <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="lockoutUntil" className="text-base font-semibold">Lock Out Until</Label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        id="lockoutUntil"
                                        className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background"
                                        value={lockoutDate}
                                        onChange={(e) => setLockoutDate(e.target.value)}
                                    />
                                    <span className="text-base text-muted-foreground whitespace-nowrap">
                                        (Prospect will be locked until this date)
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Extras */}
                        <div className="grid gap-3">
                            <Label className="text-base font-semibold">Extras Offered</Label>
                            <div className="flex gap-6">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="webinar"
                                        checked={extras.webinar}
                                        onCheckedChange={(c) => setExtras(prev => ({ ...prev, webinar: !!c }))}
                                        className="h-5 w-5"
                                    />
                                    <Label htmlFor="webinar" className="text-base cursor-pointer">Free Webinar</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="consultation"
                                        checked={extras.consultation}
                                        onCheckedChange={(c) => setExtras(prev => ({ ...prev, consultation: !!c }))}
                                        className="h-5 w-5"
                                    />
                                    <Label htmlFor="consultation" className="text-base cursor-pointer">Post-Close Consultation</Label>
                                </div>
                            </div>
                        </div>

                        {/* Email Field - Always show, editable */}
                        <div className="grid gap-3">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                                {(() => {
                                    const currentPhone = getGroupedPhones().find(p => p.number === phoneUsed);
                                    const hasEmail = currentPhone?.contactEmail && currentPhone.contactEmail.trim() !== '';
                                    if (!hasEmail) {
                                        return (
                                            <Tooltip content="We can't send a follow-up email without an email address." position="top">
                                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            </Tooltip>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address from call..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={cn(
                                    "h-12 text-base border-2",
                                    (() => {
                                        const currentPhone = getGroupedPhones().find(p => p.number === phoneUsed);
                                        const hasEmail = currentPhone?.contactEmail && currentPhone.contactEmail.trim() !== '';
                                        return !hasEmail ? "border-amber-500 focus:border-amber-600 focus:ring-amber-500" : "";
                                    })()
                                )}
                            />
                            {(() => {
                                const currentPhone = getGroupedPhones().find(p => p.number === phoneUsed);
                                const hasEmail = currentPhone?.contactEmail && currentPhone.contactEmail.trim() !== '';
                                if (!hasEmail) {
                                    return (
                                        <p className="text-base text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            Email address required for follow-up emails
                                        </p>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        {/* Email Preview Section */}
                        {emailPreview && (
                            <div className="grid gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEmailPreviewOpen(!isEmailPreviewOpen)}
                                    className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-md p-3 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Label className="text-base font-semibold cursor-pointer mb-0">
                                            Email Preview
                                        </Label>
                                        <span className="text-sm text-muted-foreground">
                                            ({emailPreview.subject})
                                        </span>
                                    </div>
                                    {isEmailPreviewOpen ? (
                                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>
                                {isEmailPreviewOpen && (
                                    <div className="border rounded-lg overflow-hidden bg-muted/30 animate-in slide-in-from-top-2">
                                        <div className="p-4 bg-muted/50 border-b">
                                            <p className="text-sm font-semibold">Subject: {emailPreview.subject}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                To: {email.trim() || '(Email address will be used from call)'}
                                            </p>
                                        </div>
                                        <div className="p-4 max-h-[500px] overflow-y-auto bg-white dark:bg-gray-900">
                                            <div 
                                                className="email-preview-container"
                                                dangerouslySetInnerHTML={{ __html: emailPreview.html }}
                                                style={{
                                                    maxWidth: '100%',
                                                    margin: '0 auto'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={onClose} className="h-12 text-base px-6">Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                outcome === 'called' || 
                                (outcome === 'no_answer' && (!noAnswerFollowUpDays || noAnswerFollowUpDays < 1))
                            }
                            className="h-12 text-base px-6"
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
