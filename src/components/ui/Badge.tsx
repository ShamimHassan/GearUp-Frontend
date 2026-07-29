"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { StatusBadgeVariant } from "@/types";
import { RentalStatus, PaymentStatus } from "@/types";

type BadgeTone =
  | RentalStatus
  | PaymentStatus
  | "active"
  | "suspended"
  | "slate"
  | "emerald"
  | "amber"
  | "red"
  | "blue"
  | "purple"
  | "orange";

const TONE_CLASSES: Record<BadgeTone, string> = {
  [RentalStatus.PLACED]: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  [RentalStatus.CONFIRMED]: "bg-blue-100 text-blue-800 ring-blue-200",
  [RentalStatus.PAID]: "bg-purple-100 text-purple-800 ring-purple-200",
  [RentalStatus.PICKED_UP]: "bg-green-100 text-green-800 ring-green-200",
  [RentalStatus.RETURNED]: "bg-slate-100 text-slate-800 ring-slate-200",
  [RentalStatus.CANCELLED]: "bg-red-100 text-red-800 ring-red-200",

  [PaymentStatus.PENDING]: "bg-orange-100 text-orange-800 ring-orange-200",
  [PaymentStatus.COMPLETED]: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  [PaymentStatus.FAILED]: "bg-red-100 text-red-800 ring-red-200",

  active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  suspended: "bg-red-100 text-red-800 ring-red-200",
  slate: "bg-slate-100 text-slate-800 ring-slate-200",
  emerald: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  red: "bg-red-100 text-red-800 ring-red-200",
  blue: "bg-blue-100 text-blue-800 ring-blue-200",
  purple: "bg-purple-100 text-purple-800 ring-purple-200",
  orange: "bg-orange-100 text-orange-800 ring-orange-200",
};

type BadgeSize = "sm" | "md";

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] leading-4",
  md: "px-2.5 py-1 text-xs leading-5",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusBadgeVariant | BadgeTone;
  size?: BadgeSize;
  dot?: boolean;
}

function labelize(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone = "slate", size = "sm", dot, children, ...props },
  ref,
) {
  const toneClass =
    TONE_CLASSES[tone as BadgeTone] ?? TONE_CLASSES.slate;
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium uppercase tracking-wide rounded-full ring-1 ring-inset",
        SIZE_CLASSES[size],
        toneClass,
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current opacity-80",
          )}
        />
      ) : null}
      {children ?? labelize(String(tone))}
    </span>
  );
});

export function StatusBadge({
  status,
  size,
}: {
  status: RentalStatus | PaymentStatus | "active" | "suspended";
  size?: BadgeSize;
}) {
  return (
    <Badge tone={status as StatusBadgeVariant} size={size} dot>
      {labelize(String(status))}
    </Badge>
  );
}

export { Badge };
export default Badge;
