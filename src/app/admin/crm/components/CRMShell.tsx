import React from "react";
import { Search, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    tag?: string;
    setTag?: (tag: string) => void;
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
    tag,
    setTag,
    tagOptions,
}: CRMShellProps) {
    const maxPage = Math.max(0, Math.ceil(totalCount / pageSize) - 1);

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
                        className="pl-9"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {tag !== undefined && setTag && tagOptions && (
                        <select
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                            {tagOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium mr-2 border border-blue-200 shadow-sm">
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
                        className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>
            </div>

            {/* Table Content Container */}
            <div className="bg-white rounded-md border shadow-sm flex flex-col min-h-[400px] relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm border border-slate-200">
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
                            <span className="text-sm font-medium">Loading...</span>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">{children}</div>
                {totalCount === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Search className="w-12 h-12 mb-4 text-slate-200" />
                        <h3 className="text-xl font-bold tracking-tight text-slate-900">
                            No results found
                        </h3>
                        <p className="mt-1 font-medium text-xs tracking-widest uppercase text-slate-400">
                            Try adjusting your filters or search terms
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            {(totalCount > 0 || page > 0) && (
                <div className="flex items-center justify-between text-sm text-slate-500 py-2">
                    <div>
                        Showing {Math.min(page * pageSize + 1, totalCount)} to{" "}
                        {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}{" "}
                        records
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0 || loading}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <span className="px-2 font-medium bg-slate-100 rounded-md py-1 px-3">
                            Page {page + 1} of {Math.max(1, maxPage + 1)}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= maxPage || loading}
                        >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
