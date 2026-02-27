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

interface CRMFilterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: Record<string, any>;
    setFilter: (key: string, value: any) => void;
    clearFilters: () => void;
    tagOptions: { label: string; value: string }[];
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
}: CRMFilterSheetProps) {
    const selectedTags = filters.tag || [];
    const selectedStatuses = filters.lead_status || [];

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
        (filters.has_linkedin && filters.has_linkedin !== 'all' ? 1 : 0);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md flex flex-col h-full">
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
                    {/* Contact Coverage Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Contact Coverage</h4>
                            {((filters.has_email && filters.has_email !== 'all') || (filters.has_linkedin && filters.has_linkedin !== 'all')) && (
                                <button
                                    onClick={() => {
                                        setFilter("has_email", "all");
                                        setFilter("has_linkedin", "all");
                                    }}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
                                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    {['all', 'true', 'false'].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setFilter('has_email', val)}
                                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-tight ${(filters.has_email || 'all') === val
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
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">LinkedIn Profile</label>
                                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    {['all', 'true', 'false'].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setFilter('has_linkedin', val)}
                                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-tight ${(filters.has_linkedin || 'all') === val
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
                    {/* Tags Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Categories / Tags</h4>
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setFilter("tag", [])}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            {tagOptions.map((opt) => (
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

                    {/* Location Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Location Search</h4>
                            {filters.location && (
                                <button
                                    onClick={() => setFilter("location", "")}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors"
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

                    {/* Email Status Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Email Verification</h4>
                            {(filters.email_status || []).length > 0 && (
                                <button
                                    onClick={() => setFilter("email_status", [])}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors"
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

                    {/* Role Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Professional Role</h4>
                            {filters.role && (
                                <button
                                    onClick={() => setFilter("role", "")}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors"
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

                    {/* Source Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Import Source</h4>
                            {filters.source && (
                                <button
                                    onClick={() => setFilter("source", "")}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors"
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

                    {/* Status Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Lead Status</h4>
                            {selectedStatuses.length > 0 && (
                                <button
                                    onClick={() => setFilter("lead_status", [])}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors"
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
                </div>

                <SheetFooter className="mt-auto pt-6 border-t border-slate-100 sm:flex-col gap-3">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-11 font-bold tracking-tight shadow-md"
                    >
                        Apply {activeFilterCount > 0 ? `(${activeFilterCount})` : ''} Filters
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        disabled={activeFilterCount === 0}
                        className="w-full text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-11 font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        <RotateCcw className="w-3 h-3 mr-2" />
                        Reset All Filters
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
