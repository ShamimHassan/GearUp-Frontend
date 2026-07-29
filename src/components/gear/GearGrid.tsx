"use client";

import { cn } from "@/lib/utils";
import GearCard from "@/components/gear/GearCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import type { GearItemWithRelations } from "@/types";

interface GearGridProps {
  gear: GearItemWithRelations[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

const SKELETON_COUNT = 9;

export default function GearGrid({
  gear,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  hasActiveFilters,
  className,
}: GearGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
          className,
        )}
        aria-busy="true"
        aria-label="Loading gear listings"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-red-800">Couldn&apos;t load gear</h3>
        <p className="mt-1 text-sm text-red-700">
          {errorMessage || "Something went wrong while fetching listings."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
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
              <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (gear.length === 0) {
    return (
      <EmptyState
        tone="search"
        title={hasActiveFilters ? "No gear matches your filters" : "No gear available"}
        description={
          hasActiveFilters
            ? "Try adjusting your filters — change the category, price range, or clear all filters to see more results."
            : "No gear listings are available right now. Check back soon!"
        }
        actionLabel={hasActiveFilters ? "Clear filters" : "Browse all gear"}
        actionHref="/gear"
        actionVariant="primary"
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      aria-label={`${gear.length} gear listings`}
    >
      {gear.map((item) => (
        <GearCard key={item.id} gear={item} />
      ))}
    </div>
  );
}

export { GearGrid };
