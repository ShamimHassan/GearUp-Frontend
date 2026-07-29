import { Skeleton } from "@/components/ui/Skeleton";

export default function PayPageLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-6 py-2">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <Skeleton variant="text" className="h-3 w-14 rounded-full" />
        <Skeleton variant="text" className="h-3 w-3 rounded-full" />
        <Skeleton variant="text" className="h-3 w-16 rounded-full" />
        <Skeleton variant="text" className="h-3 w-3 rounded-full" />
        <Skeleton variant="text" className="h-3 w-16 rounded-full" />
      </div>

      <Skeleton variant="text" className="h-8 w-48 rounded-full" />

      {/* Order summary card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Skeleton variant="text" className="h-3 w-28 rounded-full" />
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-5 w-3/4 rounded-full" />
            <Skeleton variant="text" className="h-3 w-1/2 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="space-y-2.5 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between border-b border-slate-100 py-2.5 last:border-0">
              <Skeleton variant="text" className="h-4 w-24 rounded-full" />
              <Skeleton variant="text" className="h-4 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Payment method section */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-3 w-36 rounded-full" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 p-4 flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" className="h-4 w-28 rounded-full" />
              <Skeleton variant="text" className="h-3 w-4/5 rounded-full" />
            </div>
            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  );
}
