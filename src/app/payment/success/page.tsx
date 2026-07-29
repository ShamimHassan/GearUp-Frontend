"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useConfirmPayment } from "@/hooks/usePayments";
import { LinkButton } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

// ─── Animated check icon ─────────────────────────────────────────────────────

function AnimatedCheck() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      {/* Pulse ring */}
      <span
        className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20"
        aria-hidden="true"
      />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-emerald-600"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
    </div>
  );
}

// ─── Confirmation status states ───────────────────────────────────────────────

type ConfirmState = "confirming" | "confirmed" | "failed" | "skipped";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentSuccessPage() {
  const searchParams  = useSearchParams();
  const confirmPayment = useConfirmPayment();

  // SSLCommerz returns these query params after success
  const tranId   = searchParams.get("tran_id")   ?? searchParams.get("tranId")   ?? "";
  const valId    = searchParams.get("val_id")     ?? "";
  const amount   = searchParams.get("amount")     ?? "";
  const status   = searchParams.get("status")     ?? "";
  const orderId  = searchParams.get("order_id")   ?? searchParams.get("orderId")  ?? "";

  const [confirmState, setConfirmState] = useState<ConfirmState>(
    tranId ? "confirming" : "skipped",
  );

  const calledRef = useRef(false);

  // Try to confirm payment once on mount when tran_id is present.
  // Backend webhook may have already confirmed it, so we treat errors as non-fatal.
  useEffect(() => {
    if (!tranId || calledRef.current) return;
    calledRef.current = true;

    confirmPayment.mutate(
      { tran_id: tranId, val_id: valId, amount, status },
      {
        onSuccess: () => setConfirmState("confirmed"),
        onError:   () => setConfirmState("failed"),   // non-fatal — webhook may have handled it
      },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirming = confirmState === "confirming";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md space-y-8">

        {/* ── Icon ─────────────────────────────────────────────── */}
        <AnimatedCheck />

        {/* ── Heading ──────────────────────────────────────────── */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Payment Successful!
          </h1>
          <p className="text-base text-slate-500 leading-relaxed">
            Thank you! Your payment has been processed and your rental is confirmed.
          </p>
        </div>

        {/* ── Transaction details ───────────────────────────────── */}
        {(tranId || orderId) && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left space-y-3">
            {tranId && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-slate-500 shrink-0">Transaction ID</span>
                <span className="font-mono text-xs font-semibold text-slate-800 break-all text-right">
                  {tranId}
                </span>
              </div>
            )}
            {amount && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <span className="text-sm text-slate-500">Amount paid</span>
                <span className="font-bold text-emerald-700">৳{Number(amount).toLocaleString("en-BD")}</span>
              </div>
            )}
            {orderId && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <span className="text-sm text-slate-500">Order</span>
                <Link
                  href={`/dashboard/customer/orders/${orderId}`}
                  className="font-mono text-xs text-emerald-700 hover:underline"
                >
                  {orderId.slice(0, 16)}…
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Confirmation status ───────────────────────────────── */}
        {confirming && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <svg
              className="h-4 w-4 animate-spin shrink-0 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Confirming your payment status…
          </div>
        )}

        {confirmState === "confirmed" && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="h-4 w-4" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Payment confirmed — your order is now PAID.
          </div>
        )}

        {confirmState === "failed" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <strong>Note:</strong> Real-time status update pending. Your payment was received —
            your order status will update automatically within a few minutes.
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <LinkButton
            href="/dashboard/customer/orders"
            variant="primary"
            size="lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="h-4 w-4" aria-hidden="true">
              <path d="M8 2v4"/><path d="M16 2v4"/>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
            View My Orders
          </LinkButton>
          <LinkButton
            href="/gear"
            variant="outline"
            size="lg"
          >
            Browse More Gear
          </LinkButton>
        </div>

        {/* ── Trust note ────────────────────────────────────────── */}
        <p className="text-xs text-slate-400">
          A receipt has been sent to your registered email address.
        </p>

      </div>
    </div>
  );
}
