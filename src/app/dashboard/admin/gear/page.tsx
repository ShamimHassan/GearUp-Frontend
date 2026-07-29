"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAllGearAdmin } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { GearItemWithRelations } from "@/types";

export default function AdminGearPage() {
  const [search, setSearch] = useState("");
  const { data: gear = [], isLoading, isError, error, refetch } = useAllGearAdmin();

  const filtered = useMemo(() => {
    if (!search.trim()) return gear;
    const q = search.toLowerCase();
    return gear.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      (g.provider?.name ?? "").toLowerCase().includes(q) ||
      (g.category?.name ?? "").toLowerCase().includes(q),
    );
  }, [gear, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">All Gear Listings</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? "Loading…" : `${gear.length} total listings across all providers`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <Input type="search" placeholder="Search name, provider, category…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5"><Skeleton variant="text" className="h-4 w-40 rounded-full" /><Skeleton variant="text" className="h-3 w-24 rounded-full" /></div>
              <Skeleton variant="text" className="h-4 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="font-semibold text-red-800">Failed to load gear</p>
          <p className="mt-1 text-sm text-red-700">{error?.message}</p>
          <button type="button" onClick={() => void refetch()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Try again</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState tone="gear" title="No gear found" description="Try adjusting your search." size="sm" />
      )}

      {/* Table */}
      {!isLoading && !isError && filtered.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gear</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price / day</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Listed</TableHead>
              <TableHead className="text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const img = item.images?.[0];
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt={item.name} className="h-full w-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-400 to-sky-400 text-xs font-black text-white">
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p className="truncate text-sm font-semibold text-slate-800 max-w-36">{item.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.provider?.name ?? "—"}</TableCell>
                  <TableCell>{item.category ? <Badge tone="blue" size="sm">{item.category.name}</Badge> : "—"}</TableCell>
                  <TableCell className="font-semibold text-slate-900">৳{item.price.toLocaleString("en-BD")}</TableCell>
                  <TableCell>
                    <Badge tone={item.stock <= 0 ? "red" : item.stock <= 3 ? "orange" : "emerald"} size="sm">{item.stock}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.isAvailable
                      ? <Badge tone="emerald" size="sm">Yes</Badge>
                      : <Badge tone="suspended" size="sm">No</Badge>}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/gear/${item.id}`} className="text-xs font-semibold text-red-700 hover:text-red-800 transition-colors">
                      View →
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
