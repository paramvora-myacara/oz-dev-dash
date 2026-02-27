import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, CheckSquare, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CRMFilterSheet } from "./CRMFilterSheet";
import { Badge } from "@/components/ui/badge";

interface CRMShellProps {
    children: React.ReactNode;
    search: string;
    setSearch: (s: string) => void;
    page: number;
    setPage: (p: number) => void;
    pageSize: number;
    setPageSize: (s: number) => void;
    totalCount: number;
    loading: boolean;
    selectedIds: Set<string>;
    searchPlaceholder?: string;
    actions?: React.ReactNode;
    filters?: Record<string, any>;
    setFilter?: (key: string, value: any) => void;
    clearFilters?: () => void;
    tagOptions?: { label: string; value: string }[];
}

export function CRMShell({
    children,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    loading,
    selectedIds,
    searchPlaceholder = "Search...",
    actions,
    filters = {},
    setFilter,
    clearFilters,
    tagOptions = [],
}: CRMShellProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const maxPage = Math.max(0, Math.ceil(totalCount / pageSize) - 1);

    const activeFilterCount =
        Object.entries(filters).reduce((acc, [key, value]) => {
            if (!value) return acc;
            if (Array.isArray(value)) return acc + (value.length > 0 ? 1 : 0);
            if (value === 'all') return acc;
            return acc + 1;
        }, 0);

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-[400px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {setFilter && clearFilters && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsFilterOpen(true)}
                                className={`h-10 rounded-xl flex items-center gap-2 font-medium tracking-tight ${activeFilterCount > 0
                                        ? "border-slate-900 bg-slate-50 text-slate-900 shadow-sm"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <Filter className={`w-4 h-4 ${activeFilterCount > 0 ? 'fill-slate-900' : ''}`} />
                                Filters
                                {activeFilterCount > 0 && (
                                    <Badge className="ml-1 bg-slate-900 text-white h-5 min-w-[20px] px-1 justify-center rounded-full border-none">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>

                            <CRMFilterSheet
                                open={isFilterOpen}
                                onOpenChange={setIsFilterOpen}
                                filters={filters}
                                setFilter={setFilter}
                                clearFilters={clearFilters}
                                tagOptions={tagOptions}
                            />
                        </>
                    )}

                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 h-10 px-3 rounded-xl text-sm font-bold mr-2 border border-blue-100 shadow-sm animate-in zoom-in-95 duration-200">
                            <CheckSquare className="w-4 h-4" />
                            {selectedIds.size} Selected
                            <div className="flex gap-1 ml-2">{actions}</div>
                        </div>
                    )}

                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0); // Reset page on limit change
                        }}
                        className="h-10 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-700"
                    >
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>
            </div>

            {/* Table Content Container */}
            <div className="bg-white rounded-2xl border shadow-sm flex flex-col min-h-[400px] relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-xl border border-slate-100">
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
                            <span className="text-sm font-bold tracking-tight text-slate-900">Loading records...</span>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">{children}</div>
                {totalCount === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-50 p-6 rounded-full mb-6">
                            <Search className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900">
                            No matching records
                        </h3>
                        <p className="mt-2 font-medium text-xs tracking-widest uppercase text-slate-400 max-w-[200px] text-center">
                            Try adjusting your filters or search terms to see more results
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            {(totalCount > 0 || page > 0) && (
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 py-2 uppercase tracking-widest">
                    <div>
                        Showing {Math.min(page * pageSize + 1, totalCount)} –{" "}
                        {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}{" "}
                        records
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0 || loading}
                            className="h-8 rounded-lg hover:bg-slate-100"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <span className="px-3 bg-slate-900 text-white rounded-lg py-1.5 min-w-[32px] text-center shadow-lg">
                            {page + 1}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= maxPage || loading}
                            className="h-8 rounded-lg hover:bg-slate-100"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

