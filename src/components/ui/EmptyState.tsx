"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button, LinkButton, type LinkButtonProps } from "@/components/ui/Button";

type EmptyTone = "default" | "gear" | "orders" | "payments" | "users" | "reviews" | "search";

interface IconProps {
  className?: string;
}

function DefaultIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function GearIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>
    </svg>
  );
}

function OrdersIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 2v4"/>
      <path d="M16 2v4"/>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M3 10h18"/>
      <path d="m9 16 2 2 4-4"/>
    </svg>
  );
}

function PaymentsIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
    </svg>
  );
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function ReviewsIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/>
    </svg>
  );
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

const TONE_ICON: Record<EmptyTone, (p: IconProps) => ReactNode> = {
  default: DefaultIcon,
  gear: GearIcon,
  orders: OrdersIcon,
  payments: PaymentsIcon,
  users: UsersIcon,
  reviews: ReviewsIcon,
  search: SearchIcon,
};

const TONE_CONTAINER: Record<EmptyTone, string> = {
  default: "bg-slate-100 text-slate-500",
  gear: "bg-emerald-100 text-emerald-600",
  orders: "bg-sky-100 text-sky-600",
  payments: "bg-violet-100 text-violet-600",
  users: "bg-amber-100 text-amber-600",
  reviews: "bg-rose-100 text-rose-600",
  search: "bg-indigo-100 text-indigo-600",
};

export interface EmptyStateProps {
  tone?: EmptyTone;
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  actionVariant?: LinkButtonProps["variant"];
  actionIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: {
    container: "py-10 px-4",
    icon: "h-10 w-10",
    iconWrap: "h-16 w-16",
    title: "text-base",
  },
  md: {
    container: "py-16 px-6",
    icon: "h-12 w-12",
    iconWrap: "h-20 w-20",
    title: "text-lg",
  },
  lg: {
    container: "py-24 px-8",
    icon: "h-16 w-16",
    iconWrap: "h-24 w-24",
    title: "text-xl",
  },
};

export default function EmptyState({
  tone = "default",
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  actionVariant = "primary",
  actionIcon,
  size = "md",
  className,
}: EmptyStateProps) {
  const Icon = TONE_ICON[tone];
  const tokens = SIZE_MAP[size];

  const actionContent = actionLabel ? (
    onAction ? (
      <Button variant={actionVariant} onClick={onAction} leftIcon={actionIcon}>
        {actionLabel}
      </Button>
    ) : actionHref ? (
      <LinkButton
        href={actionHref}
        variant={actionVariant}
        leftIcon={actionIcon}
      >
        {actionLabel}
      </LinkButton>
    ) : null
  ) : null;

  return (
    <div
      role="status"
      className={cn(
        "w-full flex flex-col items-center text-center rounded-2xl border border-dashed border-slate-200 bg-white/40",
        tokens.container,
        className,
      )}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center mb-4 ring-8 ring-white",
          TONE_CONTAINER[tone],
          tokens.iconWrap,
        )}
      >
        {icon ?? <Icon className={tokens.icon} />}
      </div>
      <h3 className={cn("font-semibold text-slate-900 mb-1.5", tokens.title)}>{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-slate-500 leading-relaxed mb-5">{description}</p>
      ) : (
        <div className="mb-5" aria-hidden="true" />
      )}
      {actionContent}
    </div>
  );
}

export { EmptyState };
