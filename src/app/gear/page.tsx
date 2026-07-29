"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGearList, useCategories } from "@/hooks/useGear";
import { GearGrid } from "@/components/gear/GearGrid";
import { FilterSidebar, type ActiveFilters } from "@/components/gear/FilterSidebar";
import Pagination from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { GearFilters, GearItemWithRelations, Category } from "@/types";

const PAGE_SIZE = 9;

// ─── Mobile filter drawer ────────────────────────────────────────────────────

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ActiveFilters;
  categories: Category[];
  categoriesLoading: boolean;
  totalResults?: number;
}

function MobileFilterDrawer({
  open,
  onClose,
  filters,
  categories,
  categoriesLoading,
  totalResults,
}: DrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter options"
        id="mobile-filter-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white shadow-xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <span className="text-base font-semibold text-slate-900">Filters</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="h-5 w-5" aria-hidden="true">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          <FilterSidebar
            filters={filters}
            categories={categories}
            categoriesLoading={categoriesLoading}
            totalResults={totalResults}
          />
        </div>
      </div>
    </>
  );
}

// ─── Active filter chip ───────────────────────────────────────────────────────

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 py-1 pl-3 pr-1.5 text-xs font-medium text-emerald-800">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-emerald-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="h-2.5 w-2.5" aria-hidden="true">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GearBrowsePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Read filters from URL
  const search    = searchParams.get("search")   ?? "";
  const category  = searchParams.get("category") ?? "";
  const minPrice  = searchParams.get("minPrice") ?? "";
  const maxPrice  = searchParams.get("maxPrice") ?? "";
  const sortBy    = searchParams.get("sortBy")   ?? "";
  const page      = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const filters: ActiveFilters = { search, category, minPrice, maxPrice, sortBy };

  // Build API filter object
  const gearFilters: GearFilters = {
    page,
    limit: PAGE_SIZE,
    ...(search   ? { search }                                    : {}),
    ...(category ? { category }                                   : {}),
    ...(minPrice ? { minPrice: Number(minPrice) }                 : {}),
    ...(maxPrice ? { maxPrice: Number(maxPrice) }                 : {}),
    ...(sortBy   ? { sortBy: sortBy as GearFilters["sortBy"] }   : {}),
  };

  const {
    data: gearData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGearList(gearFilters);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Handle both flat array and paginated { items, meta } response shapes
  const gearItems: GearItemWithRelations[] = Array.isArray(gearData)
    ? gearData
    : ((gearData as { items?: GearItemWithRelations[] } | undefined)?.items ?? []);

  const paginationMeta =
    !Array.isArray(gearData) && gearData && typeof gearData === "object" && "meta" in gearData
      ? (gearData as { meta: { totalPages: number; total: number } }).meta
      : null;

  const totalPages   = paginationMeta?.totalPages ?? 1;
  const totalResults = paginationMeta?.total      ?? (Array.isArray(gearData) ? gearData.length : undefined);

  const hasActiveFilters = Boolean(search || category || minPrice || maxPrice || sortBy);
  const activeFilterCount = [search, category, minPrice, maxPrice, sortBy].filter(Boolean).length;

  // Helper: remove a single filter key from URL
  const removeFilter = useCallback(
    (key: keyof ActiveFilters) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // searchParams for Pagination (without page key)
  const paginationSearchParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "page") paginationSearchParams[key] = value;
  });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <nav className="mb-2 flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
                <a href="/" className="hover:text-slate-700 transition-colors">Home</a>
                <span aria-hidden="true">›</span>
                <span className="font-medium text-slate-700">Browse Gear</span>
              </nav>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Browse Gear
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Find your perfect outdoor adventure gear from 2,200+ verified providers.
              </p>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {search && (
                  <ActiveChip label={`"${search}"`} onRemove={() => removeFilter("search")} />
                )}
                {category && (
                  <ActiveChip
                    label={categories.find((c) => c.id === category)?.name ?? category}
                    onRemove={() => removeFilter("category")}
                  />
                )}
                {minPrice && (
                  <ActiveChip label={`Min ৳${minPrice}`} onRemove={() => removeFilter("minPrice")} />
                )}
                {maxPrice && (
                  <ActiveChip label={`Max ৳${maxPrice}`} onRemove={() => removeFilter("maxPrice")} />
                )}
                {sortBy && (
                  <ActiveChip
                    label={
                      sortBy === "price_asc"  ? "↑ Price"   :
                      sortBy === "price_desc" ? "↓ Price"   :
                      sortBy === "newest"     ? "Newest"    : "Top Rated"
                    }
                    onRemove={() => removeFilter("sortBy")}
                  />
                )}
                <button
                  type="button"
                  onClick={() => router.push(pathname)}
                  className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">

          {/* Desktop sidebar */}
          <div className="hidden w-56 shrink-0 lg:block xl:w-64">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <FilterSidebar
                filters={filters}
                categories={categories}
                categoriesLoading={categoriesLoading}
                totalResults={totalResults}
              />
            </div>
          </div>

          {/* Main column */}
          <div className="min-w-0 flex-1">

            {/* Mobile top bar */}
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-expanded={drawerOpen}
                aria-controls="mobile-filter-drawer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="h-4 w-4" aria-hidden="true">
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="8" x2="16" y1="12" y2="12" />
                  <line x1="12" x2="12" y1="18" y2="18" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <Badge tone="emerald" size="sm">{activeFilterCount}</Badge>
                )}
              </button>

              {totalResults !== undefined && (
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{totalResults}</span> results
                </p>
              )}
            </div>

            {/* Background-refetch indicator */}
            {isFetching && !isLoading && (
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                <svg className="h-4 w-4 animate-spin text-emerald-600" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Updating results…
              </div>
            )}

            {/* Gear grid */}
            <GearGrid
              gear={gearItems}
              isLoading={isLoading}
              isError={isError}
              errorMessage={error?.message}
              onRetry={() => void refetch()}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Pagination */}
            {!isLoading && !isError && totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  basePath={pathname}
                  queryParam="page"
                  searchParams={paginationSearchParams}
                  siblings={1}
                  boundaries={1}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        categories={categories}
        categoriesLoading={categoriesLoading}
        totalResults={totalResults}
      />
    </div>
  );
}
