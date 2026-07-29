"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useGearList } from "@/hooks/useGear";
import type { GearItemWithRelations } from "@/types";
import { Button, LinkButton } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import GearCard from "@/components/gear/GearCard";
import { showError } from "@/components/ui/Toast";

function loadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function FeaturedGearInner() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGearList(
    { limit: 6, page: 1, isAvailable: true, sortBy: "rating" },
    { staleTime: 60_000 }
  );

  if (isLoading) {
    return (
      <div className="mt-12">
        {loadingGrid()}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-red-800">
          Couldn't load featured gear
        </h3>
        <p className="mt-1 text-sm text-red-700">
          {error?.message || "Something went wrong while loading listings."}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              showError("Retrying featured gear", error?.message || "Please wait…");
              void refetch();
            }}
            isLoading={isFetching}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Reload
          </Button>
          <LinkButton href="/gear" variant="outline" size="md">
            Browse all gear
          </LinkButton>
        </div>
      </div>
    );
  }

  const list: GearItemWithRelations[] = (data as GearItemWithRelations[]) || [];

  return (
    <div className="mt-12">
      {list.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M21 8v13H3V8" />
              <path d="M1 3h22v5H1z" />
              <path d="M10 12h4" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            No featured listings yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            New gear is being added daily — check the full catalog in the meantime.
          </p>
          <div className="mt-5 flex items-center justify-center">
            <LinkButton href="/gear" variant="primary" size="md">
              Browse all gear
            </LinkButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((gear) => (
            <GearCard key={gear.id} gear={gear} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeaturedGearSection() {
  return (
    <section className="relative bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Handpicked</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Featured gear this week
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Top-rated, freshly inspected and ready to rent — the community's
              most-loved listings, curated by our adventure team.
            </p>
          </div>
          <Link
            href="/gear"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all listings
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        <Suspense fallback={<div className="mt-12">{loadingGrid()}</div>}>
          <FeaturedGearInner />
        </Suspense>
      </div>
    </section>
  );
}

export { FeaturedGearSection };
