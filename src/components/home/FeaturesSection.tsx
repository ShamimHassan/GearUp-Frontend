"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";

interface FeatureCard {
  icon: ReactNode;
  title: string;
  description: string;
  tone: "emerald" | "indigo" | "amber" | "rose";
}

const TONE_RING: Record<FeatureCard["tone"], string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

const FEATURES: FeatureCard[] = [
  {
    tone: "emerald",
    title: "Wide Selection",
    description:
      "5,400+ gear items across 12 categories — bikes, camping, skiing, water sports and more.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    tone: "indigo",
    title: "Best Prices",
    description:
      "Compare listings and book from 2,200+ providers at up to 82% cheaper than buying new.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    tone: "amber",
    title: "Secure Payment",
    description:
      "bKash, Nagad, Rocket, SSLCommerz and Stripe — every booking is insured up to ৳50,000.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    tone: "rose",
    title: "24/7 Support",
    description:
      "Chat with our adventure experts day or night to solve any issue within an hour.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Why GearUp</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need, nothing you don't.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            We handle discovery, payments, insurance and verification so you
            can focus on the adventure, not the logistics.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="group transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <CardContent className="p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${TONE_RING[feature.tone]}`}>
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export { FeaturesSection };
