'use client';

import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface EntitySheetProps {
    sheet: { type: string, id: string, data: any };
    index: number;
    onClose?: () => void;
    onOpenRelated: (type: string, id: string, data: any) => void;
    closeAll: () => void;
}

export function EntitySheet({ sheet, index, onClose, onOpenRelated, closeAll }: EntitySheetProps) {
    const { type, id, data: initialData } = sheet;
    const [data, setData] = useState<any>(initialData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        // Instantly hydrate from initialData if it changes
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
                    if (mounted && fullData && !fullData.error) {
                        setData(fullData);
                    }
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

    const handleOpenChange = (open: boolean) => {
        if (!open && onClose) {
            onClose();
        }
    };

    // People View
    if (type === 'person') {
        return (
            <Sheet open={true} onOpenChange={handleOpenChange}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <SheetTitle className="text-2xl flex items-center gap-2">
                                    {data.display_name}
                                    {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                                </SheetTitle>
                                <SheetDescription>
                                    {data.person_organizations?.map((po: any) => po.title).join(', ') || 'No title'}
                                </SheetDescription>
                            </div>
                            <Badge>{data.lead_status}</Badge>
                        </div>
                    </SheetHeader>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">Organizations</h4>
                            {data.person_organizations?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.person_organizations.map((po: any) => (
                                        <div
                                            key={po.organizations.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                                            onClick={() => onOpenRelated('company', po.organizations.id, po.organizations)}
                                        >
                                            <div className="font-medium">{po.organizations.name}</div>
                                            <div className="text-sm text-muted-foreground">{po.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No organizations linked.'}</div>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Contact Methods</h4>
                            <div className="space-y-3">
                                {data.person_emails?.map((pe: any) => (
                                    <div key={pe.emails.id} className="text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Email:</span> {pe.emails.address}
                                        {pe.is_primary && <Badge variant="secondary" className="ml-2 text-[10px]">Primary</Badge>}
                                    </div>
                                ))}
                                {data.person_phones?.map((pp: any) => (
                                    <div key={pp.phones.id} className="text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Phone:</span> {pp.phones.number}
                                        {pp.is_primary && <Badge variant="secondary" className="ml-2 text-[10px]">Primary</Badge>}
                                    </div>
                                ))}
                                {data.person_linkedin?.map((pl: any) => (
                                    <div key={pl.linkedin_profiles.id} className="text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">LinkedIn:</span>{' '}
                                        <a href={pl.linkedin_profiles.url} target="_blank" className="text-blue-500 hover:underline">Profile</a>
                                    </div>
                                ))}
                                {!loading && !data.person_emails?.length && !data.person_phones?.length && !data.person_linkedin?.length && (
                                    <div className="text-sm text-muted-foreground">No contact methods found.</div>
                                )}
                                {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Properties</h4>
                            {data.person_properties?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.person_properties.map((pp: any) => (
                                        <div key={pp.property_id} className="text-sm bg-muted p-2 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                                            onClick={() => pp.properties && onOpenRelated('property', pp.property_id, pp.properties)}
                                        >
                                            <span className="font-medium flex items-center gap-2">
                                                {pp.properties?.property_name || `Property ID: ${pp.property_id}`}
                                                <Badge variant="outline" className="text-[10px]">{pp.role}</Badge>
                                            </span>
                                            {pp.properties?.city && pp.properties?.state && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {pp.properties.city}, {pp.properties.state}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No properties linked.'}</div>
                            )}
                        </div>

                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Metadata Details</h4>
                            <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded-md overflow-x-auto">
                                {JSON.stringify(data.details, null, 2)}
                            </pre>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Company View
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
                            <h4 className="font-semibold mb-2">Location & Details</h4>
                            <div className="text-sm space-y-1">
                                {data.address && <div><span className="font-medium">Address:</span> {data.address}, {data.city}, {data.state} {data.zip}</div>}
                                {data.website && <div><span className="font-medium">Website:</span> <a href={data.website} target="_blank" className="text-blue-500 hover:underline">{data.website}</a></div>}
                                {data.company_email && <div><span className="font-medium">Company Email:</span> {data.company_email}</div>}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">People</h4>
                            {data.person_organizations?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.person_organizations.map((po: any) => (
                                        <div
                                            key={po.people.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                                            onClick={() => onOpenRelated('person', po.people.id, po.people)}
                                        >
                                            <div className="font-medium">{po.people.display_name}</div>
                                            <div className="text-sm text-muted-foreground">{po.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No people found for this company.'}</div>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Properties</h4>
                            {data.property_organizations?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.property_organizations.map((po: any) => (
                                        <div
                                            key={po.properties.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                                            onClick={() => onOpenRelated('property', po.properties.id, po.properties)}
                                        >
                                            <div className="font-medium flex items-center gap-2">
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
                            <h4 className="font-semibold mb-2">Details (JSONB)</h4>
                            <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded-md overflow-x-auto">
                                {JSON.stringify(data.details, null, 2)}
                            </pre>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Property View
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
                            <h4 className="font-semibold mb-2">Property Details</h4>
                            <div className="text-sm space-y-1">
                                {data.address && <div><span className="font-medium">Address:</span> {data.address}</div>}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Linked Organizations</h4>
                            {data.property_organizations?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.property_organizations.map((po: any) => (
                                        <div
                                            key={po.organizations.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                                            onClick={() => onOpenRelated('company', po.organizations.id, po.organizations)}
                                        >
                                            <div className="font-medium">{po.organizations.name}</div>
                                            <div className="text-sm text-muted-foreground">{po.role}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No organizations linked.'}</div>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Linked People</h4>
                            {data.person_properties?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.person_properties.map((pp: any) => (
                                        <div
                                            key={pp.people.id}
                                            className="p-3 bg-muted rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                                            onClick={() => onOpenRelated('person', pp.people.id, pp.people)}
                                        >
                                            <div className="font-medium">{pp.people.display_name}</div>
                                            <div className="text-sm text-muted-foreground">{pp.role}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No people found for this property.'}</div>
                            )}
                        </div>

                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Metadata Details (JSONB)</h4>
                            <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded-md overflow-x-auto">
                                {JSON.stringify(data.details, null, 2)}
                            </pre>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return null;
}
