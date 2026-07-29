"use client";

import { useSearchParams } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();

  // SSLCommerz / Stripe may forward the order id so we can provide a direct retry link
  const orderId = searchParams.get("order_id") ?? searchParams.get("orderId") ?? "";

  const payUrl = orderId ? `/dashboard/customer/orders/${orderId}/pay` : "/dashboard/customer/orders";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md space-y-8">

        {/* ── Warning icon ─────────────────────────────────────── */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-amber-600"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </div>
        </div>

        {/* ── Heading ──────────────────────────────────────────── */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Payment Cancelled
          </h1>
          <p className="text-base text-slate-500 leading-relaxed">
            Your payment was not completed. Your order is still confirmed — you can
            retry payment whenever you&apos;re ready.
          </p>
        </div>

        {/* ── Info box ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 space-y-2 text-left">
          <p className="font-semibold">What happened?</p>
          <ul className="space-y-1.5 text-xs text-amber-700 list-disc list-inside">
            <li>You cancelled the payment at the gateway.</li>
            <li>No charge was made to your account.</li>
            <li>Your order status is still <strong>CONFIRMED</strong>.</li>
            <li>You can retry payment from your order details page.</li>
          </ul>
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <LinkButton
            href={payUrl}
            variant="primary"
            size="lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="h-4 w-4" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
            {orderId ? "Retry Payment" : "Back to Orders"}
          </LinkButton>
          <LinkButton
            href="/dashboard/customer/orders"
            variant="outline"
            size="lg"
          >
            View All Orders
          </LinkButton>
        </div>

        {/* ── Help link ─────────────────────────────────────────── */}
        <p className="text-xs text-slate-400">
          Having trouble?{" "}
          <a
            href="mailto:support@gearup.com"
            className="text-emerald-700 hover:underline font-medium"
          >
            Contact support
          </a>
        </p>

      </div>
    </div>
  );
}
