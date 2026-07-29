"use client";

import Link from "next/link";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(16,185,129,0.22) 0px, transparent 45%), radial-gradient(circle at 85% 20%, rgba(99,102,241,0.20) 0px, transparent 40%), radial-gradient(circle at 50% 110%, rgba(251,191,36,0.18) 0px, transparent 45%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-50" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:px-8 lg:grid-cols-2 lg:py-28">
        <div className="max-w-xl">
          <Badge tone="emerald" size="sm" className="mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
            New · Summer 2026 gear now live
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.05]">
            Rent Sports &amp; Outdoor Gear{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
            Skip the high costs and clutter. Browse thousands of bikes, tents,
            skis, surfboards and more from trusted local providers — delivered
            to your doorstep or ready for pickup.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <LinkButton href="/gear" variant="primary" size="lg">
              Browse Gear
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </LinkButton>
            <Button variant="outline" size="lg" onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>
              How it works
            </Button>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rentals booked</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-900">120K+</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">5-star reviews</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-900">38K+</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Savings vs buy</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-900">up to 82%</dd>
            </div>
          </dl>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-square w-full max-w-[480px]">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-indigo-600/20" aria-hidden="true" />
            <div className="absolute inset-0 -translate-x-2 -translate-y-2 rounded-3xl bg-emerald-500/20" aria-hidden="true" />
            <div className="relative grid h-full w-full grid-cols-6 grid-rows-6 gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
              {[
                { row: "1 / 4", col: "1 / 4", from: "from-emerald-400", via: "via-teal-300", to: "to-cyan-400", emoji: "🚴", label: "Mountain Bikes" },
                { row: "1 / 3", col: "4 / 7", from: "from-amber-400", via: "via-orange-300", to: "to-rose-400", emoji: "⛺", label: "Camping" },
                { row: "3 / 5", col: "4 / 7", from: "from-indigo-400", via: "via-blue-300", to: "to-sky-400", emoji: "🎿", label: "Snow Gear" },
                { row: "4 / 7", col: "1 / 4", from: "from-violet-400", via: "via-purple-300", to: "to-fuchsia-400", emoji: "🏕️", label: "Hiking Kits" },
                { row: "5 / 7", col: "4 / 7", from: "from-lime-400", via: "via-green-300", to: "to-emerald-400", emoji: "🏄", label: "Water Sports" },
              ].map((tile) => (
                <div
                  key={tile.label}
                  style={{ gridRow: tile.row, gridColumn: tile.col }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${tile.from} ${tile.via} ${tile.to} p-4 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className="text-3xl sm:text-4xl drop-shadow-sm" aria-hidden="true">{tile.emoji}</div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-85">{tile.label}</p>
                    <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium opacity-95">
                      Browse →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { HeroSection };
