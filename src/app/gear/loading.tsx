import { CardSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function GearLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header skeleton */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton variant="text" className="h-8 w-48 rounded-lg" />
          <Skeleton variant="text" className="mt-2 h-4 w-72 rounded-full" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden w-56 shrink-0 lg:block xl:w-64">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
              <Skeleton variant="text" className="h-5 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton variant="text" className="h-3 w-14 rounded-full" />
                <Skeleton variant="rectangular" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" className="h-3 w-16 rounded-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="text" className="h-8 rounded-lg" />
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" className="h-3 w-20 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton variant="rectangular" className="h-10 flex-1 rounded-lg" />
                  <Skeleton variant="rectangular" className="h-10 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
