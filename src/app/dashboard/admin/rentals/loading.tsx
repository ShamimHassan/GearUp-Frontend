import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminRentalsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-8 w-32 rounded-full" />
          <Skeleton variant="text" className="h-4 w-64 rounded-full" />
        </div>
        <Skeleton variant="text" className="h-4 w-24 rounded-full" />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-lg" />
        ))}
      </div>

      <TableSkeleton rows={8} columns={7} />
    </div>
  );
}
