import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Login to GearUp",
  description:
    "Sign in to GearUp to manage your rentals, bookings, and listed gear.",
  robots: { index: true, follow: true },
};

export default function LoginPagePlaceholder() {
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
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
              GearUp 🏋️
            </Link>
          </div>
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-extrabold tracking-tight xl:text-5xl leading-[1.1]">
              Welcome back, adventurer.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-200/90">
              Sign in to continue renting gear, manage your bookings, or check
              the status of your listed inventory.
            </p>
          </div>
          <p className="relative z-10 text-sm text-slate-300/80">
            New here?{" "}
            <LinkButton
              href="/auth/register"
              variant="link"
              size="sm"
              className="!p-0 !text-white hover:!text-indigo-200"
            >
              Create an account
            </LinkButton>
          </p>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md mx-auto">
            <Suspense
              fallback={
                <div className="space-y-5">
                  <div className="h-8 w-2/3 rounded-lg bg-slate-200 animate-pulse" />
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
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Sign in to continue. Don't have an account?{" "}
                    <LinkButton
                      href="/auth/register"
                      variant="link"
                      size="md"
                      className="!p-0"
                    >
                      Sign up
                    </LinkButton>
                  </p>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="block text-sm font-medium text-slate-800">
                      Email address
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="login-password" className="block text-sm font-medium text-slate-800">
                      Password
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      disabled
                    />
                  </div>

                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
                    🔧 <span className="font-semibold text-slate-700">Login form</span> is under construction — 
                    full form with <span className="text-slate-700 font-medium">react-hook-form</span>,{" "}
                    <span className="text-slate-700 font-medium">Zod</span> validation, remember-me, 
                    forgot-password, and OAuth coming up in Step 13.
                  </p>
                </form>
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
