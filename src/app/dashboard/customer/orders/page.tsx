"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMyRentals } from "@/hooks/useRentals";
import { StatusBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatDate, calculateDays } from "@/lib/utils";
import { RentalStatus } from "@/types";
import type { RentalOrderWithRelations } from "@/types";

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS: Array<{ label: string; value: RentalStatus | "ALL" }> = [
  { label: "All",        value: "ALL" },
  { label: "Placed",     value: RentalStatus.PLACED },
  { label: "Confirmed",  value: RentalStatus.CONFIRMED },
  { label: "Paid",       value: RentalStatus.PAID },
  { label: "Picked Up",  value: RentalStatus.PICKED_UP },
  { label: "Returned",   value: RentalStatus.RETURNED },
  { label: "Cancelled",  value: RentalStatus.CANCELLED },
];

// ─── Mobile card view (small screens) ────────────────────────────────────────

function OrderCard({ order }: { order: RentalOrderWithRelations }) {
  const imageSrc = order.gear?.images?.[0];
  const days = calculateDays(order.startDate, order.endDate);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {imageSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={order.gear?.name ?? "Gear"}
              className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
          {!imageSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-400 to-teal-400 text-xs font-black text-white">
              {(order.gear?.name ?? "G").slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {order.gear?.name ?? "—"}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {formatDate(order.startDate)} – {formatDate(order.endDate)} · {days} day{days !== 1 ? "s" : ""}
          </p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-sm font-bold text-slate-900">
          ৳{order.totalAmount.toLocaleString("en-BD")}
        </p>
        <LinkButton href={`/dashboard/customer/orders/${order.id}`} variant="outline" size="sm">
          View details
        </LinkButton>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<RentalStatus | "ALL">("ALL");

  const { data: orders = [], isLoading, isError, error, refetch } = useMyRentals();

  const filtered = useMemo(
    () => activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab),
    [orders, activeTab],
  );

  // Count per status for tab badges
  const countMap = useMemo(() => {
    const map: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => { map[o.status] = (map[o.status] ?? 0) + 1; });
    return map;
  }, [orders]);

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all your rental orders and their current status.
        </p>
      </div>

      {/* ── Status filter tabs ────────────────────────────────────── */}
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        role="tablist"
        aria-label="Filter orders by status"
      >
        {STATUS_TABS.map((tab) => {
          const count = countMap[tab.value] ?? 0;
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold",
                  active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600",
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Loading ───────────────────────────────────────────────── */}
      {isLoading && (
        <>
          {/* Mobile skeletons */}
          <div className="space-y-3 sm:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="h-4 w-2/3 rounded-full" />
                    <Skeleton variant="text" className="h-3 w-1/2 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <Skeleton variant="text" className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table skeleton */}
          <div className="hidden sm:block rounded-xl border border-slate-200 bg-white overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" className="h-4 w-1/3 rounded-full" />
                  <Skeleton variant="text" className="h-3 w-1/4 rounded-full" />
                </div>
                <Skeleton variant="text" className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-800">Failed to load orders</p>
          <p className="mt-1 text-sm text-red-700">{error?.message ?? "Please try again."}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Empty ─────────────────────────────────────────────────── */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          tone={activeTab === "ALL" ? "orders" : "search"}
          title={activeTab === "ALL" ? "No orders yet" : `No ${activeTab.toLowerCase()} orders`}
          description={
            activeTab === "ALL"
              ? "Start by browsing gear and placing your first rental order."
              : `You don't have any orders with status "${activeTab}".`
          }
          actionLabel={activeTab === "ALL" ? "Browse Gear" : "View all orders"}
          actionHref={activeTab === "ALL" ? "/gear" : "/dashboard/customer/orders"}
          size="sm"
        />
      )}

      {/* ── Mobile card list ──────────────────────────────────────── */}
      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="space-y-3 sm:hidden">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* ── Desktop table ─────────────────────────────────────── */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gear</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => {
                  const imageSrc = order.gear?.images?.[0];
                  const days = calculateDays(order.startDate, order.endDate);
                  return (
                    <TableRow key={order.id}>
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
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-400 to-teal-400 text-[10px] font-black text-white">
                                {(order.gear?.name ?? "G").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800 max-w-45">
                              {order.gear?.name ?? "—"}
                            </p>
                            <p className="text-xs text-slate-400">
                              ID: {order.id.slice(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Dates */}
                      <TableCell>
                        <p className="text-sm text-slate-700">
                          {formatDate(order.startDate)} – {formatDate(order.endDate)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {days} day{days !== 1 ? "s" : ""}
                        </p>
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
                        <LinkButton
                          href={`/dashboard/customer/orders/${order.id}`}
                          variant="outline"
                          size="sm"
                        >
                          View details
                        </LinkButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
