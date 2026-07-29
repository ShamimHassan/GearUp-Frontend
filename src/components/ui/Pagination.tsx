"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParam?: string;
  siblings?: number;
  boundaries?: number;
  showFirstLast?: boolean;
  className?: string;
  searchParams?: Record<string, string | string[] | undefined>;
  onPageChange?: (page: number) => void;
  size?: "sm" | "md";
}

const SIZE_CLASSES = {
  sm: "h-8 min-w-[2rem] text-xs",
  md: "h-10 min-w-[2.5rem] text-sm",
};

function buildHref(
  basePath: string,
  queryParam: string,
  page: number,
  searchParams?: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v === undefined) return;
      if (Array.isArray(v)) {
        v.forEach((val) => params.append(k, val));
      } else {
        params.set(k, v);
      }
    });
  }
  if (page > 1) {
    params.set(queryParam, String(page));
  } else {
    params.delete(queryParam);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageRange(
  currentPage: number,
  totalPages: number,
  siblings: number,
  boundaries: number,
): Array<number | "ellipsis"> {
  const total = totalPages;
  const leftSibling = Math.max(currentPage - siblings, 1);
  const rightSibling = Math.min(currentPage + siblings, total);

  const firstRange = Array.from({ length: Math.min(boundaries, total) }, (_, i) => i + 1);
  const lastRange = Array.from(
    { length: Math.min(boundaries, Math.max(0, total - (total - boundaries))) },
    (_, i) => total - boundaries + 1 + i,
  ).filter((n) => n > 0 && n <= total);

  const middle = new Set<number>();
  for (let n = leftSibling; n <= rightSibling; n++) middle.add(n);
  firstRange.forEach((n) => middle.add(n));
  lastRange.forEach((n) => middle.add(n));

  const sorted = Array.from(middle).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    const prev = i === 0 ? null : sorted[i - 1];
    if (prev !== null && cur - (prev as number) > 1) {
      result.push("ellipsis");
    }
    result.push(cur);
  }
  return result;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  const path =
    direction === "left"
      ? "m15 18-6-6 6-6"
      : "m9 18 6-6-6-6";
  return (
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
      <path d={path} />
    </svg>
  );
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParam = "page",
  siblings = 1,
  boundaries = 1,
  showFirstLast = true,
  className,
  searchParams,
  onPageChange,
  size = "md",
}: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);

  const pages = useMemo(
    () => pageRange(safeCurrent, safeTotal, siblings, boundaries),
    [safeCurrent, safeTotal, siblings, boundaries],
  );

  const isInteractive = Boolean(onPageChange);

  const renderButton = (
    key: string,
    page: number,
    content: ReactNode,
    opts: {
      disabled?: boolean;
      variant?: "first" | "last" | "prev" | "next" | "page";
      isActive?: boolean;
    } = {},
  ) => {
    const { disabled, isActive } = opts;
    const shared = cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-all border border-transparent",
      SIZE_CLASSES[size],
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
      isActive
        ? "bg-emerald-600 text-white shadow-sm border-emerald-600"
        : disabled
          ? "pointer-events-none text-slate-300 border-slate-100 bg-white"
          : "text-slate-700 hover:bg-slate-100 hover:border-slate-200 bg-white",
    );

    if (isInteractive) {
      return (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onPageChange?.(page)}
          className={shared}
        >
          {content}
        </button>
      );
    }

    if (disabled) {
      return (
        <span key={key} aria-disabled="true" className={shared}>
          {content}
        </span>
      );
    }

    return (
      <Link
        key={key}
        href={buildHref(basePath, queryParam, page, searchParams)}
        aria-current={isActive ? "page" : undefined}
        className={shared}
      >
        {content}
      </Link>
    );
  };

  if (safeTotal <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5 sm:gap-2 py-2", className)}
    >
      {showFirstLast
        ? renderButton("first", 1, "«", { disabled: safeCurrent === 1, variant: "first" })
        : null}
      {renderButton("prev", Math.max(1, safeCurrent - 1), <Chevron direction="left" />, {
        disabled: safeCurrent === 1,
        variant: "prev",
      })}

      {pages.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            aria-hidden="true"
            className={cn(
              "inline-flex items-end justify-center select-none text-slate-400",
              SIZE_CLASSES[size],
            )}
          >
            …
          </span>
        ) : (
          renderButton(`page-${item}`, item, String(item), {
            variant: "page",
            isActive: item === safeCurrent,
          })
        ),
      )}

      {renderButton("next", Math.min(safeTotal, safeCurrent + 1), <Chevron direction="right" />, {
        disabled: safeCurrent === safeTotal,
        variant: "next",
      })}
      {showFirstLast
        ? renderButton("last", safeTotal, "»", {
            disabled: safeCurrent === safeTotal,
            variant: "last",
          })
        : null}
    </nav>
  );
}

export { Pagination };
