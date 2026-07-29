"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import type { Category } from "@/types";

export interface ActiveFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

interface FilterSidebarProps {
  filters: ActiveFilters;
  categories: Category[];
  categoriesLoading: boolean;
  totalResults?: number;
  className?: string;
}

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
];

export default function FilterSidebar({
  filters,
  categories,
  categoriesLoading,
  totalResults,
  className,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for debounced inputs
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localMin, setLocalMin] = useState(filters.minPrice);
  const [localMax, setLocalMax] = useState(filters.maxPrice);

  // Sync local state when URL params change (e.g. "clear all" from parent)
  useEffect(() => { setLocalSearch(filters.search); }, [filters.search]);
  useEffect(() => { setLocalMin(filters.minPrice); }, [filters.minPrice]);
  useEffect(() => { setLocalMax(filters.maxPrice); }, [filters.maxPrice]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounce search — 400 ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== filters.search) updateFilter("search", localSearch);
    }, 400);
    return () => clearTimeout(t);
  }, [localSearch, filters.search, updateFilter]);

  // Debounce min price — 500 ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (localMin !== filters.minPrice) updateFilter("minPrice", localMin);
    }, 500);
    return () => clearTimeout(t);
  }, [localMin, filters.minPrice, updateFilter]);

  // Debounce max price — 500 ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (localMax !== filters.maxPrice) updateFilter("maxPrice", localMax);
    }, 500);
    return () => clearTimeout(t);
  }, [localMax, filters.maxPrice, updateFilter]);

  const clearAll = useCallback(() => {
    setLocalSearch("");
    setLocalMin("");
    setLocalMax("");
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.sortBy,
  );

  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
  ].filter(Boolean).length;

  return (
    <aside className={cn("space-y-6", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge tone="emerald" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Result count */}
      {totalResults !== undefined && (
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{totalResults}</span> listings found
        </p>
      )}

      {/* Search */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Search
        </label>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            type="search"
            placeholder="Search gear..."
            value={localSearch}
            className="pl-9"
            onChange={(e) => setLocalSearch(e.target.value)}
            aria-label="Search gear"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Sort by
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFilter("sortBy", opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                filters.sortBy === opt.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Category
        </label>
        {categoriesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-8 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {/* All categories */}
            <button
              type="button"
              onClick={() => updateFilter("category", "")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                !filters.category
                  ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-200"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              All categories
            </button>

            {/* Per-category buttons */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  updateFilter("category", filters.category === cat.id ? "" : cat.id)
                }
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm text-left transition-all",
                  filters.category === cat.id
                    ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-200"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Price / day (৳)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            aria-label="Minimum price per day"
          />
          <span className="shrink-0 text-xs text-slate-400">—</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            aria-label="Maximum price per day"
          />
        </div>
        {(filters.minPrice || filters.maxPrice) && (
          <p className="text-xs text-emerald-700">
            {filters.minPrice ? `৳${filters.minPrice}` : "0"}
            {" – "}
            {filters.maxPrice ? `৳${filters.maxPrice}` : "any"}
          </p>
        )}
      </div>

      {/* Bottom clear button */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" block onClick={clearAll}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
          </svg>
          Clear all filters
        </Button>
      )}
    </aside>
  );
}

export { FilterSidebar };
