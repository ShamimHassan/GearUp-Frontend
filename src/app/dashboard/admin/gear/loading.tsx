import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminGearLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-8 w-36 rounded-full" />
          <Skeleton variant="text" className="h-4 w-56 rounded-full" />
        </div>
        <Skeleton variant="text" className="h-4 w-24 rounded-full" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
