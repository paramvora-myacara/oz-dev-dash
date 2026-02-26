'use client';

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

interface EntitySheetProps {
    sheet: { type: string, id: string, data: any };
    index: number;
    onClose?: () => void;
    onOpenRelated: (type: string, id: string, data: any) => void;
    closeAll: () => void;
}

export function EntitySheet({ sheet, index, onClose, onOpenRelated, closeAll }: EntitySheetProps) {
    const { type, data } = sheet;

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
                                <SheetTitle className="text-2xl">{data.display_name}</SheetTitle>
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
                                <div className="text-sm text-muted-foreground">No organizations linked.</div>
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
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Properties</h4>
                            {data.person_properties?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.person_properties.map((pp: any) => (
                                        <div key={pp.property_id} className="text-sm bg-muted p-2 rounded-md">
                                            <span className="font-medium">{pp.role}:</span> property_id: {pp.property_id}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">No properties linked.</div>
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
                                <SheetTitle className="text-2xl">{data.name}</SheetTitle>
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
                                <div className="text-sm text-muted-foreground">No people found for this company.</div>
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
                                <SheetTitle className="text-2xl">{data.property_name}</SheetTitle>
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
                                <div className="text-sm text-muted-foreground">No people found for this property.</div>
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
