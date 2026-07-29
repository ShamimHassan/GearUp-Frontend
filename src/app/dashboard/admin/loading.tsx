import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-8 w-64 rounded-full" />
          <Skeleton variant="text" className="h-4 w-48 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-3 w-24 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton variant="text" className="h-9 w-16 rounded-full" />
            <Skeleton variant="text" className="h-3 w-28 rounded-full" />
          </div>
        ))}
      </div>

      {/* Revenue banner */}
      <Skeleton className="h-24 w-full rounded-2xl" />

      {/* Recent rentals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-5 w-32 rounded-full" />
          <Skeleton variant="text" className="h-4 w-16 rounded-full" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 space-y-1.5">
                <Skeleton variant="text" className="h-4 w-1/3 rounded-full" />
                <Skeleton variant="text" className="h-3 w-1/4 rounded-full" />
              </div>
              <Skeleton variant="text" className="h-4 w-20 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-5 w-28 rounded-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton variant="text" className="h-4 w-28 rounded-full" />
              <Skeleton variant="text" className="h-3 w-36 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
