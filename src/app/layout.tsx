import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import { Navbar, Footer, NetworkStatus } from "@/components/layout";
import { Toaster } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GearUp — Rent Outdoor Gear",
  description: "GearUp — the outdoor gear rental marketplace for adventurers.",
  keywords: ["gear rental", "outdoor gear", "sports equipment", "rent bikes", "camping gear"],
  authors: [{ name: "GearUp" }],
  openGraph: {
    title: "GearUp — Rent Outdoor Gear Instantly",
    description: "Rent premium sports and outdoor gear from trusted providers. Wide selection, best prices, secure payment.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GearUp — Rent Outdoor Gear Instantly",
    description: "Rent premium sports and outdoor gear from trusted providers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <Toaster />
              <NetworkStatus />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
