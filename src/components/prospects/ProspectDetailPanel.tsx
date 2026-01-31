'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Prospect } from '@/types/prospect';
import { Phone, Mail, Building, MapPin, Calendar, User, History } from 'lucide-react';

interface ProspectDetailPanelProps {
    prospect: Prospect | null;
    isOpen: boolean;
    onClose: () => void;
    onCallClick: () => void;
}

export default function ProspectDetailPanel({ prospect, isOpen, onClose, onCallClick }: ProspectDetailPanelProps) {
    if (!prospect) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{prospect.callStatus}</Badge>
                        {prospect.state && <Badge variant="secondary">{prospect.state}</Badge>}
                    </div>
                    <SheetTitle className="text-2xl">{prospect.propertyName}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {prospect.ownerName}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    <div className="space-y-6">
                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button onClick={onCallClick} className="w-full">
                                <Phone className="mr-2 h-4 w-4" /> Log Call
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Mail className="mr-2 h-4 w-4" /> Send Email
                            </Button>
                        </div>

                        <Separator />

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{prospect.ownerEmail || 'No email provided'}</span>
                                </div>
                                {(prospect.phoneNumbers || []).map((phone, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium w-20">{phone.label}:</span>
                                        <span>{phone.number}</span>
                                    </div>
                                ))}
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p>{prospect.address}</p>
                                        <p>{prospect.city}, {prospect.state} {prospect.zip}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Property Details */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Property Details</h3>
                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="text-muted-foreground">Market</dt>
                                    <dd className="font-medium">{prospect.market}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Submarket</dt>
                                    <dd className="font-medium">{prospect.submarket}</dd>
                                </div>
                            </dl>
                        </div>

                        <Separator />

                        {/* Mock History */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <History className="h-4 w-4" />
                                History
                            </h3>
                            <div className="space-y-4">
                                {/* Mock entry */}
                                <div className="border rounded-lg p-3 text-sm space-y-2 bg-muted/50">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium">Imported from QOZB List</span>
                                        <span className="text-xs text-muted-foreground">Just now</span>
                                    </div>
                                    <p className="text-muted-foreground">Contact added to prospecting system.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
