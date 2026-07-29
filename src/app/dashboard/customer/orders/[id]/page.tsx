"use client";

import { use, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRentalDetails } from "@/hooks/useRentals";
import { useGearReviews } from "@/hooks/useGear";
import { LinkButton, Button } from "@/components/ui/Button";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/Dialog";
import { showSuccess, showError } from "@/components/ui/Toast";
import { cn, formatDate, formatDateTime, calculateDays } from "@/lib/utils";
import { RentalStatus, PaymentStatus, PaymentMethod, RENTAL_STATUS_FLOW } from "@/types";
import type { RentalOrderWithRelations } from "@/types";
import { reviewApi } from "@/api";

// ─── Status stepper ───────────────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  [RentalStatus.PLACED]:    "Order Placed",
  [RentalStatus.CONFIRMED]: "Confirmed",
  [RentalStatus.PAID]:      "Payment Done",
  [RentalStatus.PICKED_UP]: "Picked Up",
  [RentalStatus.RETURNED]:  "Returned",
};

function StatusStepper({ status }: { status: RentalStatus }) {
  const isCancelled = status === RentalStatus.CANCELLED;
  const currentIdx  = RENTAL_STATUS_FLOW.indexOf(status as typeof RENTAL_STATUS_FLOW[number]);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-red-500" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        <span className="text-sm font-semibold text-red-700">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-0">
        {RENTAL_STATUS_FLOW.map((step, idx) => {
          const done    = currentIdx > idx;
          const current = currentIdx === idx;
          const last    = idx === RENTAL_STATUS_FLOW.length - 1;
          return (
            <li key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                  done    ? "border-emerald-500 bg-emerald-500 text-white"
                  : current ? "border-emerald-500 bg-white text-emerald-600 shadow-sm ring-2 ring-emerald-200"
                  :           "border-slate-200 bg-white text-slate-400",
                )}>
                  {done ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      className="h-4 w-4" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  ) : idx + 1}
                </div>
                <span className={cn(
                  "text-[10px] font-semibold whitespace-nowrap",
                  current ? "text-emerald-700" : done ? "text-slate-600" : "text-slate-400",
                )}>
                  {STEP_LABELS[step]}
                </span>
              </div>
              {!last && (
                <div className={cn(
                  "mb-5 h-0.5 w-10 sm:w-14 transition-colors",
                  done ? "bg-emerald-500" : "bg-slate-200",
                )}/>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Star rating picker ───────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110 focus-visible:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="1.5"
            className={cn(
              "h-8 w-8 transition-colors",
              (hovered || value) >= star ? "text-amber-400" : "text-slate-300",
            )}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Review dialog ────────────────────────────────────────────────────────────

const reviewSchema = z.object({
  rating:  z.number().int().min(1, "Please select a rating").max(5),
  comment: z.string().max(1000, "Max 1000 characters").optional(),
});
type ReviewForm = z.infer<typeof reviewSchema>;

function ReviewDialog({
  open, onClose, gearId, orderId,
}: { open: boolean; onClose: () => void; gearId: string; orderId: string }) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const rating = watch("rating");

  const onSubmit = async (data: ReviewForm) => {
    try {
      await reviewApi.createReview({ rating: data.rating, comment: data.comment, gearId });
      showSuccess("Review submitted", "Thank you for your feedback!");
      reset();
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to submit review.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
          <DialogDescription>Share your experience to help other adventurers.</DialogDescription>
          <DialogClose />
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Your rating</label>
              <StarPicker value={rating} onChange={(v) => setValue("rating", v, { shouldValidate: true })} />
              {errors.rating && <p className="text-xs text-red-600">{errors.rating.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="review-comment" className="block text-sm font-semibold text-slate-700">
                Comment <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <Textarea
                id="review-comment"
                placeholder="What did you think of the gear?"
                rows={4}
                {...register("comment")}
                invalid={!!errors.comment}
              />
              {errors.comment && <p className="text-xs text-red-600">{errors.comment.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="md" type="button" onClick={() => { reset(); onClose(); }}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting} disabled={rating === 0 || isSubmitting}>
              Submit review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Action panel (status-based CTAs) ────────────────────────────────────────

function ActionPanel({ order, onReview }: { order: RentalOrderWithRelations; onReview: () => void }) {
  const router = useRouter();
  const { data: reviews = [] } = useGearReviews(order.gearId);
  const hasReviewed = reviews.some((r) => r.userId === order.customerId);

  switch (order.status) {
    case RentalStatus.PLACED:
      return (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="h-5 w-5 shrink-0 text-yellow-600" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p className="text-sm font-semibold text-yellow-800">Awaiting provider confirmation</p>
          </div>
          <p className="text-xs text-yellow-700">
            Your order has been placed. The provider will confirm within 30 minutes.
          </p>
        </div>
      );

    case RentalStatus.CONFIRMED:
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Order confirmed — payment required</p>
            <p className="mt-0.5 text-xs text-blue-700">Complete payment to secure your rental.</p>
          </div>
          <Button variant="primary" size="lg" block
            onClick={() => router.push(`/dashboard/customer/orders/${order.id}/pay`)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="h-4 w-4" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            Pay Now — ৳{order.totalAmount.toLocaleString("en-BD")}
          </Button>
        </div>
      );

    case RentalStatus.PAID:
      return (
        <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-4">
          <p className="text-sm font-semibold text-purple-800">Payment received — awaiting pickup</p>
          <p className="mt-0.5 text-xs text-purple-700">
            Coordinate with the provider to pick up your gear on{" "}
            <strong>{formatDate(order.startDate)}</strong>.
          </p>
        </div>
      );

    case RentalStatus.PICKED_UP:
      return (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden="true">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">Gear is with you — enjoy the adventure!</p>
            <p className="mt-0.5 text-xs text-green-700">
              Return by <strong>{formatDate(order.endDate)}</strong>.
            </p>
          </div>
        </div>
      );

    case RentalStatus.RETURNED:
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700">Rental completed — thanks for using GearUp!</p>
          </div>
          {!hasReviewed && (
            <Button variant="outline" size="md" block onClick={onReview}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-4 w-4" aria-hidden="true">
                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
              </svg>
              Leave a Review
            </Button>
          )}
          {hasReviewed && (
            <p className="text-center text-xs text-slate-500">✓ You&apos;ve already reviewed this gear.</p>
          )}
        </div>
      );

    case RentalStatus.CANCELLED:
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
          <p className="text-sm font-semibold text-red-800">Order cancelled</p>
          <p className="mt-0.5 text-xs text-red-700">This order was cancelled and is no longer active.</p>
        </div>
      );

    default:
      return null;
  }
}

// ─── Info row helper ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <dt className="text-sm text-slate-500 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800 text-right">{value}</dd>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [reviewOpen, setReviewOpen] = useState(false);

  const { data: order, isLoading, isError, error, refetch } = useRentalDetails(id);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton variant="text" className="h-6 w-40 rounded-full" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Skeleton variant="text" className="h-5 w-32 rounded-full" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <Skeleton variant="text" className="h-4 w-24 rounded-full" />
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} variant="text" className="h-4 rounded-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-bold text-slate-900">Order not found</p>
        <p className="mt-1 text-sm text-slate-500">
          {error?.message ?? "This order may not exist or you don't have access."}
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" size="md" onClick={() => void refetch()}>Retry</Button>
          <LinkButton href="/dashboard/customer/orders" variant="primary" size="md">
            ← All orders
          </LinkButton>
        </div>
      </div>
    );
  }

  const days = calculateDays(order.startDate, order.endDate);
  const imageSrc = order.gear?.images?.[0];

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb + heading ──────────────────────────────────── */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/dashboard/customer" className="hover:text-slate-700 transition-colors">Dashboard</Link>
          <span aria-hidden="true">›</span>
          <Link href="/dashboard/customer/orders" className="hover:text-slate-700 transition-colors">Orders</Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-slate-700">{order.id.slice(0, 8)}…</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Order Details</h1>
          <StatusBadge status={order.status} size="md" />
        </div>
      </div>

      {/* ── Status stepper ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order progress</h2>
        <StatusStepper status={order.status} />
      </div>

      {/* ── Action panel ───────────────────────────────────────────── */}
      <ActionPanel order={order} onReview={() => setReviewOpen(true)} />

      {/* ── Main grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Gear card */}
        <section aria-labelledby="gear-section-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 id="gear-section-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Gear
          </h2>
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc} alt={order.gear?.name ?? "Gear"}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-400 to-teal-400 text-sm font-black text-white">
                  {(order.gear?.name ?? "G").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900">{order.gear?.name ?? "—"}</p>
              {order.gear?.brand && (
                <p className="text-xs uppercase tracking-widest text-slate-400">{order.gear.brand}</p>
              )}
              {order.gear?.category && (
                <Badge tone="blue" size="sm" className="mt-2">{order.gear.category.name}</Badge>
              )}
              {order.gear?.provider && (
                <p className="mt-2 text-xs text-slate-500">
                  By <span className="font-semibold text-slate-700">{order.gear.provider.name}</span>
                </p>
              )}
            </div>
          </div>
          <LinkButton href={`/gear/${order.gearId}`} variant="outline" size="sm">
            View listing →
          </LinkButton>
        </section>

        {/* Order info */}
        <section aria-labelledby="order-info-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 id="order-info-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Order info
          </h2>
          <dl>
            <InfoRow label="Order ID" value={<span className="font-mono text-xs">{order.id}</span>} />
            <InfoRow label="Start date" value={formatDate(order.startDate)} />
            <InfoRow label="End date" value={formatDate(order.endDate)} />
            <InfoRow label="Duration" value={`${days} day${days !== 1 ? "s" : ""}`} />
            <InfoRow label="Total amount" value={
              <span className="text-emerald-700">৳{order.totalAmount.toLocaleString("en-BD")}</span>
            } />
            <InfoRow label="Placed on" value={formatDate(order.createdAt)} />
          </dl>
        </section>
      </div>

      {/* ── Payment section ─────────────────────────────────────────── */}
      {order.payment && (
        <section aria-labelledby="payment-section-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 id="payment-section-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Payment
          </h2>
          <dl>
            <InfoRow label="Transaction ID" value={
              <span className="font-mono text-xs">{order.payment.transactionId}</span>
            } />
            <InfoRow label="Method" value={
              order.payment.method === PaymentMethod.SSLCOMMERZ ? "SSLCommerz" : "Stripe"
            } />
            <InfoRow label="Amount" value={`৳${order.payment.amount.toLocaleString("en-BD")}`} />
            <InfoRow label="Status" value={<StatusBadge status={order.payment.status} />} />
            {order.payment.paidAt && (
              <InfoRow label="Paid at" value={formatDateTime(order.payment.paidAt)} />
            )}
          </dl>
        </section>
      )}

      {/* ── Review dialog ───────────────────────────────────────────── */}
      {order.gearId && (
        <ReviewDialog
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          gearId={order.gearId}
          orderId={order.id}
        />
      )}
    </div>
  );
}
