"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePaymentHistory } from "@/hooks/usePayments";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogClose,
} from "@/components/ui/Dialog";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { PaymentStatus, PaymentMethod } from "@/types";
import type { PaymentWithRelations } from "@/types";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, tone, icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone: "emerald" | "purple" | "red";
  icon: React.ReactNode;
}) {
  const t = {
    emerald: { icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" },
    purple:  { icon: "bg-purple-100  text-purple-600",  value: "text-purple-700"  },
    red:     { icon: "bg-red-100     text-red-600",     value: "text-red-700"     },
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.icon)}>
          {icon}
        </div>
      </div>
      <p className={cn("mt-3 text-3xl font-extrabold", t.value)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Method label ─────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <Badge tone={method === PaymentMethod.SSLCOMMERZ ? "blue" : "purple"} size="sm">
      {method === PaymentMethod.SSLCOMMERZ ? "SSLCommerz" : "Stripe"}
    </Badge>
  );
}

// ─── Receipt modal ────────────────────────────────────────────────────────────

function ReceiptModal({
  payment,
  open,
  onClose,
}: {
  payment: PaymentWithRelations | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogClose />
        </DialogHeader>

        {/* Receipt body */}
        <div className="space-y-4 px-6 py-5">
          {/* Status banner */}
          <div className="flex justify-center">
            <StatusBadge status={payment.status} size="md" />
          </div>

          {/* Details */}
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden text-sm">
            {[
              { label: "Transaction ID", value: <span className="font-mono text-xs break-all">{payment.transactionId}</span> },
              { label: "Amount",         value: <span className="font-bold text-emerald-700">৳{payment.amount.toLocaleString("en-BD")}</span> },
              { label: "Method",         value: <MethodBadge method={payment.method} /> },
              { label: "Status",         value: <StatusBadge status={payment.status} /> },
              { label: "Date",           value: payment.paidAt ? formatDateTime(payment.paidAt) : formatDate(payment.createdAt) },
              ...(payment.rentalOrder
                ? [{ label: "Order", value: (
                    <Link
                      href={`/dashboard/customer/orders/${payment.rentalOrderId}`}
                      className="font-mono text-xs text-emerald-700 hover:underline"
                      onClick={onClose}
                    >
                      {payment.rentalOrderId.slice(0, 16)}…
                    </Link>
                  ) }]
                : []),
              ...(payment.rentalOrder?.gear
                ? [{ label: "Gear", value: payment.rentalOrder.gear.name }]
                : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                <dt className="text-slate-500 shrink-0">{label}</dt>
                <dd className="font-semibold text-slate-800 text-right">{value}</dd>
              </div>
            ))}
          </dl>

          {payment.rentalOrder && (
            <div className="text-center">
              <Link
                href={`/dashboard/customer/orders/${payment.rentalOrderId}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={onClose}
              >
                View full order →
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS: Array<{ label: string; value: PaymentStatus | "ALL" }> = [
  { label: "All",       value: "ALL" },
  { label: "Completed", value: PaymentStatus.COMPLETED },
  { label: "Pending",   value: PaymentStatus.PENDING },
  { label: "Failed",    value: PaymentStatus.FAILED },
];

// ─── Mobile payment card ──────────────────────────────────────────────────────

function PaymentCard({
  payment,
  onReceipt,
}: {
  payment: PaymentWithRelations;
  onReceipt: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-slate-500 truncate">{payment.transactionId}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            ৳{payment.amount.toLocaleString("en-BD")}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {payment.paidAt
              ? formatDate(payment.paidAt)
              : formatDate(payment.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={payment.status} />
          <MethodBadge method={payment.method} />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        {payment.rentalOrder?.gear ? (
          <p className="truncate text-xs text-slate-500 max-w-37.5">
            {payment.rentalOrder.gear.name}
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onReceipt}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          View Receipt
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerPaymentsPage() {
  const [activeTab, setActiveTab] = useState<PaymentStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<PaymentWithRelations | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const { data: payments = [], isLoading, isError, error, refetch } = usePaymentHistory();

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalPaid = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((s, p) => s + Number(p.amount), 0);
    const pending = payments.filter((p) => p.status === PaymentStatus.PENDING).length;
    const failed  = payments.filter((p) => p.status === PaymentStatus.FAILED).length;
    return { totalPaid, pending, failed };
  }, [payments]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => activeTab === "ALL" ? payments : payments.filter((p) => p.status === activeTab),
    [payments, activeTab],
  );

  const countMap = useMemo(() => {
    const m: Record<string, number> = { ALL: payments.length };
    payments.forEach((p) => { m[p.status] = (m[p.status] ?? 0) + 1; });
    return m;
  }, [payments]);

  const openReceipt = (p: PaymentWithRelations) => {
    setSelected(p);
    setReceiptOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Payment History</h1>
        <p className="mt-1 text-sm text-slate-500">
          All your transactions in one place.
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" className="h-3 w-24 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <Skeleton variant="text" className="h-8 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Paid"
            value={`৳${stats.totalPaid.toLocaleString("en-BD")}`}
            sub="completed payments"
            tone="emerald"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
              </svg>
            }
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            sub="awaiting confirmation"
            tone="purple"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            }
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            sub="unsuccessful transactions"
            tone="red"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            }
          />
        </div>
      )}

      {/* ── Status filter tabs ────────────────────────────────────── */}
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        role="tablist"
        aria-label="Filter payments by status"
      >
        {STATUS_TABS.map((tab) => {
          const count = countMap[tab.value] ?? 0;
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold",
                  active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600",
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Loading ───────────────────────────────────────────────── */}
      {isLoading && (
        <>
          <div className="space-y-3 sm:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="h-3 w-2/3 rounded-full" />
                    <Skeleton variant="text" className="h-5 w-1/3 rounded-full" />
                    <Skeleton variant="text" className="h-3 w-1/4 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block rounded-xl border border-slate-200 bg-white overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" className="h-3 w-40 rounded-full" />
                  <Skeleton variant="text" className="h-3 w-24 rounded-full" />
                </div>
                <Skeleton variant="text" className="h-4 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-800">Failed to load payments</p>
          <p className="mt-1 text-sm text-red-700">{error?.message ?? "Please try again."}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Empty ─────────────────────────────────────────────────── */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          tone={activeTab === "ALL" ? "payments" : "search"}
          title={activeTab === "ALL" ? "No payments yet" : `No ${activeTab.toLowerCase()} payments`}
          description={
            activeTab === "ALL"
              ? "Complete a rental order to see your payment history here."
              : `You don't have any ${activeTab.toLowerCase()} payments.`
          }
          actionLabel={activeTab === "ALL" ? "Browse Gear" : "View all payments"}
          actionHref={activeTab === "ALL" ? "/gear" : "/dashboard/customer/payments"}
          size="sm"
        />
      )}

      {/* ── Mobile cards ──────────────────────────────────────────── */}
      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="space-y-3 sm:hidden">
            {filtered.map((p) => (
              <PaymentCard key={p.id} payment={p} onReceipt={() => openReceipt(p)} />
            ))}
          </div>

          {/* ── Desktop table ──────────────────────────────────────── */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    {/* Txn ID */}
                    <TableCell>
                      <p className="font-mono text-xs text-slate-600 max-w-35 truncate">
                        {p.transactionId}
                      </p>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <p className="text-sm text-slate-700">
                        {p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </p>
                    </TableCell>

                    {/* Order link */}
                    <TableCell>
                      {p.rentalOrderId ? (
                        <Link
                          href={`/dashboard/customer/orders/${p.rentalOrderId}`}
                          className="font-mono text-xs text-emerald-700 hover:underline"
                        >
                          {p.rentalOrderId.slice(0, 10)}…
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="font-bold text-slate-900">
                      ৳{p.amount.toLocaleString("en-BD")}
                    </TableCell>

                    {/* Method */}
                    <TableCell>
                      <MethodBadge method={p.method} />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => openReceipt(p)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        View Receipt
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* ── Receipt modal ──────────────────────────────────────────── */}
      <ReceiptModal
        payment={selected}
        open={receiptOpen}
        onClose={() => { setReceiptOpen(false); setSelected(null); }}
      />
    </div>
  );
}
