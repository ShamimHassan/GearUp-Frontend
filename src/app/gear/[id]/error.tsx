"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GearDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GearDetails] Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600"
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
          className="h-8 w-8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900">Couldn&apos;t load gear details</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {error.message || "Something went wrong. Please try again."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/gear"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to browse
        </Link>
      </div>
    </div>
  );
}
