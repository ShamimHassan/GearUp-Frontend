"use client";

import { useMemo, useState } from "react";
import { useAllRentalsAdmin, useAllGearAdmin } from "@/hooks/useAdmin";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatDate, calculateDays } from "@/lib/utils";
import { RentalStatus } from "@/types";

const STATUS_TABS: Array<{ label: string; value: RentalStatus | "ALL" }> = [
  { label: "All",       value: "ALL" },
  { label: "Placed",    value: RentalStatus.PLACED },
  { label: "Confirmed", value: RentalStatus.CONFIRMED },
  { label: "Paid",      value: RentalStatus.PAID },
  { label: "Picked Up", value: RentalStatus.PICKED_UP },
  { label: "Returned",  value: RentalStatus.RETURNED },
  { label: "Cancelled", value: RentalStatus.CANCELLED },
];

export default function AdminRentalsPage() {
  const [activeTab, setActiveTab] = useState<RentalStatus | "ALL">("ALL");
  const { data: rentals = [], isLoading, isError, error, refetch } = useAllRentalsAdmin();
  // Fetch gear list so we can look up provider names (rental API doesn't include them)
  const { data: allGear = [] } = useAllGearAdmin();

  // Build a quick gearId → provider name lookup map
  const providerByGearId = useMemo(() => {
    const map: Record<string, string> = {};
    allGear.forEach((g) => {
      if (g.provider?.name) map[g.id] = g.provider.name;
    });
    return map;
  }, [allGear]);

  // Helper to get provider name for a rental
  const getProvider = (r: (typeof rentals)[0]) =>
    r.gear?.provider?.name ?? providerByGearId[r.gearId] ?? "—";

  const filtered = useMemo(
    () => activeTab === "ALL" ? rentals : rentals.filter((r) => r.status === activeTab),
    [rentals, activeTab],
  );

  const countMap = useMemo(() => {
    const m: Record<string, number> = { ALL: rentals.length };
    rentals.forEach((r) => { m[r.status] = (m[r.status] ?? 0) + 1; });
    return m;
  }, [rentals]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">All Rentals</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isLoading ? "Loading…" : `${rentals.length} total rental orders platform-wide`}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => {
          const count = countMap[tab.value] ?? 0;
          const active = activeTab === tab.value;
          return (
            <button key={tab.value} type="button" role="tab" aria-selected={active}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                active ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100",
              )}>
              {tab.label}
              {count > 0 && (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold",
                  active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
              <div className="flex-1 space-y-1.5"><Skeleton variant="text" className="h-4 w-40 rounded-full" /><Skeleton variant="text" className="h-3 w-28 rounded-full" /></div>
              <Skeleton variant="text" className="h-4 w-24 rounded-full" />
              <Skeleton variant="text" className="h-4 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="font-semibold text-red-800">Failed to load rentals</p>
          <p className="mt-1 text-sm text-red-700">{error?.message}</p>
          <button type="button" onClick={() => void refetch()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Try again</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState tone={activeTab === "ALL" ? "orders" : "search"}
          title={activeTab === "ALL" ? "No rentals yet" : `No ${activeTab.toLowerCase()} rentals`}
          description={activeTab === "ALL" ? "Rentals will appear here once customers place orders." : `No orders with status "${activeTab}".`}
          size="sm" />
      )}

      {/* Mobile cards + Desktop table */}
      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* ── Mobile cards (< md) ─────────────────────────────────────── */}
          <div className="space-y-3 md:hidden">
            {filtered.map((r) => {
              const days = calculateDays(r.startDate, r.endDate);
              return (
                <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  {/* Gear + Customer */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{r.gear?.name ?? "—"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer: <span className="font-medium text-slate-700">{r.customer?.name ?? "—"}</span>
                      </p>
                      <p className="text-xs text-slate-400">{r.customer?.email ?? ""}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {/* Meta row */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-slate-500">Provider</p>
                      <p className="font-medium text-slate-700 truncate">{getProvider(r)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Amount</p>
                      <p className="font-bold text-slate-900">৳{r.totalAmount.toLocaleString("en-BD")}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Dates</p>
                      <p className="font-medium text-slate-700">{formatDate(r.startDate)} – {formatDate(r.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Duration</p>
                      <p className="font-medium text-slate-700">{days} day{days !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <p className="font-mono text-xs text-slate-400">{r.id.slice(0, 8)}…</p>
                    <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop table (≥ md) ─────────────────────────────────────── */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Gear</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const days = calculateDays(r.startDate, r.endDate);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs text-slate-500">{r.id.slice(0, 8)}…</TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800 max-w-28">{r.customer?.name ?? "—"}</p>
                          <p className="truncate text-xs text-slate-400 max-w-28">{r.customer?.email ?? ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-24 truncate">{getProvider(r)}</TableCell>
                      <TableCell className="text-sm text-slate-700 max-w-28 truncate">{r.gear?.name ?? "—"}</TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-700">{formatDate(r.startDate)} – {formatDate(r.endDate)}</p>
                        <p className="text-xs text-slate-400">{days} day{days !== 1 ? "s" : ""}</p>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">৳{r.totalAmount.toLocaleString("en-BD")}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-xs text-slate-400">{formatDate(r.createdAt)}</TableCell>
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
