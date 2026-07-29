import { Skeleton } from "@/components/ui/Skeleton";

export default function ProviderDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton variant="text" className="h-7 w-56 rounded-full" />
        <Skeleton variant="text" className="h-4 w-64 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <Skeleton variant="text" className="h-5 w-32 rounded-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-slate-100 pt-4">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" className="h-4 w-1/2 rounded-full" />
              <Skeleton variant="text" className="h-3 w-1/3 rounded-full" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
