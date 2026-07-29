import { Skeleton } from "@/components/ui/Skeleton";

export default function ProviderGearLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-8 w-36 rounded-full" />
          <Skeleton variant="text" className="h-4 w-56 rounded-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Mobile card skeletons */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-5 w-2/3 rounded-full" />
                <Skeleton variant="text" className="h-3 w-1/2 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <Skeleton className="h-6 w-12 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-6 gap-4 bg-slate-50 px-4 py-3 border-b border-slate-200">
          {["Image", "Name", "Category", "Price", "Stock", "Actions"].map((h) => (
            <Skeleton key={h} variant="text" className="h-3 w-2/3 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 items-center border-b border-slate-100 px-4 py-3 last:border-0">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton variant="text" className="h-4 w-3/4 rounded-full" />
              <Skeleton variant="text" className="h-3 w-1/2 rounded-full" />
            </div>
            <Skeleton variant="text" className="h-4 w-4/5 rounded-full" />
            <Skeleton variant="text" className="h-4 w-3/5 rounded-full" />
            <Skeleton variant="text" className="h-4 w-2/5 rounded-full" />
            <div className="flex gap-2 justify-end">
              <Skeleton className="h-8 w-14 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
