"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useGear";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

const FALLBACK_CATEGORIES: Array<{ id: string; name: string }> = [
  { id: "camping", name: "Camping" },
  { id: "hiking", name: "Hiking" },
  { id: "cycling", name: "Cycling" },
  { id: "water-sports", name: "Water Sports" },
  { id: "winter-sports", name: "Winter Sports" },
  { id: "fitness", name: "Fitness" },
];

function chips() {
  return (
    <div className="flex flex-wrap gap-2.5 pt-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-full" />
      ))}
    </div>
  );
}

function CategoryChipsInner() {
  const router = useRouter();
  const { data, isLoading, isError } = useCategories();

  const list = isLoading || isError || !data ? FALLBACK_CATEGORIES : data;

  return (
    <section className="relative bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">
              Explore categories
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Find exactly what your adventure needs
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Tap a category to see matching listings, or browse everything at once.
            </p>
          </div>
          <Link
            href="/gear"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all categories
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

        {isLoading && <div className="mt-8">{chips()}</div>}
        {!isLoading && (
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Link href="/gear" className="group">
              <span
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900 hover:bg-slate-800"
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
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                All gear
              </span>
            </Link>
            {list.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  router.push(`/gear?category=${encodeURIComponent(cat.id)}`);
                }}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm",
                  "hover:border-transparent hover:bg-emerald-50 hover:text-emerald-800 hover:ring-emerald-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                )}
              >
                <Badge tone="blue" size="sm" className="!rounded !px-1.5 !py-0 leading-[1.1]">
                  {cat.name.slice(0, 1).toUpperCase()}
                </Badge>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function CategoryChips() {
  return (
    <Suspense fallback={<section className="bg-slate-50 py-16 sm:py-20"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{chips()}</div></section>}>
      <CategoryChipsInner />
    </Suspense>
  );
}

export { CategoryChips };
