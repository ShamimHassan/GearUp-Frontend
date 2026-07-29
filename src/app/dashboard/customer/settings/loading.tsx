import { Skeleton } from "@/components/ui/Skeleton";

export default function CustomerSettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton variant="text" className="h-8 w-44 rounded-full" />
        <Skeleton variant="text" className="h-4 w-72 rounded-full" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit shadow-sm">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <Skeleton variant="text" className="h-5 w-40 rounded-full" />

        {/* Avatar section */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-5 w-32 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* Fields */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton variant="text" className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}

        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
