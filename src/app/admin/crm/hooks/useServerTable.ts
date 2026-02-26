import { useState, useEffect, useCallback } from "react";

interface UseServerTableProps {
  endpoint: string;
}

export function useServerTable({ endpoint }: UseServerTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", pageSize.toString());
      if (search) {
        url.searchParams.set("search", search);
      }

      const res = await fetch(url.toString());
      const json = await res.json();
      setData(json.data || []);
      setTotalCount(json.count || 0);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [fetchData]);

  // When search changes, reset to page 0
  useEffect(() => {
    setPage(0);
  }, [search]);

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent row click from triggering
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = (ids: string[], isChecked: boolean) => {
    if (!isChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  };

  return {
    data,
    loading,
    totalCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    selectedIds,
    toggleSelection,
    toggleAll,
    setSelectedIds,
    refresh: fetchData,
  };
}
