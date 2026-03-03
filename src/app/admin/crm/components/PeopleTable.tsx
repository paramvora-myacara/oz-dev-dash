"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Linkedin } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useServerTable } from "../hooks/useServerTable";
import { CRMShell } from "./CRMShell";
import { useRouter } from "next/navigation";
import { useCampaignDraftStore } from "@/stores/campaignDraftStore";
import { type Campaign } from '@/types/email-editor';

interface PeopleTableProps {
    onRowClick?: (data: any) => void;
    mode?: 'default' | 'campaign_selection';
    campaignId?: string;
    onContinue?: (selectedIds: string[]) => void;
    currentUser?: string | null;
    campaigns?: Campaign[];
}

export function PeopleTable({ onRowClick, mode = 'default', onContinue, currentUser, campaigns = [] }: PeopleTableProps) {
    const router = useRouter();
    const { setPendingContacts } = useCampaignDraftStore();
    const tableState = useServerTable({ endpoint: "/api/crm/people" });

    const [showLinkedInConfirm, setShowLinkedInConfirm] = useState(false);
    const [linkedInSender, setLinkedInSender] = useState(currentUser || 'Jeff');
    const [linkedInLoading, setLinkedInLoading] = useState(false);

    const selectedIds = Array.from(tableState.selectedIds);
    const hasEmailFilter = tableState.filters.has_email === 'true';
    const hasLinkedinFilter = tableState.filters.has_linkedin === 'true';
    const hasPhoneFilter = tableState.filters.has_phone === 'true';
    const showContactInfo = hasEmailFilter || hasLinkedinFilter || hasPhoneFilter;

    const handleQueueForLinkedIn = async () => {
        setLinkedInLoading(true);
        try {
            const res = await fetch('/api/crm/linkedin-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    person_ids: selectedIds,
                    sender_account: linkedInSender,
                }),
            });
            const result = await res.json();
            if (!res.ok) {
                alert(result.error || 'Failed to queue');
                return;
            }
            alert(`Queued ${result.queued} people for LinkedIn outreach.${result.skipped?.length ? ` Skipped ${result.skipped.length} (no LinkedIn profile or no first name).` : ''}`);
            tableState.setSelectedIds(new Set());
        } catch {
            alert('Failed to queue for LinkedIn');
        } finally {
            setLinkedInLoading(false);
            setShowLinkedInConfirm(false);
        }
    };

    const bulkActions = (
        mode === 'campaign_selection' ? (
            <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs ml-2 bg-white"
                onClick={() => onContinue?.(selectedIds)}
            >
                <Mail className="w-3 h-3 mr-1" /> Continue
            </Button>
        ) : (
            <>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs ml-2 bg-white"
                    onClick={() => {
                        setPendingContacts(selectedIds);
                        router.push('/admin/campaigns/new');
                    }}
                >
                    <Mail className="w-3 h-3 mr-1" /> New Campaign
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs ml-2 bg-white"
                    onClick={() => setShowLinkedInConfirm(true)}
                >
                    <Linkedin className="w-3 h-3 mr-1" /> Queue LinkedIn
                </Button>
            </>
        )
    );

    const tagOptions = [
        { label: "Family Offices", value: "family_office" },
        { label: "QOZBs", value: "qozb_property_contact" },
        { label: "Investor", value: "investor" },
        { label: "Developer", value: "developer" },
    ];

    const getTagBadge = (tag: string) => {
        const lower = tag.toLowerCase();
        if (lower.includes('investor')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
        if (lower.includes('developer')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' };
        if (lower.includes('family_office')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' };
        if (lower.includes('qozb')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
        return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
    };

    return (
        <CRMShell
            {...tableState}
            tagOptions={tagOptions}
            campaigns={campaigns}
            searchPlaceholder="Search people by name..."
            actions={bulkActions}
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="w-12">
                            <Checkbox
                                checked={
                                    tableState.data.length > 0 &&
                                    tableState.selectedIds.size === tableState.data.length
                                }
                                onCheckedChange={(checked) =>
                                    tableState.toggleAll(
                                        tableState.data.map((d: any) => d.id),
                                        !!checked,
                                    )
                                }
                            />
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Name</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Company</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Tags</TableHead>
                        {showContactInfo && (
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact Info</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableState.data.map((person) => (
                        (() => {
                            const lockedByOther = !!person.viewing_by && person.viewing_by !== currentUser;
                            return (
                                <TableRow
                                    key={person.id}
                                    className={`border-slate-50 group ${lockedByOther ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50'}`}
                                    onClick={() => {
                                        if (lockedByOther) return;
                                        onRowClick?.(person);
                                    }}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={tableState.selectedIds.has(person.id)}
                                            onCheckedChange={() => tableState.toggleSelection(person.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-900">
                                        <div className="flex items-center gap-2">
                                            <span>{person.display_name}</span>
                                            {person.viewing_by && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                                    <Lock className="w-3 h-3" />
                                                    {person.viewing_by === currentUser ? 'You' : person.viewing_by}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-600">
                                        {person.person_organizations?.[0]?.organizations?.name || "-"}
                                        {person.person_organizations?.length > 1 &&
                                            ` (+${person.person_organizations.length - 1})`}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {(person.tags || []).map((tag: string) => {
                                                const styles = getTagBadge(tag);
                                                return (
                                                    <Badge
                                                        key={tag}
                                                        className={`${styles.bg} ${styles.text} ${styles.border} border shadow-none px-2 py-0 text-[10px] uppercase font-bold tracking-tight rounded-md`}
                                                    >
                                                        {tag.replace('_', ' ')}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </TableCell>
                                    {showContactInfo && (
                                        <TableCell className="text-xs">
                                            <div className="flex flex-col gap-0.5">
                                                {hasPhoneFilter && (person.person_phones || []).map((ph: any) => (
                                                    <span key={`ph-${ph.phones?.id}`}>{ph.phones?.number}</span>
                                                ))}
                                                {hasEmailFilter && (person.person_emails || []).map((e: any) => (
                                                    <span key={`em-${e.emails?.id}`}>{e.emails?.address}</span>
                                                ))}
                                                {hasLinkedinFilter && (person.person_linkedin || []).map((li: any) => (
                                                    <span key={`li-${li.linkedin_profiles?.id}`} className="truncate max-w-[280px]">
                                                        {li.linkedin_profiles?.url}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })()
                    ))}
                </TableBody>
            </Table>
            <AlertDialog open={showLinkedInConfirm} onOpenChange={setShowLinkedInConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Queue {selectedIds.length} people for LinkedIn outreach?</AlertDialogTitle>
                        <AlertDialogDescription>
                            A connection request with a personalized message will be sent from the selected account during the next automation run (6:30 PM PT daily).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-3">
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Send from account</label>
                        <Select value={linkedInSender} onValueChange={setLinkedInSender}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['Jeff', 'Todd', 'Michael', 'Param', 'Aryan'].map((name) => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleQueueForLinkedIn} disabled={linkedInLoading}>
                            {linkedInLoading ? 'Queuing...' : `Queue ${selectedIds.length} People`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CRMShell>
    );
}

