import { Skeleton } from "@/components/ui/Skeleton";

export default function CustomerDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="space-y-1.5">
        <Skeleton variant="text" className="h-7 w-48 rounded-full" />
        <Skeleton variant="text" className="h-4 w-64 rounded-full" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-3 w-24 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton variant="text" className="h-8 w-16 rounded-full" />
            <Skeleton variant="text" className="h-3 w-20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <Skeleton variant="text" className="h-5 w-32 rounded-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-slate-100 pt-4">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" className="h-4 w-1/2 rounded-full" />
              <Skeleton variant="text" className="h-3 w-1/3 rounded-full" />
            </div>
            <Skeleton variant="text" className="h-6 w-20 rounded-full" />
            <Skeleton variant="text" className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
