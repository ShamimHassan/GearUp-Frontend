"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  avatarTone: "emerald" | "indigo" | "amber" | "rose" | "violet";
}

const TONE: Record<Testimonial["avatarTone"], string> = {
  emerald: "from-emerald-400 to-teal-400",
  indigo: "from-indigo-400 to-sky-400",
  amber: "from-amber-400 to-orange-400",
  rose: "from-rose-400 to-pink-400",
  violet: "from-violet-400 to-fuchsia-400",
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Rented a full camping kit for 4 people at 20% the cost of buying. Everything was clean, packed perfectly, and the provider even added free marshmallows!",
    name: "Nazmul H.",
    role: "Camping enthusiast · Dhaka",
    initials: "NH",
    rating: 5,
    avatarTone: "emerald",
  },
  {
    quote:
      "As a provider I've made ৳82,000 in 4 months renting my MTB and surfboard. The insurance and verified renters give me total peace of mind.",
    name: "Sadia K.",
    role: "Gear provider · Cox's Bazar",
    initials: "SK",
    rating: 5,
    avatarTone: "indigo",
  },
  {
    quote:
      "Support helped me swap a faulty bike within 2 hours on my Sylhet trek. This isn't a marketplace — it's a community that actually cares.",
    name: "Tariq I.",
    role: "Hiker · Sylhet",
    initials: "TI",
    rating: 5,
    avatarTone: "amber",
  },
];

function Stars({ rating }: { rating: Testimonial["rating"] }) {
  const full = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.008Z" clipRule="evenodd" />
    </svg>
  ) as ReactNode;
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-20"}>
          {full}
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-20 sm:py-24 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(16,185,129,0.55) 0px, transparent 45%), radial-gradient(circle at 90% 90%, rgba(99,102,241,0.55) 0px, transparent 40%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="emerald" size="sm" className="!ring-white/15 !bg-white/10 !text-emerald-100">
            Loved by 50,000+ adventurers
          </Badge>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Real stories from real adventurers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            See why our average rating stays at a perfect 4.9★ for 3 years running.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="!bg-white/5 !border-white/10 backdrop-blur-sm transition-all hover:!bg-white/[0.07] hover:-translate-y-0.5">
              <CardContent className="flex flex-col gap-5 p-6">
                <Stars rating={t.rating} />
                <blockquote className="text-sm leading-relaxed text-slate-200 [text-wrap:pretty]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-auto flex items-center gap-3 pt-2 border-t border-white/10">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${TONE[t.avatarTone]} text-sm font-bold text-white ring-2 ring-white/15`} aria-hidden="true">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Testimonials };
