import { Skeleton } from "@/components/ui/Skeleton";

export default function ProviderOrdersLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton variant="text" className="h-8 w-40 rounded-full" />
        <Skeleton variant="text" className="h-4 w-64 rounded-full" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-lg" />
        ))}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-1/2 rounded-full" />
                <Skeleton variant="text" className="h-3 w-2/3 rounded-full" />
                <Skeleton variant="text" className="h-3 w-1/2 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <Skeleton variant="text" className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="border-t border-slate-100 pt-3">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-6 gap-4 bg-slate-50 px-4 py-3 border-b border-slate-200">
          {["Customer", "Gear", "Dates", "Amount", "Status", "Actions"].map((h) => (
            <Skeleton key={h} variant="text" className="h-3 w-2/3 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 items-center border-b border-slate-100 px-4 py-3 last:border-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton variant="text" className="h-4 w-20 rounded-full" />
                <Skeleton variant="text" className="h-3 w-24 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <Skeleton variant="text" className="h-4 w-24 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton variant="text" className="h-4 w-4/5 rounded-full" />
              <Skeleton variant="text" className="h-3 w-1/2 rounded-full" />
            </div>
            <Skeleton variant="text" className="h-4 w-3/4 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
