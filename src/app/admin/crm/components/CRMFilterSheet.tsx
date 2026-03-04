"use client";

import React from "react";
import { Filter, X, Search, RotateCcw } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { type Campaign } from "@/types/email-editor";
import { CATEGORY_OPTIONS, CATEGORY_VALUES } from "../constants";

interface CRMFilterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: Record<string, any>;
    setFilter: (key: string, value: any) => void;
    clearFilters: () => void;
    tagOptions: { label: string; value: string }[];
    campaigns: Campaign[];
}

const LEAD_STATUS_OPTIONS = [
    { label: "New", value: "new" },
    { label: "Warm", value: "warm" },
    { label: "Hot", value: "hot" },
    { label: "Customer", value: "customer" },
    { label: "Lost", value: "lost" },
    { label: "Do Not Contact", value: "do_not_contact" },
];

export function CRMFilterSheet({
    open,
    onOpenChange,
    filters,
    setFilter,
    clearFilters,
    tagOptions,
    campaigns,
}: CRMFilterSheetProps) {
    const selectedTags = filters.tag || [];
    const categoryValueSet = new Set<string>(CATEGORY_VALUES);
    const selectedStatuses = filters.lead_status || [];
    const selectedCampaignHistory = filters.campaign_history || 'all'; // can be 'any', 'none', or list of IDs
    const selectedCampaignResponses = filters.campaign_response || [];
    const excludedCampaignIds = filters.exclude_campaign_ids || [];

    const toggleCampaignResponse = (status: string) => {
        const next = selectedCampaignResponses.includes(status)
            ? selectedCampaignResponses.filter((s: string) => s !== status)
            : [...selectedCampaignResponses, status];
        setFilter("campaign_response", next);
    };

    const toggleExcludeCampaign = (id: string) => {
        const next = excludedCampaignIds.includes(id)
            ? excludedCampaignIds.filter((cid: string) => cid !== id)
            : [...excludedCampaignIds, id];
        setFilter("exclude_campaign_ids", next);
    };

    const toggleCampaignPresence = (id: string) => {
        let current = Array.isArray(filters.campaign_history) ? filters.campaign_history : [];
        const next = current.includes(id)
            ? current.filter((cid: string) => cid !== id)
            : [...current, id];
        setFilter("campaign_history", next);
    };

    const toggleTag = (tag: string) => {
        const next = selectedTags.includes(tag)
            ? selectedTags.filter((t: string) => t !== tag)
            : [...selectedTags, tag];
        setFilter("tag", next);
    };

    const toggleStatus = (status: string) => {
        const next = selectedStatuses.includes(status)
            ? selectedStatuses.filter((s: string) => s !== status)
            : [...selectedStatuses, status];
        setFilter("lead_status", next);
    };

    const activeFilterCount =
        (selectedTags.length) +
        (selectedStatuses.length) +
        (filters.location ? 1 : 0) +
        (filters.role ? 1 : 0) +
        (filters.source ? 1 : 0) +
        (filters.email_status ? 1 : 0) +
        (filters.has_email && filters.has_email !== 'all' ? 1 : 0) +
        (filters.has_linkedin && filters.has_linkedin !== 'all' ? 1 : 0) +
        (filters.has_phone && filters.has_phone !== 'all' ? 1 : 0) +
        (selectedCampaignHistory !== 'all' ? 1 : 0) +
        (selectedCampaignResponses.length > 0 ? 1 : 0) +
        (excludedCampaignIds.length > 0 ? 1 : 0);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl flex flex-col h-full">
                <SheetHeader className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <SheetTitle className="flex items-center gap-2 text-xl">
                                <Filter className="w-5 h-5 text-slate-900" />
                                Advanced Filters
                                {activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-1 bg-slate-100 text-slate-900 border-none">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </SheetTitle>
                            <SheetDescription>
                                Refine your CRM data with granular segmenting.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 py-4">
                    {/* 1. Categories (top) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Categories</h4>
                            {selectedTags.some((t: string) => categoryValueSet.has(t)) && (
                                <button
                                    onClick={() => setFilter("tag", selectedTags.filter((t: string) => !categoryValueSet.has(t)))}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            {CATEGORY_OPTIONS.map((opt) => (
                                <label
                                    key={opt.value}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-all group"
                                >
                                    <Checkbox
                                        checked={selectedTags.includes(opt.value)}
                                        onCheckedChange={() => toggleTag(opt.value)}
                                        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                    />
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* 2. Contact Coverage Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Contact Coverage</h4>
                            {((filters.has_email && filters.has_email !== 'all') || (filters.has_linkedin && filters.has_linkedin !== 'all') || (filters.has_phone && filters.has_phone !== 'all')) && (
                                <button
                                    onClick={() => {
                                        setFilter("has_email", "all");
                                        setFilter("has_linkedin", "all");
                                        setFilter("has_phone", "all");
                                    }}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Email Address</label>
                                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    {['all', 'true', 'false'].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setFilter('has_email', val)}
                                            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all uppercase tracking-wide ${(filters.has_email || 'all') === val
                                                ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold"
                                                : "text-slate-400 hover:text-slate-600 font-medium"
                                                }`}
                                        >
                                            {val === 'all' ? 'Any' : val === 'true' ? 'Has' : 'None'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">LinkedIn Profile</label>
                                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    {['all', 'true', 'false'].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setFilter('has_linkedin', val)}
                                            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all uppercase tracking-wide ${(filters.has_linkedin || 'all') === val
                                                ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold"
                                                : "text-slate-400 hover:text-slate-600 font-medium"
                                                }`}
                                        >
                                            {val === 'all' ? 'Any' : val === 'true' ? 'Has' : 'None'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Phone Number</label>
                                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    {['all', 'true', 'false'].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setFilter('has_phone', val)}
                                            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all uppercase tracking-wide ${(filters.has_phone || 'all') === val
                                                ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold"
                                                : "text-slate-400 hover:text-slate-600 font-medium"
                                                }`}
                                        >
                                            {val === 'all' ? 'Any' : val === 'true' ? 'Has' : 'None'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* 3. Location Search Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Location Search</h4>
                            {filters.location && (
                                <button
                                    onClick={() => setFilter("location", "")}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <Input
                                placeholder="State, City, or Code..."
                                value={filters.location || ""}
                                onChange={(e) => setFilter("location", e.target.value)}
                                className="pl-9 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 rounded-xl shadow-sm"
                            />
                        </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* 4. Role Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Professional Role</h4>
                            {filters.role && (
                                <button
                                    onClick={() => setFilter("role", "")}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <Input
                            placeholder="e.g. CEO, MD, Partner..."
                            value={filters.role || ""}
                            onChange={(e) => setFilter("role", e.target.value)}
                            className="bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 rounded-xl shadow-sm"
                        />
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* 5. Outreach & Campaigns Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Outreach History</h4>
                            {(selectedCampaignHistory !== 'all' || selectedCampaignResponses.length > 0 || excludedCampaignIds.length > 0) && (
                                <button
                                    onClick={() => {
                                        setFilter("campaign_history", "all");
                                        setFilter("campaign_response", []);
                                        setFilter("exclude_campaign_ids", []);
                                    }}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear Outreach Filters
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Historical Presence</label>
                                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 mb-2">
                                    {['all', 'any', 'none'].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setFilter('campaign_history', val)}
                                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-tight ${selectedCampaignHistory === val
                                                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                                : "text-slate-400 hover:text-slate-600"
                                                }`}
                                        >
                                            {val === 'all' ? 'Any' : val === 'any' ? 'Contacted' : 'Never'}
                                        </button>
                                    ))}
                                </div>
                                {selectedCampaignHistory !== 'none' && campaigns.length > 0 && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 max-h-40 overflow-y-auto space-y-1">
                                        <p className="text-[10px] uppercase font-semibold text-slate-400 mb-2">Specific Campaigns (OR)</p>
                                        {campaigns.map(c => (
                                            <label key={c.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white cursor-pointer transition-all group">
                                                <Checkbox
                                                    checked={Array.isArray(filters.campaign_history) && filters.campaign_history.includes(c.id)}
                                                    onCheckedChange={() => toggleCampaignPresence(c.id)}
                                                />
                                                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 truncate">{c.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recipient Experience</label>
                                <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    {[
                                        { label: 'Replied', value: 'replied' },
                                        { label: 'No Reply', value: 'no_reply' },
                                        { label: 'Bounced', value: 'bounced' }
                                    ].map(opt => (
                                        <label key={opt.value} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white cursor-pointer transition-all group">
                                            <Checkbox
                                                checked={selectedCampaignResponses.includes(opt.value)}
                                                onCheckedChange={() => toggleCampaignResponse(opt.value)}
                                            />
                                            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase font-semibold text-red-500 tracking-wide flex items-center gap-1">
                                    Exclude Campaigns
                                </label>
                                <div className="p-3 bg-red-50/30 rounded-xl border border-red-100 max-h-40 overflow-y-auto space-y-1 mt-2">
                                    {campaigns.length === 0 ? (
                                        <p className="text-[10px] text-slate-400 italic">No campaigns found</p>
                                    ) : (
                                        campaigns.map(c => (
                                            <label key={c.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white cursor-pointer transition-all group">
                                                <Checkbox
                                                    checked={excludedCampaignIds.includes(c.id)}
                                                    onCheckedChange={() => toggleExcludeCampaign(c.id)}
                                                    className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                                />
                                                <span className="text-xs font-medium text-slate-600 group-hover:text-red-700 truncate">{c.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* 6. Import Source Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Import Source</h4>
                            {filters.source && (
                                <button
                                    onClick={() => setFilter("source", "")}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <Input
                            placeholder="e.g. LinkedIn, Eventbrite..."
                            value={filters.source || ""}
                            onChange={(e) => setFilter("source", e.target.value)}
                            className="bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 rounded-xl shadow-sm"
                        />
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* 7. Email Status Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Email Verification</h4>
                            {(filters.email_status || []).length > 0 && (
                                <button
                                    onClick={() => setFilter("email_status", [])}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            {["Valid", "Catch-all", "Unknown", "Invalid"].map((status) => (
                                <label
                                    key={status}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-all group"
                                >
                                    <Checkbox
                                        checked={(filters.email_status || []).includes(status)}
                                        onCheckedChange={(checked) => {
                                            const current = filters.email_status || [];
                                            const next = checked
                                                ? [...current, status]
                                                : current.filter((s: string) => s !== status);
                                            setFilter("email_status", next);
                                        }}
                                        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                    />
                                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                                        {status}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* 8. Lead Status Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Lead Status</h4>
                            {selectedStatuses.length > 0 && (
                                <button
                                    onClick={() => setFilter("lead_status", [])}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            {LEAD_STATUS_OPTIONS.map((opt) => (
                                <label
                                    key={opt.value}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-all group"
                                >
                                    <Checkbox
                                        checked={selectedStatuses.includes(opt.value)}
                                        onCheckedChange={() => toggleStatus(opt.value)}
                                        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                    />
                                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 capitalize">
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* 9. Tags (dynamic, last) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Tags</h4>
                            {selectedTags.some((t: string) => !categoryValueSet.has(t)) && (
                                <button
                                    onClick={() => setFilter("tag", selectedTags.filter((t: string) => categoryValueSet.has(t)))}
                                    className="text-xs font-medium text-slate-400 hover:text-slate-900 uppercase tracking-wide transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 max-h-40 overflow-y-auto">
                            {tagOptions
                                .filter((opt) => !categoryValueSet.has(opt.value))
                                .map((opt) => (
                                    <label
                                        key={opt.value}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-all group"
                                    >
                                        <Checkbox
                                            checked={selectedTags.includes(opt.value)}
                                            onCheckedChange={() => toggleTag(opt.value)}
                                            className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                        />
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                                            {opt.label}
                                        </span>
                                    </label>
                                ))}
                            {tagOptions.filter((opt) => !categoryValueSet.has(opt.value)).length === 0 && (
                                <p className="text-xs text-slate-400 py-2">No other tags in data</p>
                            )}
                        </div>
                    </div>
                </div >

                <SheetFooter className="mt-auto pt-6 border-t border-slate-100 sm:flex-col gap-3">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl h-11 font-medium tracking-tight shadow-sm"
                    >
                        Apply {activeFilterCount > 0 ? `(${activeFilterCount})` : ''} Filters
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        disabled={activeFilterCount === 0}
                        className="w-full text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-11 font-medium text-xs uppercase tracking-wide transition-all"
                    >
                        <RotateCcw className="w-3 h-3 mr-2" />
                        Reset All Filters
                    </Button>
                </SheetFooter>
            </SheetContent >
        </Sheet >
    );
}
