"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import {
  useLogoutAction,
  useIsAuthenticated,
  useUser,
} from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { showSuccess } from "@/components/ui/Toast";

function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.ADMIN) {
    return <Badge tone="red" size="sm">ADMIN</Badge>;
  }
  if (role === UserRole.PROVIDER) {
    return <Badge tone="purple" size="sm">PROVIDER</Badge>;
  }
  return <Badge tone="emerald" size="sm">CUSTOMER</Badge>;
}

function getDashboardHref(role: UserRole): string {
  if (role === UserRole.ADMIN) return "/dashboard/admin";
  if (role === UserRole.PROVIDER) return "/dashboard/provider";
  return "/dashboard/customer";
}

function getOrdersHref(role: UserRole): string {
  if (role === UserRole.PROVIDER) return "/dashboard/provider/orders";
  return "/dashboard/customer/orders";
}

function getUserLinks(role: UserRole): Array<{ label: string; href: string }> {
  if (role === UserRole.ADMIN) {
    return [
      { label: "Dashboard", href: "/dashboard/admin" },
      { label: "User Management", href: "/dashboard/admin/users" },
    ];
  }
  if (role === UserRole.PROVIDER) {
    return [
      { label: "Dashboard", href: "/dashboard/provider" },
      { label: "My Inventory", href: "/dashboard/provider/gear" },
    ];
  }
  return [
    { label: "Dashboard", href: "/dashboard/customer" },
    { label: "My Orders", href: "/dashboard/customer/orders" },
  ];
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const logout = useLogoutAction();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    showSuccess("Logged out successfully");
    logout();
  };

  const publicLinks = [
    { label: "Browse Gear", href: "/gear" },
  ];

  const userLinks = user ? getUserLinks(user.role) : [];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors"
          >
            <span aria-hidden="true">GearUp 🏋️</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && userLinks.length > 0 && (
              <div className="mx-2 h-6 w-px bg-slate-200" aria-hidden="true" />
            )}
            {isAuthenticated &&
              userLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <LinkButton
                href="/auth/login"
                variant="ghost"
                size="md"
              >
                Login
              </LinkButton>
              <LinkButton
                href="/auth/register"
                variant="primary"
                size="md"
              >
                Register
              </LinkButton>
            </div>
          ) : (
            user && (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 pl-1.5 pr-2 py-1 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <Avatar size="sm" name={user.name}>
                    <AvatarImage />
                    <AvatarFallback />
                  </Avatar>
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-slate-900">
                      {user.name}
                    </span>
                    <RoleBadge role={user.role} />
                  </span>
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform",
                      profileOpen && "rotate-180"
                    )}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 animate-[fadeIn_.12s_ease-out] overflow-hidden"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                      <Avatar size="lg" name={user.name}>
                        <AvatarImage />
                        <AvatarFallback />
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                        <div className="mt-1">
                          <RoleBadge role={user.role} />
                          {user.isActive ? (
                            <StatusBadge
                              status="active"
                              size="sm"
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href={getDashboardHref(user.role)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        role="menuitem"
                      >
                        <svg
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-slate-500"
                        >
                          <rect x="3" y="3" width="7" height="9" rx="1" />
                          <rect x="14" y="3" width="7" height="5" rx="1" />
                          <rect x="14" y="12" width="7" height="9" rx="1" />
                          <rect x="3" y="16" width="7" height="5" rx="1" />
                        </svg>
                        Dashboard
                      </Link>

                      {user.role !== UserRole.ADMIN && (
                        <Link
                          href={getOrdersHref(user.role)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          role="menuitem"
                        >
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-slate-500"
                          >
                            <path d="M8 2v4" />
                            <path d="M16 2v4" />
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M3 10h18" />
                          </svg>
                          {user.role === UserRole.PROVIDER
                            ? "Incoming Orders"
                            : "My Orders"}
                        </Link>
                      )}

                      {user.role === UserRole.PROVIDER && (
                        <Link
                          href="/dashboard/provider/gear"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          role="menuitem"
                        >
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-slate-500"
                          >
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
                          </svg>
                          My Inventory
                        </Link>
                      )}

                      {user.role === UserRole.ADMIN && (
                        <Link
                          href="/dashboard/admin/users"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          role="menuitem"
                        >
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-slate-500"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          User Management
                        </Link>
                      )}

                      <Link
                        href={
                          user.role === UserRole.ADMIN
                            ? "/dashboard/admin"
                            : `/dashboard/${user.role.toLowerCase()}/settings`
                        }
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        role="menuitem"
                      >
                        <svg
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-slate-500"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                        </svg>
                        Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        role="menuitem"
                      >
                        <svg
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <path d="m16 17 5-5-5-5" />
                          <path d="M21 12H9" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              {mobileOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-base font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && userLinks.length > 0 && (
              <div className="my-2 h-px bg-slate-200" aria-hidden="true" />
            )}

            {isAuthenticated &&
              userLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-base font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}

            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-3 sm:hidden">
                <LinkButton
                  href="/auth/login"
                  variant="ghost"
                  block
                  size="md"
                >
                  Login
                </LinkButton>
                <LinkButton
                  href="/auth/register"
                  variant="primary"
                  block
                  size="md"
                >
                  Register
                </LinkButton>
              </div>
            ) : (
              user && (
                <div className="flex flex-col gap-2 pt-3 sm:hidden">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <Avatar size="md" name={user.name}>
                      <AvatarImage />
                      <AvatarFallback />
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>
                      <div className="mt-1">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>
                  </div>
                  <Link
                    href={
                      user.role === UserRole.ADMIN
                        ? "/dashboard/admin"
                        : `/dashboard/${user.role.toLowerCase()}/settings`
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Profile Settings
                  </Link>
                  <Button
                    variant="outline"
                    block
                    onClick={handleLogout}
                    className="!text-red-600 !border-red-200 hover:!bg-red-50"
                  >
                    Logout
                  </Button>
                </div>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export { Navbar };
