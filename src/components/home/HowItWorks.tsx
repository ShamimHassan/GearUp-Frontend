import type { ReactNode } from "react";

interface Step {
  index: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
}

const STEPS: Step[] = [
  {
    index: "01",
    title: "Browse",
    description:
      "Search 5,400+ listings, filter by category, price and dates. Check real-time stock and verified reviews.",
    accent: "from-emerald-500 to-teal-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    index: "02",
    title: "Book",
    description:
      "Pick your dates, select any add-ons, and pay securely. Providers confirm within 30 minutes.",
    accent: "from-indigo-500 to-sky-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    index: "03",
    title: "Pick Up",
    description:
      "Collect directly from the provider or have it delivered to your home, hotel or trailhead.",
    accent: "from-amber-500 to-orange-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M10 17h4V5H2v12h3" />
        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  {
    index: "04",
    title: "Return",
    description:
      "Return in the same condition to get your security deposit back. Leave a review, earn badges!",
    accent: "from-rose-500 to-pink-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
        <path d="m8 14 3-3-3-3" />
        <path d="M16 7v6a3 3 0 0 1-3 3H9" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-white py-20 sm:py-24" aria-labelledby="how-it-works-heading">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">How GearUp works</p>
          <h2 id="how-it-works-heading" className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            4 simple steps to your next adventure
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            From casual weekend hikers to seasoned mountaineers, thousands of
            adventurers use GearUp every week to get equipped.
          </p>
        </div>

        <ol className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="relative z-10 flex flex-col items-start">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} text-white shadow-lg shadow-slate-900/5`}>
                  {step.icon}
                </div>
                <div className={`mt-6 text-6xl font-black leading-none tracking-tight bg-gradient-to-br ${step.accent} bg-clip-text text-transparent opacity-90`} aria-hidden="true">
                  {step.index}
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>
              {i < STEPS.length - 1 ? (
                <svg
                  className="absolute -right-6 top-10 hidden h-10 w-10 text-slate-300 lg:block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export { HowItWorks };
