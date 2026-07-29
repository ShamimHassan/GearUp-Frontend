"use client";

import { use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsAuthenticated, useHasHydrated } from "@/store/authStore";
import RentalCheckout from "@/components/rental/RentalCheckout";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const isAuthenticated = useIsAuthenticated();
  const hasHydrated = useHasHydrated();

  const startDate = searchParams.get("startDate") ?? "";
  const endDate   = searchParams.get("endDate")   ?? "";

  // Redirect unauthenticated users to login, preserving full return URL
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      const returnTo = `/gear/${id}/checkout?startDate=${startDate}&endDate=${endDate}`;
      router.replace(`/auth/login?redirect=${encodeURIComponent(returnTo)}`);
    }
  }, [hasHydrated, isAuthenticated, id, startDate, endDate, router]);

  // While auth state is still hydrating show a skeleton
  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-10 sm:px-6">
        <Skeleton variant="text" className="h-7 w-48 rounded-full" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-5 w-3/4 rounded-full" />
              <Skeleton variant="text" className="h-4 w-1/2 rounded-full" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-4 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  // Don't render checkout at all for unauthenticated (redirect is in progress)
  if (!isAuthenticated) return null;

  return (
    <RentalCheckout
      gearId={id}
      startDate={startDate}
      endDate={endDate}
    />
  );
}
