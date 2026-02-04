'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Search, Plus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AggregatedProspectPhone, CallStatus } from '@/types/prospect';

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSelectMatch?: (phone: AggregatedProspectPhone) => void;
}

export default function AddContactModal({ isOpen, onClose, onSuccess, onSelectMatch }: AddContactModalProps) {
    const [step, setStep] = useState<'phone' | 'details'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);
    const [phoneMatches, setPhoneMatches] = useState<AggregatedProspectPhone[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
    const [isNewProperty, setIsNewProperty] = useState(false);
    const [propertyName, setPropertyName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [labels, setLabels] = useState<string[]>([]);

    // Property Search
    const [propertySearch, setPropertySearch] = useState('');
    const [propertyResults, setPropertyResults] = useState<any[]>([]);
    const [isSearchingProperties, setIsSearchingProperties] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep('phone');
            setPhoneNumber('');
            setPhoneMatches([]);
            setSelectedProspectId(null);
            setIsNewProperty(false);
            setPropertyName('');
            setAddress('');
            setCity('');
            setState('');
            setZip('');
            setContactName('');
            setContactEmail('');
            setLabels([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (phoneNumber.length >= 3) {
                handleCheckPhone();
            } else {
                setPhoneMatches([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [phoneNumber]);

    const handleCheckPhone = async () => {
        if (!phoneNumber || phoneNumber.length < 3) return;

        setIsCheckingPhone(true);
        try {
            const res = await fetch(`/api/prospect-phones/check?number=${encodeURIComponent(phoneNumber)}`);
            const { data } = await res.json();
            setPhoneMatches(data || []);
        } catch (err) {
            console.error('Error checking phone:', err);
        } finally {
            setIsCheckingPhone(false);
        }
    };

    const exactMatch = phoneMatches.find(p => p.phoneNumber.replace(/\D/g, '') === phoneNumber.replace(/\D/g, ''));

    const handleContinue = () => {
        if (!exactMatch && phoneNumber.length >= 10) {
            setStep('details');
        }
    };

    const handleSearchProperties = async (val: string) => {
        setPropertySearch(val);
        if (val.length < 3) {
            setPropertyResults([]);
            return;
        }

        setIsSearchingProperties(true);
        try {
            const res = await fetch(`/api/prospects?search=${encodeURIComponent(val)}&limit=5`);
            const { data } = await res.json();
            setPropertyResults(data || []);
        } catch (err) {
            console.error('Error searching properties:', err);
        } finally {
            setIsSearchingProperties(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                prospectId: isNewProperty ? null : selectedProspectId,
                propertyName: isNewProperty ? propertyName : undefined,
                address,
                city,
                state,
                zip,
                phoneNumber,
                contactName,
                contactEmail,
                labels
            };

            const res = await fetch('/api/prospects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to add contact');
            }

            onSuccess();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add New Contact</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                        Search for a phone number or property to add to your call list.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-8">
                    {step === 'phone' && (
                        <div className="space-y-6">
                            <div className="grid gap-3">
                                <Label htmlFor="phoneNumber" className="text-base font-semibold">Phone Number</Label>
                                <div className="relative">
                                    <Input
                                        id="phoneNumber"
                                        placeholder="(555) 000-0000"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className={cn(
                                            "h-14 text-lg font-mono border-2",
                                            exactMatch ? "border-destructive focus-visible:ring-destructive" : "border-input"
                                        )}
                                    />
                                    {isCheckingPhone && (
                                        <div className="absolute right-3 top-4">
                                            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                {phoneNumber.length > 0 && phoneNumber.length < 10 && !exactMatch && (
                                    <p className="text-sm text-muted-foreground">Enter at least 10 digits to continue.</p>
                                )}
                            </div>

                            {phoneMatches.length > 0 && (
                                <div className="grid gap-3">
                                    <Label className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Probable Matches</Label>
                                    <div className="border-2 rounded-lg divide-y max-h-[300px] overflow-y-auto bg-card shadow-sm">
                                        {phoneMatches.map(p => {
                                            const isExact = p.phoneNumber.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '');
                                            return (
                                                <div
                                                    key={p.id}
                                                    className={cn(
                                                        "p-4 text-base cursor-pointer transition-colors hover:bg-accent/50 group",
                                                        isExact && "bg-destructive/5 border-l-4 border-l-destructive"
                                                    )}
                                                    onClick={() => {
                                                        if (onSelectMatch) {
                                                            onSelectMatch(p);
                                                            onClose();
                                                        }
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className={cn(
                                                            "font-mono font-bold text-lg",
                                                            isExact ? "text-destructive" : "group-hover:text-primary transition-colors"
                                                        )}>
                                                            {p.phoneNumber}
                                                        </div>
                                                        {isExact && <Badge variant="destructive" className="text-[10px] font-bold h-5 px-2">EXACT MATCH</Badge>}
                                                    </div>
                                                    <div className="text-base font-semibold">{p.contactName || 'No contact name'}</div>
                                                    {p.properties.length > 0 && (
                                                        <div className="text-sm mt-1 text-muted-foreground flex items-center gap-1 flex-wrap">
                                                            <span>{p.properties[0].propertyName}</span>
                                                            {p.propertyCount > 1 && (
                                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">+{p.propertyCount - 1} more</Badge>
                                                            )}
                                                            <span className="opacity-50">·</span>
                                                            <span>{p.properties[0].city}, {p.properties[0].state}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {
                                        exactMatch && (
                                            <p className="text-sm text-destructive font-bold flex items-center gap-2 mt-1">
                                                <AlertCircle className="h-4 w-4" />
                                                Exact numeric match found. Cannot proceed.
                                            </p>
                                        )
                                    }
                                </div>
                            )}

                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-semibold"
                                disabled={!!exactMatch || phoneNumber.length < 10 || isCheckingPhone}
                                onClick={handleContinue}
                            >
                                Continue
                            </Button>
                        </div>
                    )}

                    {
                        step === 'details' && (
                            <div className="space-y-8 max-h-[60vh] overflow-y-auto px-1">
                                {/* Property Section */}
                                <div className="grid gap-4">
                                    <Label className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Property Information</Label>
                                    {!isNewProperty ? (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search existing property..."
                                                    className="pl-10 h-12 text-base border-2"
                                                    value={propertySearch}
                                                    onChange={(e) => handleSearchProperties(e.target.value)}
                                                />
                                                {isSearchingProperties && (
                                                    <div className="absolute right-3 top-3">
                                                        <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {propertyResults.length > 0 && (
                                                <div className="border-2 rounded-lg shadow-sm divide-y overflow-hidden">
                                                    {propertyResults.map(p => (
                                                        <div
                                                            key={p.id}
                                                            className={cn(
                                                                "p-3 text-base cursor-pointer hover:bg-muted transition-colors flex justify-between items-center",
                                                                selectedProspectId === p.id && "bg-primary/10"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedProspectId(p.id);
                                                                setPropertySearch(p.propertyName);
                                                                setPropertyResults([]);
                                                            }}
                                                        >
                                                            <div>
                                                                <div className="font-bold">{p.propertyName}</div>
                                                                <div className="text-sm text-muted-foreground">{p.address}, {p.city}</div>
                                                            </div>
                                                            {selectedProspectId === p.id && <Check className="h-5 w-5 text-primary" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <Button variant="link" size="sm" className="h-8 p-0 text-base" onClick={() => setIsNewProperty(true)}>
                                                <Plus className="h-4 w-4 mr-2" /> Create new property instead
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-6 border-2 p-6 rounded-xl bg-muted/20">
                                            <div className="col-span-2 grid gap-2">
                                                <Label htmlFor="propertyName" className="text-sm font-semibold">Property Name</Label>
                                                <Input id="propertyName" className="h-11 text-base" value={propertyName} onChange={e => setPropertyName(e.target.value)} />
                                            </div>
                                            <div className="col-span-2 grid gap-2">
                                                <Label htmlFor="address" className="text-sm font-semibold">Address</Label>
                                                <Input id="address" className="h-11 text-base" value={address} onChange={e => setAddress(e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                                                <Input id="city" className="h-11 text-base" value={city} onChange={e => setCity(e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="state" className="text-sm font-semibold">State</Label>
                                                <Input id="state" className="h-11 text-base" value={state} onChange={e => setState(e.target.value)} />
                                            </div>
                                            <Button variant="link" size="sm" className="h-8 p-0 text-base col-span-2 justify-start" onClick={() => setIsNewProperty(false)}>
                                                Back to search
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Section */}
                                <div className="grid gap-4 pt-6 border-t-2">
                                    <Label className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Contact Information</Label>
                                    <div className="grid gap-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="contactName" className="text-sm font-semibold">Full Name</Label>
                                                <Input id="contactName" className="h-11 text-base" value={contactName} onChange={e => setContactName(e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="contactEmail" className="text-sm font-semibold">Email Address</Label>
                                                <Input id="contactEmail" type="email" className="h-11 text-base" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="grid gap-3">
                                                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Role / Label</Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {['Owner', 'Property', 'Manager'].map((l) => {
                                                        const isSelected = labels.includes(l);
                                                        return (
                                                            <Button
                                                                key={l}
                                                                type="button"
                                                                variant={isSelected ? "default" : "outline"}
                                                                className={cn(
                                                                    "h-12 px-6 text-base font-semibold transition-all",
                                                                    isSelected ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                                                                )}
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setLabels(labels.filter(i => i !== l));
                                                                    } else {
                                                                        setLabels([...labels, l]);
                                                                    }
                                                                }}
                                                            >
                                                                {l}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div >

                <DialogFooter className="border-t-2 pt-6 gap-3">
                    <Button variant="ghost" className="h-12 px-6 text-base font-medium" onClick={onClose}>Cancel</Button>
                    {step === 'details' && (
                        <Button
                            size="lg"
                            className="h-12 px-8 text-base font-bold"
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!selectedProspectId && !propertyName)}
                        >
                            {isSubmitting && <Loader2 className="animate-spin h-5 w-5 mr-3" />}
                            Create Contact
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}
