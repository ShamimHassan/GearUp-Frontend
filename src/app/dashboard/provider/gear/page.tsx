"use client";

import { useState } from "react";
import Link from "next/link";
import { useProviderGear, useDeleteGear, useUpdateGear } from "@/hooks/useProvider";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import type { GearItem } from "@/types";

// ─── Availability toggle ──────────────────────────────────────────────────────

function AvailabilityToggle({ gear }: { gear: GearItem }) {
  const updateGear = useUpdateGear();
  const toggling   = updateGear.isPending;

  return (
    <button
      type="button"
      disabled={toggling}
      onClick={() =>
        updateGear.mutate({
          id:   gear.id,
          data: {
            name:        gear.name,
            description: gear.description ?? undefined,
            brand:       gear.brand       ?? undefined,
            categoryId:  gear.categoryId,
            price:       gear.price,
            stock:       gear.stock,
            images:      gear.images,
            isAvailable: !gear.isAvailable,
          },
        })
      }
      aria-label={gear.isAvailable ? "Mark as unavailable" : "Mark as available"}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
        gear.isAvailable ? "bg-indigo-600" : "bg-slate-300",
        toggling && "opacity-50 cursor-not-allowed",
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
        gear.isAvailable ? "translate-x-5" : "translate-x-0",
      )} />
    </button>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteDialog({
  gear,
  open,
  onClose,
}: {
  gear: GearItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const deleteGear = useDeleteGear();

  if (!gear) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove gear</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>&quot;{gear.name}&quot;</strong> from your
            inventory? This cannot be undone.
          </DialogDescription>
          <DialogClose />
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="md" onClick={onClose} disabled={deleteGear.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="md"
            isLoading={deleteGear.isPending}
            onClick={async () => {
              await deleteGear.mutateAsync(gear.id);
              onClose();
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderInventoryPage() {
  const [deleteTarget, setDeleteTarget] = useState<GearItem | null>(null);

  const { data: gear = [], isLoading, isError, error, refetch } = useProviderGear();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? "Loading…" : `${gear.length} item${gear.length !== 1 ? "s" : ""} listed`}
          </p>
        </div>
        <LinkButton href="/dashboard/provider/gear/new" variant="primary" size="md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          Add New Gear
        </LinkButton>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton variant="text" className="h-4 w-40 rounded-full" />
                <Skeleton variant="text" className="h-3 w-24 rounded-full" />
              </div>
              <Skeleton variant="text" className="h-5 w-16 rounded-full" />
              <Skeleton variant="text" className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-11 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-800">Failed to load inventory</p>
          <p className="mt-1 text-sm text-red-700">{error?.message ?? "Please try again."}</p>
          <button type="button" onClick={() => void refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && gear.length === 0 && (
        <EmptyState
          tone="gear"
          title="No gear listed yet"
          description="Add your first item to start earning from rentals."
          actionLabel="Add New Gear"
          actionHref="/dashboard/provider/gear/new"
        />
      )}

      {/* Mobile cards */}
      {!isLoading && !isError && gear.length > 0 && (
        <>
          <div className="space-y-3 lg:hidden">
            {gear.map((item) => {
              const imageSrc = item.images[0];
              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageSrc} alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-400 to-sky-400 text-xs font-black text-white">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.brand ?? "—"}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge tone="blue" size="sm">৳{item.price.toLocaleString("en-BD")}/day</Badge>
                        <Badge tone="slate" size="sm">Stock: {item.stock}</Badge>
                        {item.isAvailable
                          ? <Badge tone="emerald" size="sm">Available</Badge>
                          : <Badge tone="suspended" size="sm">Unlisted</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
                    <AvailabilityToggle gear={item} />
                    <div className="flex gap-2 ml-auto">
                      <LinkButton href={`/dashboard/provider/gear/${item.id}/edit`} variant="outline" size="sm">
                        Edit
                      </LinkButton>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(item)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gear</TableHead>
                  <TableHead>Price / day</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gear.map((item) => {
                  const imageSrc = item.images[0];
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {imageSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imageSrc} alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-400 to-sky-400 text-xs font-black text-white">
                                {item.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 max-w-48">{item.name}</p>
                            {item.brand && <p className="text-xs text-slate-400">{item.brand}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        ৳{item.price.toLocaleString("en-BD")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={item.stock <= 0 ? "red" : item.stock <= 3 ? "orange" : "emerald"}
                          size="sm"
                        >
                          {item.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AvailabilityToggle gear={item} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <LinkButton href={`/gear/${item.id}`} variant="ghost" size="sm">
                            View
                          </LinkButton>
                          <LinkButton href={`/dashboard/provider/gear/${item.id}/edit`} variant="outline" size="sm">
                            Edit
                          </LinkButton>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(item)}>
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <DeleteDialog
        gear={deleteTarget}
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
