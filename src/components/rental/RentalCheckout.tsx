"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { differenceInCalendarDays, parseISO, isValid, format } from "date-fns";
import { useGearDetails } from "@/hooks/useGear";
import { useCreateRental } from "@/hooks/useRentals";
import { useUser } from "@/store/authStore";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { showError, showSuccess } from "@/components/ui/Toast";
import { cn, formatDate, calculateDays } from "@/lib/utils";

interface RentalCheckoutProps {
  gearId: string;
  startDate: string;
  endDate: string;
}

export default function RentalCheckout({ gearId, startDate, endDate }: RentalCheckoutProps) {
  const router = useRouter();
  const user = useUser();
  const createRental = useCreateRental();

  const { data: gear, isLoading, isError, error } = useGearDetails(gearId);

  const [agreed, setAgreed] = useState(false);

  // ── Derived date values ────────────────────────────────────────────────────
  const start = parseISO(startDate);
  const end   = parseISO(endDate);
  const datesValid = isValid(start) && isValid(end) && end > start;

  const days = useMemo(() => {
    if (!datesValid) return 0;
    return Math.max(differenceInCalendarDays(end, start), 1);
  }, [datesValid, start, end]);

  const totalAmount = useMemo(
    () => (gear ? gear.price * days : 0),
    [gear, days],
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!agreed) {
      showError("Please agree to the rental terms before continuing.");
      return;
    }
    if (!datesValid) {
      showError("Invalid dates", "Please go back and select valid dates.");
      return;
    }
    try {
      const order = await createRental.mutateAsync({ gearId, startDate, endDate });
      showSuccess("Order placed!", "Your rental request is awaiting provider confirmation.");
      router.push(`/dashboard/customer/orders/${order.id}`);
    } catch {
      // toast handled by useCreateRental's onError
    }
  }, [agreed, datesValid, createRental, gearId, startDate, endDate, router]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton variant="text" className="h-7 w-48 rounded-full" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-5 w-3/4 rounded-full" />
              <Skeleton variant="text" className="h-4 w-1/2 rounded-full" />
              <Skeleton variant="text" className="h-4 w-1/3 rounded-full" />
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

  // ── Error / not found ──────────────────────────────────────────────────────
  if (isError || !gear) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-7 w-7" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Gear not found</h2>
        <p className="mt-1 text-sm text-slate-500">
          {error?.message ?? "This listing may no longer be available."}
        </p>
        <LinkButton href="/gear" variant="primary" size="md" className="mt-5">
          Browse all gear
        </LinkButton>
      </div>
    );
  }

  // ── Invalid dates guard ────────────────────────────────────────────────────
  if (!datesValid) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-7 w-7" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" x2="12" y1="9" y2="13"/>
            <line x1="12" x2="12.01" y1="17" y2="17"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Invalid rental dates</h2>
        <p className="mt-1 text-sm text-slate-500">
          Please go back and select a valid start and end date.
        </p>
        <LinkButton href={`/gear/${gearId}`} variant="primary" size="md" className="mt-5">
          ← Back to gear details
        </LinkButton>
      </div>
    );
  }

  const imageSrc = gear.images?.[0];
  const fallbackGrad = "from-emerald-400 to-teal-400";

  const stockInfo =
    gear.stock <= 0
      ? { label: "Out of stock", tone: "red" as const }
      : gear.stock <= 3
        ? { label: `Only ${gear.stock} left`, tone: "orange" as const }
        : { label: "In stock", tone: "emerald" as const };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/gear" className="hover:text-slate-700 transition-colors">Browse Gear</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/gear/${gearId}`} className="hover:text-slate-700 transition-colors">
            {gear.name}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-slate-700">Checkout</span>
        </nav>

        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-slate-900">
          Confirm your rental
        </h1>

        <div className="space-y-5">

          {/* ── Gear summary card ─────────────────────────────────────── */}
          <section
            aria-labelledby="gear-summary-heading"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 id="gear-summary-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Gear
            </h2>
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt={gear.name}
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
                    "absolute inset-0 items-center justify-center bg-linear-to-br text-white text-lg font-black",
                    fallbackGrad,
                    imageSrc ? "hidden" : "flex",
                  )}
                  aria-hidden="true"
                >
                  {gear.name.slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-900 leading-snug">{gear.name}</p>
                {gear.brand && (
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {gear.brand}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {gear.category && (
                    <Badge tone="blue" size="sm">{gear.category.name}</Badge>
                  )}
                  <Badge tone={stockInfo.tone} size="sm">{stockInfo.label}</Badge>
                </div>
                {gear.provider && (
                  <p className="mt-2 text-xs text-slate-500">
                    Listed by{" "}
                    <span className="font-semibold text-slate-700">{gear.provider.name}</span>
                  </p>
                )}
              </div>

              {/* Price per day */}
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">per day</p>
                <p className="text-lg font-extrabold text-slate-900">
                  ৳{gear.price.toLocaleString("en-BD")}
                </p>
              </div>
            </div>
          </section>

          {/* ── Rental dates & pricing ────────────────────────────────── */}
          <section
            aria-labelledby="rental-details-heading"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 id="rental-details-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Rental details
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Start date</dt>
                <dd className="font-semibold text-slate-800">{formatDate(startDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">End date</dt>
                <dd className="font-semibold text-slate-800">{formatDate(endDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-semibold text-slate-800">
                  {days} day{days !== 1 ? "s" : ""}
                </dd>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <dt className="text-slate-500">
                  ৳{gear.price.toLocaleString("en-BD")} × {days} day{days !== 1 ? "s" : ""}
                </dt>
                <dd className="font-semibold text-slate-800">
                  ৳{totalAmount.toLocaleString("en-BD")}
                </dd>
              </div>
              <div className="flex justify-between rounded-xl bg-emerald-50 px-4 py-3">
                <dt className="font-bold text-slate-900">Total amount</dt>
                <dd className="text-lg font-extrabold text-emerald-700">
                  ৳{totalAmount.toLocaleString("en-BD")}
                </dd>
              </div>
            </dl>
          </section>

          {/* ── Customer info ─────────────────────────────────────────── */}
          {user && (
            <section
              aria-labelledby="customer-info-heading"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 id="customer-info-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Your details
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="font-semibold text-slate-800">{user.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-semibold text-slate-800">{user.email}</dd>
                </div>
                {user.phone && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-semibold text-slate-800">{user.phone}</dd>
                  </div>
                )}
                {user.address && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Address</dt>
                    <dd className="font-semibold text-slate-800 text-right max-w-[60%]">{user.address}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 text-xs text-slate-400">
                Not your info?{" "}
                <Link href="/dashboard/customer/settings" className="text-emerald-700 hover:underline">
                  Update your profile
                </Link>
              </p>
            </section>
          )}

          {/* ── Terms checkbox ────────────────────────────────────────── */}
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:bg-slate-50">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-emerald-600"
              aria-describedby="terms-description"
            />
            <span id="terms-description" className="text-sm leading-relaxed text-slate-600">
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-emerald-700 hover:underline">
                rental terms and conditions
              </Link>
              . I understand that the gear must be returned in the same condition, and that late returns
              may incur additional charges. Bookings are covered by GearUp&apos;s insurance up to ৳50,000.
            </span>
          </label>

          {/* ── Notice ───────────────────────────────────────────────── */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>
              Your order status will be <strong>PLACED</strong> until the provider confirms.
              Payment is only required after confirmation.
            </span>
          </div>

          {/* ── Action buttons ───────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              block
              onClick={() => router.push(`/gear/${gearId}`)}
              disabled={createRental.isPending}
            >
              ← Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              block
              isLoading={createRental.isPending}
              disabled={!agreed || createRental.isPending || gear.stock <= 0 || !gear.isAvailable}
              onClick={handleSubmit}
            >
              {createRental.isPending ? "Placing order…" : `Place order — ৳${totalAmount.toLocaleString("en-BD")}`}
            </Button>
          </div>

          {/* ── Trust signals ────────────────────────────────────────── */}
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-400">
            <li className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true">
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd"/>
              </svg>
              Free cancellation up to 48h
            </li>
            <li className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true">
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd"/>
              </svg>
              Insured up to ৳50,000
            </li>
            <li className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true">
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd"/>
              </svg>
              Verified providers only
            </li>
          </ul>

        </div>
      </div>
    </div>
  );
}

export { RentalCheckout };
