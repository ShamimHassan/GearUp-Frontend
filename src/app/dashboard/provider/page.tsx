"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProviderGear, useProviderOrders } from "@/hooks/useProvider";
import { useUser } from "@/store/authStore";
import { StatusBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatDate, calculateDays } from "@/lib/utils";
import { RentalStatus, PaymentStatus } from "@/types";
import type { RentalOrderWithRelations } from "@/types";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, tone, icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone: "indigo" | "emerald" | "amber" | "blue" | "purple";
  icon: React.ReactNode;
}) {
  const t = {
    indigo:  { icon: "bg-indigo-100  text-indigo-600",  value: "text-indigo-700"  },
    emerald: { icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" },
    amber:   { icon: "bg-amber-100   text-amber-600",   value: "text-amber-700"   },
    blue:    { icon: "bg-blue-100    text-blue-600",    value: "text-blue-700"    },
    purple:  { icon: "bg-purple-100  text-purple-600",  value: "text-purple-700"  },
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.icon)}>
          {icon}
        </div>
      </div>
      <p className={cn("mt-3 text-3xl font-extrabold", t.value)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Recent order row ─────────────────────────────────────────────────────────

function RecentOrderRow({ order }: { order: RentalOrderWithRelations }) {
  const imageSrc = order.gear?.images?.[0];
  const days     = calculateDays(order.startDate, order.endDate);

  return (
    <TableRow>
      {/* Customer */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-sky-400 text-xs font-bold text-white">
            {(order.customer?.name ?? "C").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {order.customer?.name ?? "—"}
            </p>
            <p className="truncate text-xs text-slate-400">{order.customer?.email ?? ""}</p>
          </div>
        </div>
      </TableCell>

      {/* Gear */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt={order.gear?.name ?? "Gear"}
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-400 to-teal-400 text-[10px] font-black text-white">
                {(order.gear?.name ?? "G").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <p className="truncate text-sm text-slate-700 max-w-32">
            {order.gear?.name ?? "—"}
          </p>
        </div>
      </TableCell>

      {/* Dates */}
      <TableCell>
        <p className="text-sm text-slate-700">
          {formatDate(order.startDate)} – {formatDate(order.endDate)}
        </p>
        <p className="text-xs text-slate-400">{days} day{days !== 1 ? "s" : ""}</p>
      </TableCell>

      {/* Amount */}
      <TableCell className="font-semibold text-slate-900">
        ৳{order.totalAmount.toLocaleString("en-BD")}
      </TableCell>

      {/* Status */}
      <TableCell>
        <StatusBadge status={order.status} />
      </TableCell>

      {/* Action */}
      <TableCell className="text-right">
        <LinkButton href="/dashboard/provider/orders" variant="outline" size="sm">
          Manage
        </LinkButton>
      </TableCell>
    </TableRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderDashboardPage() {
  const user = useUser();
  const { data: gear    = [], isLoading: gearLoading  } = useProviderGear();
  const { data: orders  = [], isLoading: ordersLoading } = useProviderOrders();

  const isLoading = gearLoading || ordersLoading;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalGear    = gear.length;
    const activeGear   = gear.filter((g) => g.isAvailable).length;
    const pendingOrders  = orders.filter((o) => o.status === RentalStatus.PLACED).length;
    const activeRentals  = orders.filter((o) => o.status === RentalStatus.PICKED_UP).length;
    const totalRevenue   = orders
      .filter((o) => o.payment?.status === PaymentStatus.COMPLETED)
      .reduce((s, o) => s + (o.payment?.amount ?? 0), 0);
    return { totalGear, activeGear, pendingOrders, activeRentals, totalRevenue };
  }, [gear, orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders],
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s your provider overview.
          </p>
        </div>
        <LinkButton href="/dashboard/provider/gear/new" variant="primary" size="md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          Add New Gear
        </LinkButton>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" className="h-3 w-20 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <Skeleton variant="text" className="h-8 w-14 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total Gear" value={stats.totalGear} sub="listed items" tone="indigo"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>
              </svg>
            }
          />
          <StatCard label="Active Gear" value={stats.activeGear} sub="available to rent" tone="emerald"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            }
          />
          <StatCard label="Pending Orders" value={stats.pendingOrders} sub="awaiting confirmation" tone="amber"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            }
          />
          <StatCard label="Active Rentals" value={stats.activeRentals} sub="currently rented" tone="blue"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <path d="M8 2v4"/><path d="M16 2v4"/>
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M3 10h18"/>
              </svg>
            }
          />
          <StatCard
            label="Total Revenue"
            value={`৳${stats.totalRevenue.toLocaleString("en-BD")}`}
            sub="from completed payments"
            tone="purple"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
              </svg>
            }
          />
        </div>
      )}

      {/* ── Pending action banner ─────────────────────────────────── */}
      {!isLoading && stats.pendingOrders > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <span>
            You have{" "}
            <strong>{stats.pendingOrders} new order{stats.pendingOrders !== 1 ? "s" : ""}</strong>{" "}
            waiting for confirmation.{" "}
            <Link href="/dashboard/provider/orders" className="font-semibold underline hover:no-underline">
              Review orders →
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
          <Link href="/dashboard/provider/orders"
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 transition-colors">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" className="h-4 w-1/3 rounded-full" />
                  <Skeleton variant="text" className="h-3 w-1/4 rounded-full" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <EmptyState
            tone="orders"
            title="No orders yet"
            description="Once customers start placing orders for your gear, they'll show up here."
            actionLabel="Add gear to get started"
            actionHref="/dashboard/provider/gear/new"
            size="sm"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Gear</TableHead>
                <TableHead>Dates</TableHead>
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

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-4 text-base font-bold text-slate-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              href:  "/dashboard/provider/gear/new",
              label: "Add New Gear",
              desc:  "List a new item in your inventory",
              tone:  "indigo",
              icon:  (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="h-6 w-6" aria-hidden="true">
                  <path d="M5 12h14"/><path d="M12 5v14"/>
                </svg>
              ),
            },
            {
              href:  "/dashboard/provider/gear",
              label: "My Inventory",
              desc:  "Manage and edit your gear",
              tone:  "emerald",
              icon:  (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="h-6 w-6" aria-hidden="true">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>
                </svg>
              ),
            },
            {
              href:  "/dashboard/provider/orders",
              label: "Incoming Orders",
              desc:  "Confirm or reject order requests",
              tone:  "amber",
              icon:  (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="h-6 w-6" aria-hidden="true">
                  <path d="M8 2v4"/><path d="M16 2v4"/>
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>
                </svg>
              ),
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                item.tone === "indigo"  && "bg-indigo-100  text-indigo-600  group-hover:bg-indigo-200",
                item.tone === "emerald" && "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200",
                item.tone === "amber"   && "bg-amber-100   text-amber-600   group-hover:bg-amber-200",
              )}>
                {item.icon}
              </div>
              <div>
                <p className={cn(
                  "text-sm font-semibold text-slate-900 transition-colors",
                  item.tone === "indigo"  && "group-hover:text-indigo-700",
                  item.tone === "emerald" && "group-hover:text-emerald-700",
                  item.tone === "amber"   && "group-hover:text-amber-700",
                )}>
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
