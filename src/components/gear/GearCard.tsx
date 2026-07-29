import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GearItemWithRelations } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";

export interface GearCardProps {
  gear: GearItemWithRelations;
  className?: string;
  /** When true, uses the Card's flush/embedded context style */
  compact?: boolean;
}

export default function GearCard({ gear, className, compact = false }: GearCardProps) {
  const imageSrc = gear.images?.[0] ?? "";
  const altText = `${gear.name}${gear.brand ? ` — ${gear.brand}` : ""}`;
  const stockInfo =
    gear.stock <= 0
      ? { label: "Out of stock", tone: "red" as const }
      : gear.stock <= 3
        ? { label: `Only ${gear.stock} left`, tone: "orange" as const }
        : { label: "In stock", tone: "emerald" as const };

  const fallbackImageColors = [
    "from-emerald-400 via-teal-300 to-cyan-400",
    "from-indigo-400 via-blue-300 to-sky-400",
    "from-amber-400 via-orange-300 to-rose-400",
    "from-violet-400 via-purple-300 to-fuchsia-400",
    "from-lime-400 via-green-300 to-emerald-400",
  ];
  const pick = fallbackImageColors[
    Math.abs(gear.id.charCodeAt(gear.id.length - 1) || 0) % fallbackImageColors.length
  ];

  return (
    <Link
      href={`/gear/${gear.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        compact ? "p-0" : "p-0",
        className
      )}
      aria-label={altText}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={altText}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const sibling = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLDivElement | null;
              if (sibling) sibling.style.display = "flex";
            }}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : null}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br text-white",
            pick,
            imageSrc ? "hidden" : "flex"
          )}
          aria-hidden="true"
        >
          <div className="text-center">
            <div className="text-5xl font-black tracking-tight drop-shadow-sm">
              {gear.name.slice(0, 2).toUpperCase()}
            </div>
            {gear.brand && (
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-80">
                {gear.brand}
              </div>
            )}
          </div>
        </div>

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {gear.category && (
            <Badge tone="blue" size="sm">
              {gear.category.name}
            </Badge>
          )}
          {!gear.isAvailable && (
            <Badge tone="suspended" size="sm">
              Unavailable
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <Badge tone={stockInfo.tone} size="sm">
            {stockInfo.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-snug text-slate-900 group-hover:text-emerald-700 transition-colors">
              {gear.name}
            </h3>
            {gear.brand && (
              <p className="mt-0.5 truncate text-xs font-medium uppercase tracking-wide text-slate-400">
                {gear.brand}
              </p>
            )}
          </div>
        </div>

        {gear.description && (
          <p className="line-clamp-2 text-sm text-slate-500">
            {gear.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div>
            <p className="text-xs font-medium text-slate-500">from</p>
            <p className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900">
                ৳{gear.price.toLocaleString("en-BD")}
              </span>
              <span className="text-xs font-medium text-slate-500">/ day</span>
            </p>
          </div>
          <LinkButton
            href={`/gear/${gear.id}`}
            variant="primary"
            size="sm"
          >
            View Details
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </LinkButton>
        </div>
      </div>
    </Link>
  );
}

export { GearCard };
