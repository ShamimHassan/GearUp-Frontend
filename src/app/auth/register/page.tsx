import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an Account — GearUp",
  description:
    "Join GearUp to rent premium outdoor gear or list your own gear and earn money. Sign up in less than a minute.",
  robots: { index: true, follow: true },
};

const FEATURES = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
      </svg>
    ),
    title: "Huge gear selection",
    description: "Bikes, tents, camping, skiing, surf — 5,000+ items.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Save up to 80% vs buying",
    description: "Rent by the day, weekend or week.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    title: "Insured every booking",
    description: "Up to ৳50,000 coverage on all rentals.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      </svg>
    ),
    title: "Vetted local providers",
    description: "All gear inspected, providers rated.",
  },
];

const STATS = [
  { label: "Rentals booked", value: "120K+" },
  { label: "Average rating", value: "4.9★" },
  { label: "Providers", value: "2,200+" },
];

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 px-10 py-14 text-white">
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0px, transparent 45%), radial-gradient(circle at 80% 80%, rgba(110,231,183,0.55) 0px, transparent 40%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white/95 hover:text-white"
            >
              GearUp 🏋️
            </Link>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
              Trusted by 50,000+ adventurers since 2022
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white xl:text-5xl leading-[1.1]">
              Gear up for your next adventure in minutes.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-emerald-50/90">
              Create a free account to browse 5,000+ pieces of outdoor equipment,
              book securely and chat directly with verified local providers.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-y border-white/15 py-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm font-medium text-emerald-100/80">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-10 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-100 ring-1 ring-white/15 backdrop-blur-sm">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {f.title}
                    </p>
                    <p className="mt-0.5 text-sm text-emerald-50/80">
                      {f.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-2" aria-hidden="true">
              {[
                "bg-emerald-400",
                "bg-cyan-400",
                "bg-amber-400",
                "bg-rose-400",
              ].map((color, i) => (
                <div
                  key={i}
                  className={`h-9 w-9 rounded-full ring-2 ring-emerald-700/80 ${color}`}
                />
              ))}
            </div>
            <p className="text-sm text-emerald-50/90">
              Join <span className="font-semibold text-white">2,200+ providers</span>{" "}
              earning from their gear this month.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <Suspense
            fallback={
              <div className="w-full max-w-md space-y-5">
                <div className="h-8 w-2/3 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-5 w-1/2 rounded-md bg-slate-200 animate-pulse" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-1/4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-11 w-full rounded-lg bg-slate-200 animate-pulse" />
                  </div>
                ))}
                <div className="h-12 w-full rounded-xl bg-emerald-200 animate-pulse" />
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
