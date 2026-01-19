'use client';

import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Mail, Globe, User, Building, MapPin, ExternalLink, Calendar, MessageSquare, AlertCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ContactProfile {
    contact: {
        id: string;
        email: string;
        name: string | null;
        company: string | null;
        role: string | null;
        location: string | null;
        source: string | null;
        contactType: string;
        details: Record<string, any>;
        createdAt: string;
    };
    isSignedUp: boolean;
    campaigns: Array<{
        campaignId: string;
        campaignName: string;
        status: string;
        sentAt: string | null;
        repliedAt: string | null;
        bouncedAt: string | null;
        unsubscribedAt: string | null;
        exitReason: string | null;
        currentStepId: string | null;
    }>;
    websiteEvents: Array<{
        eventType: string;
        metadata: Record<string, any>;
        endpoint: string | null;
        createdAt: string;
    }>;
    profile: {
        communityMember: boolean;
        viewedListings: boolean;
        investPageInterested: boolean;
        dashboardAccessed: boolean;
        developerInfo?: {
            locationOfDevelopment: string | null;
            ozStatus: boolean | null;
            geographicalZone: string | null;
        };
        investorInfo?: {
            hasCapitalGain: boolean | null;
            gainSize: string | null;
            gainTiming: string | null;
        };
    };
}

interface ContactDetailPanelProps {
    contactId: string | null;
    onClose: () => void;
}

export const ContactDetailPanel: React.FC<ContactDetailPanelProps> = ({
    contactId,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<ContactProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAllEvents, setShowAllEvents] = useState(false);

    useEffect(() => {
        if (contactId) {
            fetchProfile(contactId);
            setShowAllEvents(false); // Reset to show only 5 events when switching contacts
        } else {
            setProfile(null);
        }
    }, [contactId]);

    const fetchProfile = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/contacts/${id}/profile`);
            if (!response.ok) {
                throw new Error('Failed to fetch contact profile');
            }
            const data = await response.json();
            setProfile(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM d, yyyy h:mm a zzz');
        } catch (e) {
            return 'Invalid date';
        }
    };

    return (
        <Sheet open={!!contactId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-[800px] overflow-y-auto p-0">
                <div className="h-full flex flex-col">
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle className="flex items-center gap-4 text-3xl">
                            <User className="h-6 w-6 text-primary" />
                            {profile ? (
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-3">
                                        <span>{profile.contact.name || 'Anonymous Contact'}</span>
                                        <Badge variant={profile.isSignedUp ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                                            {profile.isSignedUp ? 'Signed Up' : 'Cold Contact'}
                                        </Badge>
                                    </div>
                                    <span className="text-lg font-normal text-muted-foreground">{profile.contact.email}</span>
                                </div>
                            ) : (
                                'Contact Details'
                            )}
                        </SheetTitle>
                    </SheetHeader>

                    {loading ? (
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : error ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                    ) : profile ? (
                        <div className="flex-1 p-6 space-y-8 pb-12">
                            {/* Basic Info Section */}
                            <section className="space-y-4">

                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-base">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building className="h-4 w-4" />
                                        <span>{profile.contact.company || 'No Company'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>{profile.contact.role || 'No Role'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{profile.contact.location || 'Unknown Location'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Globe className="h-4 w-4" />
                                        <span className="truncate" title={profile.contact.source || ''}>
                                            {profile.contact.source || 'Unknown Source'}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Campaigns Section */}
                            <section className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-lg">
                                    <Mail className="h-5 w-5" /> Campaign History
                                </h3>
                                <div className="space-y-2">
                                    {profile.campaigns.length > 0 ? (
                                        profile.campaigns.map((c, i) => (
                                            <Card key={i} className="bg-muted/50 border-none shadow-none">
                                                <CardContent className="p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-medium text-lg">{c.campaignName}</span>
                                                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                                                            {c.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-base text-muted-foreground">
                                                        {c.sentAt && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" /> Sent: {formatDate(c.sentAt)}
                                                            </span>
                                                        )}
                                                        {c.repliedAt && (
                                                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                                                <MessageSquare className="h-3 w-3" /> Replied: {formatDate(c.repliedAt)}
                                                            </span>
                                                        )}
                                                        {c.bouncedAt && (
                                                            <span className="flex items-center gap-1 text-red-600">
                                                                <AlertTriangle className="h-3 w-3" /> Bounced: {formatDate(c.bouncedAt)}
                                                            </span>
                                                        )}
                                                        {c.unsubscribedAt && (
                                                            <span className="flex items-center gap-1 text-orange-600">
                                                                <AlertTriangle className="h-3 w-3" /> Unsubscribed: {formatDate(c.unsubscribedAt)}
                                                            </span>
                                                        )}
                                                        {c.exitReason && (
                                                            <span className="flex items-center gap-1">
                                                                Status: {c.exitReason}
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p className="text-base text-muted-foreground italic">No campaign history found.</p>
                                    )}
                                </div>
                            </section>

                            {/* Contact Details Section */}
                            {profile.contact.details && Object.keys(profile.contact.details).length > 0 && (
                                <section className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                                        <User className="h-5 w-5" /> Contact Details
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-sm">Field</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-sm">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {Object.entries(profile.contact.details).map(([key, value]) => (
                                                    <tr key={key} className="hover:bg-muted/25">
                                                        <td className="px-4 py-3 font-medium text-sm capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {/* Profile Flags / Interest Section */}
                            <section className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5" /> Profile Insights
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className={`p-3 rounded border text-sm flex flex-col gap-1 items-center justify-center text-center ${profile.profile.communityMember ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 opacity-60'}`}>
                                        <span className="font-bold">Community</span>
                                        <span>{profile.profile.communityMember ? 'Member' : 'No'}</span>
                                    </div>
                                    <div className={`p-3 rounded border text-sm flex flex-col gap-1 items-center justify-center text-center ${profile.profile.viewedListings ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 opacity-60'}`}>
                                        <span className="font-bold">Listings</span>
                                        <span>{profile.profile.viewedListings ? 'Viewed' : 'No'}</span>
                                    </div>
                                    <div className={`p-3 rounded border text-sm flex flex-col gap-1 items-center justify-center text-center ${profile.profile.investPageInterested ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 opacity-60'}`}>
                                        <span className="font-bold">Invest Page</span>
                                        <span>{profile.profile.investPageInterested ? 'Interested' : 'No'}</span>
                                    </div>
                                    <div className={`p-3 rounded border text-sm flex flex-col gap-1 items-center justify-center text-center ${profile.profile.dashboardAccessed ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 opacity-60'}`}>
                                        <span className="font-bold">Dashboard</span>
                                        <span>{profile.profile.dashboardAccessed ? 'Accessed' : 'No'}</span>
                                    </div>
                                </div>

                                {/* Developer Specific Info */}
                                {profile.profile.developerInfo && (
                                    <Card className="mt-4 border-dashed bg-muted/20">
                                        <CardHeader className="p-3">
                                            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Developer Profile</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Development Location:</span>
                                                <span className="font-medium">{profile.profile.developerInfo.locationOfDevelopment || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">OZ Status:</span>
                                                <Badge variant={profile.profile.developerInfo.ozStatus ? 'default' : 'outline'} className="h-4 py-0 text-[10px]">
                                                    {profile.profile.developerInfo.ozStatus ? 'IN OZ' : 'NOT IN OZ'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Investor Specific Info */}
                                {profile.profile.investorInfo && (
                                    <Card className="mt-4 border-dashed bg-muted/20">
                                        <CardHeader className="p-3">
                                            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Investor Profile</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Capital Gain:</span>
                                                <span className="font-medium">{profile.profile.investorInfo.hasCapitalGain ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Gain Size:</span>
                                                <span className="font-medium">{profile.profile.investorInfo.gainSize || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Gain Timing:</span>
                                                <span className="font-medium">{profile.profile.investorInfo.gainTiming || 'N/A'}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </section>

                            {/* Website Activity Section */}
                            {profile.isSignedUp && (
                                <section className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                                        <ExternalLink className="h-5 w-5" /> Website Activity
                                    </h3>
                                    <div className="space-y-2">
                                        {profile.websiteEvents.length > 0 ? (
                                            <>
                                                {(showAllEvents ? profile.websiteEvents : profile.websiteEvents.slice(0, 5)).map((e, i) => (
                                                    <div key={i} className="flex gap-3 text-lg border-l-2 border-primary/20 pl-4 py-3 relative">
                                                        <div className="absolute w-3 h-3 rounded-full bg-primary -left-[7px] top-3" />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between font-medium text-base mb-2">
                                                                <span className="font-semibold">{e.eventType.replace(/_/g, ' ')}</span>
                                                                <span className="text-muted-foreground font-normal">{formatDate(e.createdAt)}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded font-mono">
                                                                {JSON.stringify(e.metadata, null, 2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {profile.websiteEvents.length > 5 && !showAllEvents && (
                                                    <div className="pt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setShowAllEvents(true)}
                                                            className="w-full text-sm"
                                                        >
                                                            Load {profile.websiteEvents.length - 5} More Events
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-lg text-muted-foreground italic">No recent activity tracked.</p>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            Select a contact to view details.
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
