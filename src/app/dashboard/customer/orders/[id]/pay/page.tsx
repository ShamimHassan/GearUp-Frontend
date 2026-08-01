"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRentalDetails } from "@/hooks/useRentals";
import { useCreatePayment } from "@/hooks/usePayments";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate, calculateDays } from "@/lib/utils";
import { showError } from "@/components/ui/Toast";
import { PaymentMethod, RentalStatus } from "@/types";

// ─── Payment method card ──────────────────────────────────────────────────────

interface MethodCardProps {
  value: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}

function MethodCard({
  value, selected, onSelect, title, description, badge, icon,
}: MethodCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        selected
          ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      {/* Icon area */}
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
        selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600",
      )}>
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {badge && <Badge tone="emerald" size="sm">{badge}</Badge>}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>

      {/* Radio indicator */}
      <div className={cn(
        "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white",
      )}>
        {selected && (
          <div className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </div>
    </button>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <dt className="text-sm text-slate-500 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800 text-right">{value}</dd>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.SSLCOMMERZ);
  const [redirecting, setRedirecting] = useState(false);

  const { data: order, isLoading, isError, error } = useRentalDetails(id);
  const createPayment = useCreatePayment();

  // Guard: only CONFIRMED orders can be paid
  const canPay = order?.status === RentalStatus.CONFIRMED;

  const handlePay = useCallback(async () => {
    if (!order || !canPay) return;
    setRedirecting(true);
    try {
      const result = await createPayment.mutateAsync({
        rentalOrderId: order.id,
        method,
      });
      // useCreatePayment's onSuccess already handles redirect via window.location.href
      const url = result?.gatewayPageURL ?? result?.gatewayUrl;
      if (!url) {
        showError("No gateway URL returned. Please try again.");
        setRedirecting(false);
      }
    } catch {
      // toast handled by useCreatePayment's onError
      setRedirecting(false);
    }
  }, [order, canPay, createPayment, method]);

  const isPending = createPayment.isPending || redirecting;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-5 py-8">
        <Skeleton variant="text" className="h-7 w-40 rounded-full" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-5 w-2/3 rounded-full" />
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

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-7 w-7" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Order not found</h2>
        <p className="mt-1 text-sm text-slate-500">
          {error?.message ?? "This order does not exist or cannot be accessed."}
        </p>
        <LinkButton href="/dashboard/customer/orders" variant="primary" size="md" className="mt-5">
          ← Back to orders
        </LinkButton>
      </div>
    );
  }

  // ── Already paid / wrong status ───────────────────────────────────────────
  if (!canPay) {
    const statusMessages: Partial<Record<RentalStatus, { title: string; desc: string; tone: "emerald" | "amber" | "red" | "slate" }>> = {
      [RentalStatus.PLACED]:    { title: "Order not confirmed yet",  desc: "Payment is only available after the provider confirms your order.", tone: "amber" },
      [RentalStatus.PAID]:      { title: "Already paid",             desc: "This order has already been paid successfully.",                    tone: "emerald" },
      [RentalStatus.PICKED_UP]: { title: "Gear already picked up",   desc: "This rental is already in progress.",                              tone: "emerald" },
      [RentalStatus.RETURNED]:  { title: "Rental completed",         desc: "This rental has already been returned and closed.",                tone: "slate" },
      [RentalStatus.CANCELLED]: { title: "Order cancelled",          desc: "This order was cancelled and cannot be paid.",                     tone: "red" },
    };
    const msg = statusMessages[order.status] ?? { title: "Payment unavailable", desc: "This order cannot be paid right now.", tone: "slate" as const };
    const toneClasses = {
      emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
      amber:   "border-amber-200 bg-amber-50 text-amber-800",
      red:     "border-red-200 bg-red-50 text-red-800",
      slate:   "border-slate-200 bg-slate-50 text-slate-700",
    };

    return (
      <div className="mx-auto max-w-xl space-y-5 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Payment</h1>
        <div className={cn("rounded-2xl border px-5 py-4", toneClasses[msg.tone])}>
          <p className="font-semibold">{msg.title}</p>
          <p className="mt-0.5 text-sm">{msg.desc}</p>
        </div>
        <div className="flex gap-3">
          <LinkButton href={`/dashboard/customer/orders/${id}`} variant="outline" size="md">
            ← View order
          </LinkButton>
          <LinkButton href="/dashboard/customer/orders" variant="primary" size="md">
            All orders
          </LinkButton>
        </div>
      </div>
    );
  }

  const imageSrc   = order.gear?.images?.[0];
  const days       = calculateDays(order.startDate, order.endDate);
  const gradFallback = "from-emerald-400 to-teal-400";

  return (
    <div className="mx-auto max-w-xl space-y-6 py-2">

      {/* ── Breadcrumb ────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard/customer/orders" className="hover:text-slate-700 transition-colors">
          Orders
        </Link>
        <span aria-hidden="true">›</span>
        <Link href={`/dashboard/customer/orders/${id}`} className="hover:text-slate-700 transition-colors">
          {id.slice(0, 8)}…
        </Link>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-slate-700">Payment</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Complete Payment</h1>

      {/* ── Order summary ─────────────────────────────────────────── */}
      <section aria-labelledby="order-summary-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="order-summary-heading"
          className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Order summary
        </h2>
        <div className="flex items-start gap-4">
          {/* Gear thumbnail */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={order.gear?.name ?? "Gear"}
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
                "absolute inset-0 items-center justify-center bg-linear-to-br text-sm font-black text-white",
                gradFallback,
                imageSrc ? "hidden" : "flex",
              )}
              aria-hidden="true"
            >
              {(order.gear?.name ?? "G").slice(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 leading-snug">{order.gear?.name ?? "—"}</p>
            {order.gear?.brand && (
              <p className="mt-0.5 text-xs uppercase tracking-widest text-slate-400">
                {order.gear.brand}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {order.gear?.category && (
                <Badge tone="blue" size="sm">{order.gear.category.name}</Badge>
              )}
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        {/* Rental details */}
        <dl className="mt-4 space-y-0 divide-y divide-slate-100">
          <InfoRow label="Start date"  value={formatDate(order.startDate)} />
          <InfoRow label="End date"    value={formatDate(order.endDate)} />
          <InfoRow label="Duration"    value={`${days} day${days !== 1 ? "s" : ""}`} />
          <InfoRow
            label="Total amount"
            value={
              <span className="text-lg font-extrabold text-emerald-700">
                ৳{order.totalAmount.toLocaleString("en-BD")}
              </span>
            }
          />
        </dl>
      </section>

      {/* ── Payment method ────────────────────────────────────────── */}
      <section aria-labelledby="method-heading">
        <h2 id="method-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Payment method
        </h2>
        <div className="space-y-3" role="radiogroup" aria-labelledby="method-heading">
          <MethodCard
            value={PaymentMethod.SSLCOMMERZ}
            selected={method === PaymentMethod.SSLCOMMERZ}
            onSelect={() => setMethod(PaymentMethod.SSLCOMMERZ)}
            title="SSLCommerz"
            badge="Recommended"
            description="Pay via bKash, Nagad, Rocket, debit/credit card or internet banking. Supports all major Bangladeshi payment channels."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                className="h-6 w-6" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 15h2"/><path d="M10 15h4"/>
              </svg>
            }
          />
          <MethodCard
            value={PaymentMethod.STRIPE}
            selected={method === PaymentMethod.STRIPE}
            onSelect={() => setMethod(PaymentMethod.STRIPE)}
            title="Stripe"
            description="Pay with international debit or credit card (Visa, Mastercard, Amex). Secure 3D authentication."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                className="h-6 w-6" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 15h4"/>
              </svg>
            }
          />
        </div>
      </section>

      {/* ── Redirecting state ─────────────────────────────────────── */}
      {redirecting && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <svg className="h-5 w-5 animate-spin shrink-0 text-emerald-600"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <span>Redirecting to secure payment gateway… please wait.</span>
        </div>
      )}

      {/* ── Error from mutation ───────────────────────────────────── */}
      {createPayment.isError && !redirecting && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">Payment failed: </span>
          {createPayment.error?.message ?? "Something went wrong. Please try again."}
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          block
          disabled={isPending}
          onClick={() => router.push(`/dashboard/customer/orders/${id}`)}
        >
          ← Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          block
          isLoading={isPending}
          disabled={isPending}
          onClick={handlePay}
        >
          {isPending
            ? "Processing…"
            : `Proceed to Pay — ৳${order.totalAmount.toLocaleString("en-BD")}`}
        </Button>
      </div>

      {/* ── Trust signals ─────────────────────────────────────────── */}
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-400">
        {[
          "256-bit SSL encryption",
          "Insured up to ৳50,000",
          "Free cancellation up to 48h",
        ].map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true">
              <path fillRule="evenodd"
                d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z"
                clipRule="evenodd"/>
            </svg>
            {item}
          </li>
        ))}
      </ul>

    </div>
  );
}
