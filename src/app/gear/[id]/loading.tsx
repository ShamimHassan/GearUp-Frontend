import { Skeleton } from "@/components/ui/Skeleton";

export default function GearDetailsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton variant="text" className="h-3 w-12 rounded-full" />
          <Skeleton variant="text" className="h-3 w-3 rounded-full" />
          <Skeleton variant="text" className="h-3 w-20 rounded-full" />
          <Skeleton variant="text" className="h-3 w-3 rounded-full" />
          <Skeleton variant="text" className="h-3 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left – image gallery */}
          <div className="space-y-3">
            <Skeleton className="aspect-4/3 w-full rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right – details */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton variant="text" className="h-4 w-24 rounded-full" />
              <Skeleton variant="text" className="h-8 w-3/4 rounded-lg" />
              <Skeleton variant="text" className="h-4 w-1/3 rounded-full" />
            </div>
            <Skeleton variant="text" className="h-10 w-32 rounded-lg" />
            <Skeleton variant="paragraph" lines={4} />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <Skeleton variant="text" className="h-5 w-32 rounded-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Reviews skeleton */}
        <div className="mt-14 space-y-4">
          <Skeleton variant="text" className="h-6 w-40 rounded-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton variant="text" className="h-4 w-28 rounded-full" />
                  <Skeleton variant="text" className="h-3 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton variant="paragraph" lines={2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
