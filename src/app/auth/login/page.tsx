import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Login to GearUp",
  description:
    "Sign in to GearUp to manage your rentals, bookings, and listed gear.",
  robots: { index: true, follow: true },
};

const BENEFITS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
        <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M3 7h10v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      </svg>
    ),
    title: "Unlimited bookings",
    description: "Reserve gear in 2 clicks, 365 days a year.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    title: "Real-time availability",
    description: "Always know what's ready for your next trip.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M3 11l18-8-8 18-2-8-8-2Z" />
      </svg>
    ),
    title: "Earn as a Provider",
    description: "List gear in minutes and start earning today.",
  },
];

const STATS = [
  { label: "Active listings", value: "5,400+" },
  { label: "Cities covered", value: "48" },
  { label: "Average savings", value: "82%" },
];

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-slate-800 to-slate-900 px-10 py-14 text-white">
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0px, transparent 45%), radial-gradient(circle at 80% 80%, rgba(165,180,252,0.55) 0px, transparent 40%)",
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
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" aria-hidden="true" />
              Secure, insured & tracked rentals 24/7
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white xl:text-5xl leading-[1.1]">
              Welcome back, adventurer.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-200/90">
              Sign in to continue renting gear, manage your bookings, track
              shipments, or check the status of your listed inventory.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-y border-white/15 py-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm font-medium text-indigo-100/80">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-10 space-y-4">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-indigo-100 ring-1 ring-white/15 backdrop-blur-sm">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {b.title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-200/80">
                      {b.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-sm text-slate-300/80">
            New to GearUp?{" "}
            <LinkButton
              href="/auth/register"
              variant="link"
              size="sm"
              className="!p-0 !text-white hover:!text-indigo-200"
            >
              Create a free account
            </LinkButton>
          </p>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <Suspense
            fallback={
              <div className="w-full max-w-md space-y-5">
                <div className="h-8 w-2/3 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-5 w-1/2 rounded-md bg-slate-200 animate-pulse" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-1/4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-11 w-full rounded-lg bg-slate-200 animate-pulse" />
                  </div>
                ))}
                <div className="h-12 w-full rounded-xl bg-indigo-200 animate-pulse" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
