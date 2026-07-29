"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useIsAuthenticated, useHasHydrated, useUser } from "@/store/authStore";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

const NAV_ITEMS = [
  {
    label: "Dashboard", href: "/dashboard/admin", exact: true,
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  },
  {
    label: "User Management", href: "/dashboard/admin/users", exact: false,
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: "All Gear", href: "/dashboard/admin/gear", exact: false,
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>,
  },
  {
    label: "All Rentals", href: "/dashboard/admin/rentals", exact: false,
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>,
  },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const hasHydrated = useHasHydrated();
  const user = useUser();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) { router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`); return; }
    if (user && user.role !== UserRole.ADMIN) {
      router.replace(user.role === UserRole.PROVIDER ? "/dashboard/provider" : "/dashboard/customer");
    }
  }, [hasHydrated, isAuthenticated, user, router, pathname]);

  if (!hasHydrated) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );

  if (!isAuthenticated || !user || user.role !== UserRole.ADMIN) return null;

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-60 xl:w-64 shrink-0">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-red-400 to-rose-400 text-sm font-bold text-white shrink-0">
                  {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>
            <nav aria-label="Admin dashboard navigation">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          active ? "bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100" : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm",
                        )}>
                        <span className={active ? "text-red-600" : "text-slate-400"}>{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
