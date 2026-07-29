"use client";

import { use, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, differenceInCalendarDays, parseISO, isValid, startOfToday, addDays } from "date-fns";
import { useGearDetails, useGearReviews } from "@/hooks/useGear";
import { useMyRentals } from "@/hooks/useRentals";
import { useIsAuthenticated, useUser } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate } from "@/lib/utils";
import { showError } from "@/components/ui/Toast";
import ReviewDialog, { StarDisplay } from "@/components/review/ReviewDialog";
import { RentalStatus } from "@/types";
import type { ReviewWithRelations } from "@/types";

// ─── Image gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  const fallbackColors = [
    "from-emerald-400 via-teal-300 to-cyan-400",
    "from-indigo-400 via-blue-300 to-sky-400",
    "from-amber-400 via-orange-300 to-rose-400",
    "from-violet-400 via-purple-300 to-fuchsia-400",
  ];
  const grad = fallbackColors[name.charCodeAt(0) % fallbackColors.length];

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-4/3 w-full items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-sm",
          grad,
        )}
        aria-label={name}
      >
        <div className="text-center">
          <p className="text-6xl font-black tracking-tight drop-shadow">
            {name.slice(0, 2).toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={images[active]}
          alt={`${name} — image ${active + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const fb = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement | null;
            if (fb) fb.style.display = "flex";
          }}
        />
        {/* fallback behind image */}
        <div
          className={cn(
            "absolute inset-0 hidden items-center justify-center bg-linear-to-br text-white",
            grad,
          )}
          aria-hidden="true"
        >
          <p className="text-5xl font-black">{name.slice(0, 2).toUpperCase()}</p>
        </div>
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                active === i
                  ? "border-emerald-500 shadow-sm"
                  : "border-transparent hover:border-slate-300",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Reviews section ──────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewWithRelations }) {
  const initials = review.user?.name
    ? review.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-400 text-sm font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {review.user?.name ?? "Anonymous"}
            </p>
            <StarDisplay rating={review.rating} />
            <span className="text-xs text-slate-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ gearId }: { gearId: string }) {
  const { data: reviews = [], isLoading, isError } = useGearReviews(gearId);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton variant="text" className="h-4 w-28 rounded-full" />
                <Skeleton variant="text" className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton variant="paragraph" lines={2} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-slate-500">Could not load reviews. Try refreshing.</p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-center">
            <p className="text-4xl font-extrabold text-slate-900">{avgRating.toFixed(1)}</p>
            <StarDisplay rating={avgRating} />
            <p className="mt-1 text-xs text-slate-500">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="ml-4 flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-4 text-right">{star}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                    className="h-3 w-3 text-amber-400" aria-hidden="true">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/40 py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm font-medium text-slate-500">No reviews yet</p>
          <p className="mt-1 text-xs text-slate-400">Be the first to rent and review this gear.</p>
        </div>
      ) : (
        reviews.map((r) => <ReviewCard key={r.id} review={r} />)
      )}
    </div>
  );
}

// ─── Gear reviews section (with write-review button) ─────────────────────────

function GearReviewsSection({ gearId, gearName }: { gearId: string; gearName: string }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const { data: reviews = [], isLoading: reviewsLoading, refetch } = useGearReviews(gearId);
  const { data: myRentals = [] } = useMyRentals({ enabled: isAuthenticated });

  // Customer can review if they have a RETURNED rental for this gear and haven't reviewed yet
  const hasReturnedRental = useMemo(
    () => myRentals.some((r) => r.gearId === gearId && r.status === RentalStatus.RETURNED),
    [myRentals, gearId],
  );
  const hasAlreadyReviewed = useMemo(
    () => reviews.some((r) => r.userId === user?.id),
    [reviews, user],
  );
  const canReview = isAuthenticated && user?.role === "CUSTOMER" && hasReturnedRental && !hasAlreadyReviewed;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 id="reviews-heading" className="text-xl font-bold text-slate-900">
          Customer Reviews
        </h2>
        {canReview && (
          <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="h-4 w-4" aria-hidden="true">
              <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
            </svg>
            Write a review
          </Button>
        )}
      </div>

      <ReviewsSection gearId={gearId} />

      <ReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        gearId={gearId}
        gearName={gearName}
        onSuccess={() => void refetch()}
      />
    </div>
  );
}

// ─── Rent Now box ─────────────────────────────────────────────────────────────

interface RentBoxProps {
  gearId: string;
  pricePerDay: number;
  stock: number;
  isAvailable: boolean;
}

function RentBox({ gearId, pricePerDay, stock, isAvailable }: RentBoxProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const today = startOfToday();
  const todayStr = format(today, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);

  // Derived values
  const start = parseISO(startDate);
  const end   = parseISO(endDate);

  const daysCount = useMemo(() => {
    if (!isValid(start) || !isValid(end)) return 0;
    const diff = differenceInCalendarDays(end, start);
    return diff > 0 ? diff : 0;
  }, [start, end]);

  const totalPrice = daysCount * pricePerDay;

  const startTooEarly = isValid(start) && start < today;
  const endBeforeStart = isValid(end) && isValid(start) && end <= start;

  const canRent =
    isAvailable &&
    stock > 0 &&
    daysCount > 0 &&
    !startTooEarly &&
    !endBeforeStart;

  // Navigate to checkout page, passing dates as search params
  const handleRent = useCallback(() => {
    if (!isAuthenticated) {
      const returnTo = `/gear/${gearId}/checkout?startDate=${startDate}&endDate=${endDate}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (user?.role && (user.role as string) !== "CUSTOMER") {
      showError("Only customers can rent gear.");
      return;
    }
    router.push(`/gear/${gearId}/checkout?startDate=${startDate}&endDate=${endDate}`);
  }, [isAuthenticated, user, gearId, startDate, endDate, router]);

  if (!isAvailable || stock <= 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-6 w-6" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <p className="font-semibold text-slate-700">Currently unavailable</p>
        <p className="mt-1 text-sm text-slate-500">This gear is out of stock or unlisted by the provider.</p>
        <LinkButton href="/gear" variant="outline" size="sm" className="mt-4">
          Browse other gear
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rental price</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-slate-900">
            ৳{pricePerDay.toLocaleString("en-BD")}
          </span>
          <span className="text-sm text-slate-500">/ day</span>
        </div>
      </div>

      {/* Date pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="start-date" className="block text-xs font-semibold text-slate-600">
            Start date
          </label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            min={todayStr}
            onChange={(e) => {
              setStartDate(e.target.value);
              // auto-advance end if needed
              if (e.target.value >= endDate) {
                setEndDate(format(addDays(parseISO(e.target.value), 1), "yyyy-MM-dd"));
              }
            }}
            invalid={startTooEarly}
            aria-describedby={startTooEarly ? "start-date-error" : undefined}
          />
          {startTooEarly && (
            <p id="start-date-error" className="text-xs text-red-600">
              Start date cannot be in the past.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="end-date" className="block text-xs font-semibold text-slate-600">
            End date
          </label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            min={startDate ? format(addDays(parseISO(startDate), 1), "yyyy-MM-dd") : tomorrowStr}
            onChange={(e) => setEndDate(e.target.value)}
            invalid={endBeforeStart}
            aria-describedby={endBeforeStart ? "end-date-error" : undefined}
          />
          {endBeforeStart && (
            <p id="end-date-error" className="text-xs text-red-600">
              End date must be after start date.
            </p>
          )}
        </div>
      </div>

      {/* Price summary */}
      {daysCount > 0 && (
        <div className="rounded-xl bg-emerald-50 p-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>৳{pricePerDay.toLocaleString("en-BD")} × {daysCount} day{daysCount !== 1 ? "s" : ""}</span>
            <span className="font-semibold">৳{totalPrice.toLocaleString("en-BD")}</span>
          </div>
          <div className="flex justify-between border-t border-emerald-100 pt-1.5 font-semibold text-slate-900">
            <span>Estimated total</span>
            <span className="text-emerald-700">৳{totalPrice.toLocaleString("en-BD")}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <Button
        variant="primary"
        size="lg"
        block
        disabled={!canRent}
        onClick={handleRent}
      >
        {!isAuthenticated
          ? "Sign in to Rent"
          : daysCount === 0
            ? "Select valid dates"
            : `Review & Rent — ৳${totalPrice.toLocaleString("en-BD")}`}
      </Button>

      {!isAuthenticated && (
        <p className="text-center text-xs text-slate-500">
          <Link href={`/auth/login?redirect=/gear/${gearId}`} className="text-emerald-700 hover:underline font-medium">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href="/auth/register" className="text-emerald-700 hover:underline font-medium">
            create an account
          </Link>{" "}
          to rent gear.
        </p>
      )}

      <p className="text-center text-xs text-slate-400">
        Free cancellation up to 48h · Insured up to ৳50,000
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GearDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: gear, isLoading, isError, error } = useGearDetails(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-3 w-16 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <CardSkeleton className="aspect-4/3 p-0! space-y-0!" />
            <div className="space-y-5">
              <Skeleton variant="paragraph" lines={6} />
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !gear) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-7 w-7">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Gear not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          {error?.message ?? "This listing may have been removed or doesn't exist."}
        </p>
        <LinkButton href="/gear" variant="primary" size="md" className="mt-5">
          ← Browse all gear
        </LinkButton>
      </div>
    );
  }

  const stockInfo =
    gear.stock <= 0
      ? { label: "Out of stock", tone: "red" as const }
      : gear.stock <= 3
        ? { label: `Only ${gear.stock} left`, tone: "orange" as const }
        : { label: `${gear.stock} in stock`, tone: "emerald" as const };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/gear" className="hover:text-slate-700 transition-colors">Browse Gear</Link>
          {gear.category && (
            <>
              <span aria-hidden="true">›</span>
              <Link
                href={`/gear?category=${gear.category.id}`}
                className="hover:text-slate-700 transition-colors"
              >
                {gear.category.name}
              </Link>
            </>
          )}
          <span aria-hidden="true">›</span>
          <span className="font-medium text-slate-700 truncate max-w-40">{gear.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

          {/* Left – image gallery */}
          <div>
            <ImageGallery images={gear.images} name={gear.name} />
          </div>

          {/* Right – info + rent box */}
          <div className="space-y-6">
            {/* Category + availability badges */}
            <div className="flex flex-wrap items-center gap-2">
              {gear.category && (
                <Link href={`/gear?category=${gear.category.id}`}>
                  <Badge tone="blue" size="sm" className="cursor-pointer hover:opacity-80 transition-opacity">
                    {gear.category.name}
                  </Badge>
                </Link>
              )}
              <Badge tone={stockInfo.tone} size="sm">{stockInfo.label}</Badge>
              {!gear.isAvailable && (
                <Badge tone="suspended" size="sm">Unlisted by provider</Badge>
              )}
            </div>

            {/* Title + brand */}
            <div>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                {gear.name}
              </h1>
              {gear.brand && (
                <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-slate-400">
                  {gear.brand}
                </p>
              )}
            </div>

            {/* Price (prominent) */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-emerald-700">
                ৳{gear.price.toLocaleString("en-BD")}
              </span>
              <span className="text-base text-slate-500">/ day</span>
            </div>

            {/* Description */}
            {gear.description && (
              <p className="text-sm leading-relaxed text-slate-600">{gear.description}</p>
            )}

            {/* Provider info */}
            {gear.provider && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-sky-400 text-sm font-bold text-white">
                  {gear.provider.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Listed by</p>
                  <p className="text-sm font-semibold text-slate-800">{gear.provider.name}</p>
                </div>
                {gear.provider.isActive && (
                  <Badge tone="emerald" size="sm" className="ml-auto">Verified</Badge>
                )}
              </div>
            )}

            {/* Rent box */}
            <RentBox
              gearId={gear.id}
              pricePerDay={gear.price}
              stock={gear.stock}
              isAvailable={gear.isAvailable}
            />
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-14" aria-labelledby="reviews-heading">
          <GearReviewsSection gearId={gear.id} gearName={gear.name} />
        </section>

      </div>
    </div>
  );
}
