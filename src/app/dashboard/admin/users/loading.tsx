import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-8 w-40 rounded-full" />
          <Skeleton variant="text" className="h-4 w-56 rounded-full" />
        </div>
        <Skeleton variant="text" className="h-4 w-24 rounded-full" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton variant="text" className="h-4 w-36 rounded-full" />
                <Skeleton variant="text" className="h-3 w-44 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-5 gap-4 bg-slate-50 px-4 py-3 border-b border-slate-200">
          {["User", "Role", "Status", "Joined", "Actions"].map((h) => (
            <Skeleton key={h} variant="text" className="h-3 w-2/3 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 items-center border-b border-slate-100 px-4 py-3.5 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton variant="text" className="h-4 w-28 rounded-full" />
                <Skeleton variant="text" className="h-3 w-36 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton variant="text" className="h-4 w-24 rounded-full" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
