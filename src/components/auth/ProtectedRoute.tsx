"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserRole } from "@/types";
import {
  useIsAuthenticated,
  useAuthLoading,
  useUser,
  useHasHydrated,
} from "@/store/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<UserRole>;
  fallback?: ReactNode;
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-slate-500">Checking authentication…</p>
      </div>
    </div>
  );
}

function UnauthorizedView() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M12 2 2 22h20L12 2Z" />
            <path d="M12 9v5" />
            <path d="M12 18h.01" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-600">
          You do not have permission to access this page.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Return home
        </a>
      </div>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useIsAuthenticated();
  const isAuthLoading = useAuthLoading();
  const hasHydrated = useHasHydrated();
  const user = useUser();

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthLoading) return;
    if (isAuthenticated) return;
    const search = searchParams?.toString();
    const redirect = search && search.length > 0 ? `${pathname}?${search}` : pathname;
    const loginUrl = new URL("/auth/login", "http://localhost");
    if (redirect && redirect !== "/auth/login" && redirect !== "/") {
      loginUrl.searchParams.set("redirect", redirect);
    }
    router.replace(`${loginUrl.pathname}${loginUrl.search}`);
  }, [isAuthenticated, isAuthLoading, hasHydrated, pathname, searchParams, router]);

  if (!hasHydrated || isAuthLoading) {
    return fallback ?? <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return fallback ?? <LoadingSpinner />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <UnauthorizedView />;
    }
  }

  return <>{children}</>;
}

export { LoadingSpinner, UnauthorizedView };
