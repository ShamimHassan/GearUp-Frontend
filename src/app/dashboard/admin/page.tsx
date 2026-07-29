"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAllUsers, useAllGearAdmin, useAllRentalsAdmin } from "@/hooks/useAdmin";
import { useUser } from "@/store/authStore";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate } from "@/lib/utils";
import { RentalStatus, PaymentStatus, UserRole } from "@/types";

function StatCard({ label, value, sub, tone, icon }: {
  label: string; value: string | number; sub?: string;
  tone: "red" | "emerald" | "blue" | "amber" | "purple"; icon: React.ReactNode;
}) {
  const t = {
    red:     { icon: "bg-red-100     text-red-600",     value: "text-red-700"     },
    emerald: { icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" },
    blue:    { icon: "bg-blue-100    text-blue-600",    value: "text-blue-700"    },
    amber:   { icon: "bg-amber-100   text-amber-600",   value: "text-amber-700"   },
    purple:  { icon: "bg-purple-100  text-purple-600",  value: "text-purple-700"  },
  }[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.icon)}>{icon}</div>
      </div>
      <p className={cn("mt-3 text-3xl font-extrabold", t.value)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const user = useUser();
  const { data: users   = [], isLoading: uLoading } = useAllUsers();
  const { data: gear    = [], isLoading: gLoading  } = useAllGearAdmin();
  const { data: rentals = [], isLoading: rLoading  } = useAllRentalsAdmin();
  const isLoading = uLoading || gLoading || rLoading;

  const stats = useMemo(() => {
    const totalUsers   = users.length;
    const activeUsers  = users.filter((u) => u.isActive).length;
    const customers    = users.filter((u) => u.role === UserRole.CUSTOMER).length;
    const providers    = users.filter((u) => u.role === UserRole.PROVIDER).length;
    const totalGear    = gear.length;
    const activeRentals = rentals.filter((r) => ![RentalStatus.CANCELLED, RentalStatus.RETURNED].includes(r.status)).length;
    const totalRevenue  = rentals
      .filter((r) => r.payment?.status === PaymentStatus.COMPLETED)
      .reduce((s, r) => s + (r.payment?.amount ?? 0), 0);
    return { totalUsers, activeUsers, customers, providers, totalGear, activeRentals, totalRevenue };
  }, [users, gear, rentals]);

  const recentRentals = useMemo(
    () => [...rentals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [rentals],
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const iconProps = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "h-5 w-5", "aria-hidden": true as const };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {greeting}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Platform overview — GearUp Admin</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/dashboard/admin/users" variant="outline" size="md">Users</LinkButton>
          <LinkButton href="/dashboard/admin/gear" variant="primary" size="md">All Gear</LinkButton>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between"><Skeleton variant="text" className="h-3 w-20 rounded-full" /><Skeleton className="h-9 w-9 rounded-xl" /></div>
              <Skeleton variant="text" className="h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats.totalUsers} sub={`${stats.customers} customers · ${stats.providers} providers`} tone="red"
            icon={<svg {...iconProps}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatCard label="Active Users" value={stats.activeUsers} sub="not suspended" tone="emerald"
            icon={<svg {...iconProps}><path d="M20 6 9 17l-5-5"/></svg>}
          />
          <StatCard label="Total Gear" value={stats.totalGear} sub="all listings" tone="blue"
            icon={<svg {...iconProps}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>}
          />
          <StatCard label="Active Rentals" value={stats.activeRentals} sub="not cancelled/returned" tone="amber"
            icon={<svg {...iconProps}><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>}
          />
        </div>
      )}

      {/* Revenue */}
      {!isLoading && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">Platform Revenue</p>
          <p className="mt-2 text-4xl font-extrabold text-purple-700">৳{stats.totalRevenue.toLocaleString("en-BD")}</p>
          <p className="mt-1 text-xs text-purple-400">From completed payments across all providers</p>
        </div>
      )}

      {/* Recent rentals */}
      <section aria-labelledby="recent-rentals-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-rentals-heading" className="text-base font-bold text-slate-900">Recent Rentals</h2>
          <Link href="/dashboard/admin/rentals" className="text-xs font-semibold text-red-700 hover:text-red-800 transition-colors">View all →</Link>
        </div>
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
                <div className="flex-1 space-y-1.5"><Skeleton variant="text" className="h-4 w-1/3 rounded-full" /><Skeleton variant="text" className="h-3 w-1/4 rounded-full" /></div>
                <Skeleton variant="text" className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentRentals.length === 0 ? (
          <p className="text-sm text-slate-500">No rentals yet.</p>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
            {recentRentals.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{r.gear?.name ?? "—"}</p>
                  <p className="truncate text-xs text-slate-400">{r.customer?.name ?? "—"} · {formatDate(r.startDate)}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 shrink-0">৳{r.totalAmount.toLocaleString("en-BD")}</p>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section aria-labelledby="admin-actions-heading">
        <h2 id="admin-actions-heading" className="mb-4 text-base font-bold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { href: "/dashboard/admin/users",   label: "Manage Users",   desc: "Suspend or activate accounts", tone: "red"     as const },
            { href: "/dashboard/admin/gear",    label: "All Gear",       desc: "Browse all listings",          tone: "blue"    as const },
            { href: "/dashboard/admin/rentals", label: "All Rentals",    desc: "Monitor all orders",           tone: "emerald" as const },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                item.tone === "red"     && "bg-red-100 text-red-600 group-hover:bg-red-200",
                item.tone === "blue"    && "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
                item.tone === "emerald" && "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200",
              )}>
                <svg {...iconProps}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
