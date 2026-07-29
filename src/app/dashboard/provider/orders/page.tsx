"use client";

import { useMemo, useState } from "react";
import { useProviderOrders, useUpdateOrderStatus } from "@/hooks/useProvider";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

// ─── Action buttons per status ────────────────────────────────────────────────

function OrderActions({ order }: { order: RentalOrderWithRelations }) {
  const update  = useUpdateOrderStatus();
  const pending = update.isPending;

  const mutate = (status: RentalStatus) =>
    update.mutate({ id: order.id, data: { status } });

  switch (order.status) {
    case RentalStatus.PLACED:
      return (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            isLoading={pending}
            onClick={() => mutate(RentalStatus.CONFIRMED)}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => mutate(RentalStatus.CANCELLED)}
          >
            Reject
          </Button>
        </div>
      );

    case RentalStatus.CONFIRMED:
      return (
        <span className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
          Awaiting payment
        </span>
      );

    case RentalStatus.PAID:
      return (
        <Button
          size="sm"
          variant="primary"
          isLoading={pending}
          onClick={() => mutate(RentalStatus.PICKED_UP)}
        >
          Mark Picked Up
        </Button>
      );

    case RentalStatus.PICKED_UP:
      return (
        <Button
          size="sm"
          variant="outline"
          isLoading={pending}
          onClick={() => mutate(RentalStatus.RETURNED)}
        >
          Mark Returned
        </Button>
      );

    case RentalStatus.RETURNED:
    case RentalStatus.CANCELLED:
      return (
        <span className="text-xs text-slate-400">No actions</span>
      );

    default:
      return null;
  }
}

// ─── Mobile order card ────────────────────────────────────────────────────────

function OrderCard({ order }: { order: RentalOrderWithRelations }) {
  const imageSrc = order.gear?.images?.[0];
  const days     = calculateDays(order.startDate, order.endDate);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      {/* Customer + gear */}
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={order.gear?.name ?? "Gear"}
              className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-400 to-sky-400 text-xs font-black text-white">
              {(order.gear?.name ?? "G").slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {order.gear?.name ?? "—"}
          </p>
          <p className="text-xs text-slate-500">
            {order.customer?.name ?? "Customer"} · {order.customer?.email ?? ""}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {formatDate(order.startDate)} – {formatDate(order.endDate)} · {days} day{days !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Amount + status */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs text-slate-500">Total</p>
          <p className="font-bold text-slate-900">৳{order.totalAmount.toLocaleString("en-BD")}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 pt-3">
        <OrderActions order={order} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderOrdersPage() {
  const [activeTab, setActiveTab] = useState<RentalStatus | "ALL">("ALL");

  const { data: orders = [], isLoading, isError, error, refetch } = useProviderOrders();

  const filtered = useMemo(
    () => activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab),
    [orders, activeTab],
  );

  const countMap = useMemo(() => {
    const m: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => { m[o.status] = (m[o.status] ?? 0) + 1; });
    return m;
  }, [orders]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Incoming Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and update the status of customer rental orders.
        </p>
      </div>

      {/* Status tabs */}
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        role="tablist"
        aria-label="Filter orders by status"
      >
        {STATUS_TABS.map((tab) => {
          const count  = countMap[tab.value] ?? 0;
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
                active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100",
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

      {/* Loading */}
      {isLoading && (
        <>
          <div className="space-y-3 lg:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="h-4 w-1/2 rounded-full" />
                    <Skeleton variant="text" className="h-3 w-2/3 rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <Skeleton variant="text" className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block rounded-xl border border-slate-200 bg-white overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" className="h-4 w-40 rounded-full" />
                  <Skeleton variant="text" className="h-3 w-28 rounded-full" />
                </div>
                <Skeleton variant="text" className="h-4 w-24 rounded-full" />
                <Skeleton variant="text" className="h-4 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-800">Failed to load orders</p>
          <p className="mt-1 text-sm text-red-700">{error?.message ?? "Please try again."}</p>
          <button type="button" onClick={() => void refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          tone={activeTab === "ALL" ? "orders" : "search"}
          title={activeTab === "ALL" ? "No orders yet" : `No ${activeTab.toLowerCase()} orders`}
          description={
            activeTab === "ALL"
              ? "Once customers rent your gear, orders will appear here."
              : `No orders with status "${activeTab}".`
          }
          actionLabel={activeTab !== "ALL" ? "View all orders" : undefined}
          actionHref={activeTab !== "ALL" ? "/dashboard/provider/orders" : undefined}
          size="sm"
        />
      )}

      {/* Content */}
      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Gear</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => {
                  const imageSrc = order.gear?.images?.[0];
                  const days     = calculateDays(order.startDate, order.endDate);
                  return (
                    <TableRow key={order.id}>
                      {/* Customer */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-sky-400 text-xs font-bold text-white">
                            {(order.customer?.name ?? "C").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800 max-w-32">
                              {order.customer?.name ?? "—"}
                            </p>
                            <p className="truncate text-xs text-slate-400 max-w-32">
                              {order.customer?.email ?? ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Gear */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {imageSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imageSrc} alt={order.gear?.name ?? "Gear"}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-400 to-teal-400 text-[10px] font-black text-white">
                                {(order.gear?.name ?? "G").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="truncate text-sm text-slate-700 max-w-36">
                            {order.gear?.name ?? "—"}
                          </p>
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

                      {/* Amount */}
                      <TableCell className="font-semibold text-slate-900">
                        ৳{order.totalAmount.toLocaleString("en-BD")}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <OrderActions order={order} />
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
