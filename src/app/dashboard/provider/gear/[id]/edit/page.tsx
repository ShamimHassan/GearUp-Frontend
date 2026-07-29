"use client";

import { use } from "react";
import Link from "next/link";
import { useProviderGear } from "@/hooks/useProvider";
import GearForm from "@/components/provider/GearForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { LinkButton } from "@/components/ui/Button";

export default function EditGearPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: gear = [], isLoading } = useProviderGear();
  const item = gear.find((g) => g.id === id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-7 w-40 rounded-full" />
          <Skeleton variant="text" className="h-4 w-56 rounded-full" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton variant="text" className="h-4 w-24 rounded-full" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-bold text-slate-900">Gear not found</p>
        <p className="mt-1 text-sm text-slate-500">
          This item may have been removed or doesn&apos;t belong to your inventory.
        </p>
        <LinkButton href="/dashboard/provider/gear" variant="primary" size="md" className="mt-5">
          ← Back to inventory
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard/provider" className="hover:text-slate-700 transition-colors">Dashboard</Link>
        <span aria-hidden="true">›</span>
        <Link href="/dashboard/provider/gear" className="hover:text-slate-700 transition-colors">Inventory</Link>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-slate-700 truncate max-w-32">{item.name}</span>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-slate-700">Edit</span>
      </nav>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Edit Gear</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update details for <strong>{item.name}</strong>.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <GearForm gear={item} />
      </div>
    </div>
  );
}
