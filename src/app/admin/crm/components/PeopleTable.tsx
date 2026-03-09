"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { tagToLabel } from '@/lib/utils';
import { CATEGORY_OPTIONS } from '../constants';
import type { CampaignRecipientSelectionPayload, CampaignRecipientSegment, PeopleFiltersForRecipients } from '@/types/campaign-recipient-selection';

interface PeopleTableProps {
    onRowClick?: (data: any) => void;
    mode?: 'default' | 'campaign_selection';
    campaignId?: string;
    onContinue?: (selection: CampaignRecipientSelectionPayload) => void;
    currentUser?: string | null;
    campaigns?: Campaign[];
}

export function PeopleTable({ onRowClick, mode = 'default', onContinue, currentUser, campaigns = [] }: PeopleTableProps) {
    const router = useRouter();
    const { setPendingRecipientSelection } = useCampaignDraftStore();
    const tableState = useServerTable({ endpoint: "/api/crm/people" });

    const [showLinkedInConfirm, setShowLinkedInConfirm] = useState(false);
    const [linkedInSender, setLinkedInSender] = useState(currentUser || 'Jeff');
    const [linkedInLoading, setLinkedInLoading] = useState(false);
    const [tagOptions, setTagOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectionMode, setSelectionMode] = useState<"page" | "all-matching">("page");
    const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
    const [committedSegments, setCommittedSegments] = useState<
        Array<{ type: "all-matching"; filters: PeopleFiltersForRecipients; exclusions: string[]; count: number }>
    >([]);
    const prevSegmentRef = useRef<{
        key: string;
        filters: PeopleFiltersForRecipients;
        exclusions: string[];
        count: number;
    } | null>(null);

    useEffect(() => {
        fetch('/api/crm/people/tags')
            .then((res) => res.json())
            .then((data) => {
                const tags = data?.tags ?? [];
                setTagOptions(tags.map((t: string) => ({ value: t, label: tagToLabel(t) })));
            })
            .catch(() => setTagOptions([]));
    }, []);

    const selectedIds = Array.from(tableState.selectedIds);
    const visibleIds = useMemo(() => tableState.data.map((person: any) => person.id), [tableState.data]);
    const isAllMatchingMode = selectionMode === "all-matching";
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => tableState.selectedIds.has(id));

    const peopleFiltersForRecipients = useCallback((): PeopleFiltersForRecipients => {
        const filters = tableState.filters || {};
        return {
            search: tableState.search || undefined,
            tag: Array.isArray(filters.tag) && filters.tag.length > 0 ? filters.tag : undefined,
            location: filters.location || undefined,
            role: filters.role || undefined,
            source: filters.source || undefined,
            lead_status: Array.isArray(filters.lead_status) && filters.lead_status.length > 0 ? filters.lead_status : undefined,
            email_status: Array.isArray(filters.email_status) && filters.email_status.length > 0 ? filters.email_status : undefined,
            has_email: filters.has_email || "all",
            has_linkedin: filters.has_linkedin || "all",
            has_phone: filters.has_phone || "all",
            campaign_history: filters.campaign_history ? (Array.isArray(filters.campaign_history) && filters.campaign_history.length === 0 ? undefined : filters.campaign_history) : undefined,
            campaign_response: Array.isArray(filters.campaign_response) && filters.campaign_response.length > 0 ? filters.campaign_response : undefined,
            exclude_campaign_ids: Array.isArray(filters.exclude_campaign_ids) && filters.exclude_campaign_ids.length > 0 ? filters.exclude_campaign_ids : undefined,
        };
    }, [tableState.filters, tableState.search]);

    const getSelectionPayload = useCallback((): CampaignRecipientSelectionPayload => {
        const currentSegment: CampaignRecipientSegment = isAllMatchingMode
            ? {
                  selectAllMatching: true,
                  filters: peopleFiltersForRecipients(),
                  exclusions: Array.from(excludedIds),
                  explicitSelections: [],
              }
            : {
                  selectAllMatching: false,
                  contact_ids: Array.from(tableState.selectedIds),
                  explicitSelections: [],
              };

        const allSegments: CampaignRecipientSegment[] = [
            ...committedSegments.map(
                (s): CampaignRecipientSegment => ({
                    selectAllMatching: true,
                    filters: s.filters,
                    exclusions: s.exclusions,
                    explicitSelections: [],
                })
            ),
            currentSegment,
        ];

        if (allSegments.length === 1) return allSegments[0];
        return { segments: allSegments };
    }, [committedSegments, excludedIds, isAllMatchingMode, peopleFiltersForRecipients, tableState.selectedIds]);

    const selectionCount = isAllMatchingMode
        ? Math.max(tableState.totalCount - excludedIds.size, 0)
        : tableState.selectedIds.size;

    const committedCount = committedSegments.reduce((sum, s) => sum + s.count, 0);
    const totalSelectionCount = committedCount + selectionCount;

    const canSelectAllMatching = !isAllMatchingMode && allVisibleSelected && tableState.totalCount > tableState.selectedIds.size;

    // When filters/search change in all-matching mode: commit previous segment and switch to page mode so the new view doesn't auto-select all
    useEffect(() => {
        if (!isAllMatchingMode) {
            prevSegmentRef.current = null;
            return;
        }
        const currentKey = JSON.stringify([tableState.filters, tableState.search]);
        const currentFilters = peopleFiltersForRecipients();
        const currentExclusions = Array.from(excludedIds);
        const prev = prevSegmentRef.current;
        const currentCount = Math.max(tableState.totalCount - excludedIds.size, 0);
        if (prev && prev.key !== currentKey) {
            setCommittedSegments((s) => [
                ...s,
                { type: "all-matching", filters: prev.filters, exclusions: prev.exclusions, count: prev.count },
            ]);
            setSelectionMode("page");
            tableState.setSelectedIds(new Set());
            setExcludedIds(new Set());
            prevSegmentRef.current = null;
            return;
        }
        prevSegmentRef.current = {
            key: currentKey,
            filters: currentFilters,
            exclusions: currentExclusions,
            count: currentCount,
        };
    }, [tableState.search, tableState.filters, isAllMatchingMode, peopleFiltersForRecipients, excludedIds, tableState]);

    useEffect(() => {
        if (!isAllMatchingMode) return;
        setExcludedIds(new Set());
    }, [tableState.search, tableState.filters, tableState.page, tableState.pageSize, isAllMatchingMode]);

    const handleEnableAllMatching = useCallback(() => {
        setSelectionMode("all-matching");
        tableState.setSelectedIds(new Set());
        setExcludedIds(new Set());
    }, [tableState]);

    const handleDisableAllMatching = useCallback(() => {
        if (isAllMatchingMode && (tableState.totalCount > 0 || excludedIds.size > 0)) {
            const count = Math.max(tableState.totalCount - excludedIds.size, 0);
            setCommittedSegments((s) => [
                ...s,
                {
                    type: "all-matching",
                    filters: peopleFiltersForRecipients(),
                    exclusions: Array.from(excludedIds),
                    count,
                },
            ]);
        }
        prevSegmentRef.current = null;
        setSelectionMode("page");
        tableState.setSelectedIds(new Set());
        setExcludedIds(new Set());
    }, [isAllMatchingMode, tableState.totalCount, excludedIds, peopleFiltersForRecipients, tableState]);

    const handleRowSelection = useCallback((personId: string, checked: boolean) => {
        if (!isAllMatchingMode) {
            tableState.toggleSelection(personId);
            return;
        }

        setExcludedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.delete(personId);
            } else {
                next.add(personId);
            }
            return next;
        });
    }, [isAllMatchingMode, tableState]);

    const toggleAllVisible = useCallback((checked: boolean) => {
        if (!isAllMatchingMode) {
            tableState.toggleAll(visibleIds, checked);
            return;
        }

        setExcludedIds((prev) => {
            const next = new Set(prev);
            visibleIds.forEach((id) => {
                if (checked) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
            });
            return next;
        });
    }, [isAllMatchingMode, visibleIds, tableState]);
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
            <>
                {canSelectAllMatching && (
                    <button
                        type="button"
                        onClick={handleEnableAllMatching}
                        className="text-xs underline text-slate-500 hover:text-slate-700"
                    >
                        Select all {tableState.totalCount} matching
                    </button>
                )}
                {isAllMatchingMode && (
                    <button
                        type="button"
                        onClick={handleDisableAllMatching}
                        className="text-xs underline text-slate-500 hover:text-slate-700"
                    >
                        Select this page only
                    </button>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs ml-2 bg-white"
                    onClick={() => onContinue?.(getSelectionPayload())}
                >
                    <Mail className="w-3 h-3 mr-1" /> Continue
                </Button>
            </>
        ) : (
            <>
                {canSelectAllMatching && (
                    <button
                        type="button"
                        onClick={handleEnableAllMatching}
                        className="text-xs underline text-slate-500 hover:text-slate-700"
                    >
                        Select all {tableState.totalCount} matching
                    </button>
                )}
                {isAllMatchingMode && (
                    <button
                        type="button"
                        onClick={handleDisableAllMatching}
                        className="text-xs underline text-slate-500 hover:text-slate-700 mr-2"
                    >
                        Select this page only
                    </button>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs ml-2 bg-white"
                    onClick={() => {
                        setPendingRecipientSelection(getSelectionPayload());
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

    const getTagBadge = (tag: string) => {
        const lower = tag.toLowerCase();
        if (lower.includes('investor')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
        if (lower.includes('developer')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' };
        if (lower.includes('family_office')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' };
        if (lower.includes('qozb')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
        return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
    };

    return (
        <>
        <CRMShell
            {...tableState}
            selectedCount={totalSelectionCount}
            tagOptions={tagOptions}
            categoryOptions={CATEGORY_OPTIONS.slice()}
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
                                    (isAllMatchingMode
                                        ? visibleIds.every((id) => !excludedIds.has(id))
                                        : tableState.selectedIds.size === tableState.data.length)
                                }
                                onCheckedChange={(checked) => toggleAllVisible(!!checked)}
                            />
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</TableHead>
                        {showContactInfo && (
                            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact Info</TableHead>
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
                                            checked={isAllMatchingMode ? !excludedIds.has(person.id) : tableState.selectedIds.has(person.id)}
                                            onCheckedChange={(checked) => handleRowSelection(person.id, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-semibold text-base text-slate-900">
                                        <div className="flex items-center gap-2">
                                            <span>{person.display_name}</span>
                                            {person.viewing_by && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                                    <Lock className="w-3 h-3" />
                                                    {person.viewing_by === currentUser ? 'You' : person.viewing_by}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-base font-medium text-slate-600">
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
                                                        className={`${styles.bg} ${styles.text} ${styles.border} border shadow-none px-2 py-0.5 text-xs uppercase font-medium tracking-wide rounded`}
                                                    >
                                                        {tagToLabel(tag)}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </TableCell>
                                    {showContactInfo && (
                                        <TableCell className="text-sm">
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

        {totalSelectionCount > 0 && (
            <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 rounded-b-lg">
                <p className="text-base font-bold text-slate-900">{totalSelectionCount.toLocaleString()} PEOPLE SELECTED</p>
            </div>
        )}
        </>
    );
}

