import { Skeleton } from "@/components/ui/Skeleton";

export default function GlobalLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <svg
          className="h-10 w-10 animate-spin text-emerald-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div className="space-y-2">
          <Skeleton variant="text" className="h-5 w-40 rounded-full mx-auto" />
          <Skeleton variant="text" className="h-4 w-56 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
