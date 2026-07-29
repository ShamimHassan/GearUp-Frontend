import { Skeleton } from "@/components/ui/Skeleton";

export default function OrderDetailsLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Skeleton variant="text" className="h-3 w-16 rounded-full" />
          <Skeleton variant="text" className="h-3 w-3 rounded-full" />
          <Skeleton variant="text" className="h-3 w-14 rounded-full" />
          <Skeleton variant="text" className="h-3 w-3 rounded-full" />
          <Skeleton variant="text" className="h-3 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="text" className="h-8 w-36 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Status stepper */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <Skeleton variant="text" className="h-3 w-28 rounded-full" />
        <div className="flex items-center gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton variant="text" className="h-2.5 w-14 rounded-full" />
              </div>
              {i < 4 && <Skeleton className="mb-5 h-0.5 w-10 sm:w-14" />}
            </div>
          ))}
        </div>
      </div>

      {/* Action panel */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <Skeleton variant="text" className="h-3 w-20 rounded-full" />
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-5 w-3/4 rounded-full" />
                <Skeleton variant="text" className="h-3 w-1/2 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
