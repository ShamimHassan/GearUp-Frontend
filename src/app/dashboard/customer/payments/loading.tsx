import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function CustomerPaymentsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton variant="text" className="h-8 w-44 rounded-full" />
        <Skeleton variant="text" className="h-4 w-64 rounded-full" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-3 w-24 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton variant="text" className="h-8 w-20 rounded-full" />
            <Skeleton variant="text" className="h-3 w-28 rounded-full" />
          </div>
        ))}
      </div>

      {/* Table */}
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}
