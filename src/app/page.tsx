import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import FeaturedGearSection from "@/components/home/FeaturedGearSection";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryChips from "@/components/home/CategoryChips";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";

export const metadata: Metadata = {
  title: "GearUp — Rent Sports & Outdoor Gear Instantly",
  description:
    "Browse and rent premium bikes, camping, hiking, skiing, surf and fitness gear from 2,200+ verified local providers. Save up to 82% vs. buying. Insured & secured.",
  keywords: [
    "gear rental",
    "outdoor gear",
    "rent bike",
    "camping gear rental",
    "sports equipment",
    "gear marketplace",
    "hiking gear",
    "ski rental",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "GearUp — Rent Sports & Outdoor Gear Instantly",
    description:
      "5,400+ premium listings. Insured bookings. 24/7 support. Skip the costs, own the adventure.",
    type: "website",
    locale: "en_US",
    siteName: "GearUp",
  },
  twitter: {
    card: "summary_large_image",
    title: "GearUp — Rent Sports & Outdoor Gear Instantly",
    description:
      "5,400+ premium listings. Insured bookings. 24/7 support. Save up to 82% vs. buying.",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FeaturedGearSection />
      <HowItWorks />
      <CategoryChips />
      <Testimonials />
      <CTABanner />
    </>
  );
}
