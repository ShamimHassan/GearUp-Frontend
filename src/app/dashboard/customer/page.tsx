"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMyRentals } from "@/hooks/useRentals";
import { usePaymentHistory } from "@/hooks/usePayments";
import { useUser } from "@/store/authStore";
import { StatusBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { RentalStatus, PaymentStatus } from "@/types";
import type { RentalOrderWithRelations } from "@/types";

// ─── Stat card ─────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  tone: "emerald" | "blue" | "amber" | "purple";
}

const TONE_MAP = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "bg-emerald-100 text-emerald-600" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    icon: "bg-blue-100 text-blue-600" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   icon: "bg-amber-100 text-amber-600" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  icon: "bg-purple-100 text-purple-600" },
};

function StatCard({ label, value, sub, icon, tone }: StatCardProps) {
  const t = TONE_MAP[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.icon)}>
          {icon}
        </div>
      </div>
      <p className={cn("mt-3 text-3xl font-extrabold", t.text)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Recent order row ───────────────────────────────────────────────────────

function RecentOrderRow({ order }: { order: RentalOrderWithRelations }) {
  const imageSrc = order.gear?.images?.[0];
  const fallbackGrad = "from-emerald-400 to-teal-400";

  return (
    <TableRow>
      {/* Gear */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={order.gear?.name ?? "Gear"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const fb = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={cn(
                "absolute inset-0 items-center justify-center bg-linear-to-br text-[10px] font-black text-white",
                fallbackGrad,
                imageSrc ? "hidden" : "flex",
              )}
              aria-hidden="true"
            >
              {(order.gear?.name ?? "G").slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {order.gear?.name ?? "—"}
            </p>
            <p className="truncate text-xs text-slate-400">
              {formatDate(order.startDate)} – {formatDate(order.endDate)}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Total */}
      <TableCell className="font-semibold text-slate-900">
        ৳{order.totalAmount.toLocaleString("en-BD")}
      </TableCell>

      {/* Status */}
      <TableCell>
        <StatusBadge status={order.status} />
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <LinkButton href={`/dashboard/customer/orders/${order.id}`} variant="outline" size="sm">
          View
        </LinkButton>
      </TableCell>
    </TableRow>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CustomerDashboardPage() {
  const user = useUser();

  const { data: rentals = [], isLoading: rentalsLoading } = useMyRentals();
  const { data: payments = [], isLoading: paymentsLoading } = usePaymentHistory();

  const isLoading = rentalsLoading || paymentsLoading;

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRentals  = rentals.length;
    const activeRentals = rentals.filter((r) => r.status === RentalStatus.PICKED_UP).length;
    const pendingActions = rentals.filter(
      (r) => r.status === RentalStatus.PLACED || r.status === RentalStatus.CONFIRMED,
    ).length;
    const totalSpent = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return { totalRentals, activeRentals, pendingActions, totalSpent };
  }, [rentals, payments]);

  const recentOrders = useMemo(
    () => [...rentals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ).slice(0, 5),
    [rentals],
  );

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s an overview of your GearUp activity.
          </p>
        </div>
        <LinkButton href="/gear" variant="primary" size="md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-4 w-4" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          Browse Gear
        </LinkButton>
      </div>

      {/* ── Stats cards ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" className="h-3 w-24 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <Skeleton variant="text" className="h-8 w-16 rounded-full" />
              <Skeleton variant="text" className="h-3 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Rentals"
            value={stats.totalRentals}
            sub="all time"
            tone="emerald"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <path d="M8 2v4" /><path d="M16 2v4" />
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M3 10h18" />
              </svg>
            }
          />
          <StatCard
            label="Active Rentals"
            value={stats.activeRentals}
            sub="currently with you"
            tone="blue"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
              </svg>
            }
          />
          <StatCard
            label="Pending Actions"
            value={stats.pendingActions}
            sub="need your attention"
            tone="amber"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <StatCard
            label="Total Spent"
            value={`৳${stats.totalSpent.toLocaleString("en-BD")}`}
            sub="completed payments"
            tone="purple"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            }
          />
        </div>
      )}

      {/* ── Pending action banner ────────────────────────────────────── */}
      {!isLoading && stats.pendingActions > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>
            You have{" "}
            <strong>{stats.pendingActions} order{stats.pendingActions !== 1 ? "s" : ""}</strong>{" "}
            awaiting action.{" "}
            <Link href="/dashboard/customer/orders" className="font-semibold underline hover:no-underline">
              View orders →
            </Link>
          </span>
        </div>
      )}

      {/* ── Recent orders ────────────────────────────────────────────── */}
      <section aria-labelledby="recent-orders-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-orders-heading" className="text-base font-bold text-slate-900">
            Recent Orders
          </h2>
          <Link
            href="/dashboard/customer/orders"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" className="h-4 w-1/2 rounded-full" />
                  <Skeleton variant="text" className="h-3 w-1/3 rounded-full" />
                </div>
                <Skeleton variant="text" className="h-5 w-16 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <EmptyState
            tone="orders"
            title="No rentals yet"
            description="Start by browsing our gear and placing your first rental order."
            actionLabel="Browse Gear"
            actionHref="/gear"
            size="sm"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gear</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <RecentOrderRow key={order.id} order={order} />
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* ── Quick action tiles ───────────────────────────────────────── */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-4 text-base font-bold text-slate-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              href: "/gear",
              label: "Browse Gear",
              desc: "Explore 5,400+ listings",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="h-6 w-6" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              ),
              tone: "emerald",
            },
            {
              href: "/dashboard/customer/orders",
              label: "My Orders",
              desc: "Track rental status",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="h-6 w-6" aria-hidden="true">
                  <path d="M8 2v4" /><path d="M16 2v4" />
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M3 10h18" /><path d="m9 16 2 2 4-4" />
                </svg>
              ),
              tone: "blue",
            },
            {
              href: "/dashboard/customer/payments",
              label: "Payment History",
              desc: "View all transactions",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="h-6 w-6" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              ),
              tone: "purple",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                item.tone === "emerald" && "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200",
                item.tone === "blue"    && "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
                item.tone === "purple"  && "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
              )}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
