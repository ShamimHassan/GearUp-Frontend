import { Skeleton } from "@/components/ui/Skeleton";

export default function NewGearPageLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <Skeleton variant="text" className="h-3 w-16 rounded-full" />
        <Skeleton variant="text" className="h-3 w-3 rounded-full" />
        <Skeleton variant="text" className="h-3 w-16 rounded-full" />
        <Skeleton variant="text" className="h-3 w-3 rounded-full" />
        <Skeleton variant="text" className="h-3 w-24 rounded-full" />
      </div>

      <div className="space-y-1.5">
        <Skeleton variant="text" className="h-8 w-36 rounded-full" />
        <Skeleton variant="text" className="h-4 w-72 rounded-full" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-4 w-24 rounded-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        {/* Description */}
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-4 w-28 rounded-full" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        {/* Brand + Category */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton variant="text" className="h-4 w-20 rounded-full" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        {/* Price + Stock */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton variant="text" className="h-4 w-28 rounded-full" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        {/* Images */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="h-4 w-24 rounded-full" />
            <Skeleton variant="text" className="h-4 w-20 rounded-full" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        {/* Actions */}
        <div className="flex gap-3 border-t border-slate-100 pt-5">
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
