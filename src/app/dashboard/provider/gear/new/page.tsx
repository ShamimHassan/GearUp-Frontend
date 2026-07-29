"use client";

import Link from "next/link";
import GearForm from "@/components/provider/GearForm";

export default function NewGearPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard/provider" className="hover:text-slate-700 transition-colors">Dashboard</Link>
        <span aria-hidden="true">›</span>
        <Link href="/dashboard/provider/gear" className="hover:text-slate-700 transition-colors">Inventory</Link>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-slate-700">Add new gear</span>
      </nav>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Add New Gear</h1>
        <p className="mt-1 text-sm text-slate-500">
          List a new item in your inventory. It will be visible on the marketplace once published.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <GearForm />
      </div>
    </div>
  );
}
