"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "table" | "paragraph";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const baseClass =
  "animate-pulse bg-slate-200/80 rounded-lg shadow-none";

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    className,
    variant = "rectangular",
    width,
    height,
    lines,
    style,
    ...props
  },
  ref,
) {
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  if (variant === "paragraph") {
    const count = lines ?? 3;
    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} style={combinedStyle} {...props}>
        {Array.from({ length: count }).map((_, i) => {
          const isLast = i === count - 1;
          return (
            <div
              key={i}
              className={cn(baseClass, "h-3 rounded-full", isLast ? "w-2/3" : "")}
            />
          );
        })}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div
        ref={ref}
        className={cn(baseClass, "h-3 rounded-full", className)}
        style={combinedStyle}
        {...props}
      />
    );
  }

  if (variant === "circular") {
    return (
      <div
        ref={ref}
        className={cn(baseClass, "rounded-full", className)}
        style={{ width: width ?? "h-10", height: height ?? "w-10", ...combinedStyle }}
        {...props}
      />
    );
  }

  return (
    <div
      ref={ref}
      className={cn(baseClass, className)}
      style={combinedStyle}
      {...props}
    />
  );
});

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 space-y-4", className)}>
      <Skeleton variant="rectangular" height="140px" className="rounded-xl w-full" />
      <Skeleton variant="text" className="h-5 w-2/3" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" className="h-5 w-20" />
        <Skeleton variant="rectangular" className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100",
        className,
      )}
    >
      <div className="bg-slate-50/60 px-4 py-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} variant="text" className="h-3 w-2/3 rounded-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`r-${r}`}
          className="px-4 py-3 grid gap-3 items-center"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, c) => (
            <Skeleton
              key={`r${r}-c${c}`}
              variant="text"
              className={cn("h-4 rounded-full", c === 0 ? "w-1/2" : "w-3/5")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TextSkeleton({
  lines = 2,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => {
        const widths = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-2/3"];
        return (
          <Skeleton
            key={i}
            variant="text"
            className={`h-3 rounded-full ${widths[i % widths.length]}`}
          />
        );
      })}
    </div>
  );
}

export { Skeleton };
export default Skeleton;
