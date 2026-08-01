"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  loginSchema,
  type LoginSchemaInput,
} from "@/lib/validation";
import { UserRole } from "@/types";
import { useLogin } from "@/hooks/useAuth";
import { useLoginAction, useIsAuthenticated, useUser } from "@/store/authStore";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { showError } from "@/components/ui/Toast";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

function roleDashboard(role: UserRole): string {
  if (role === UserRole.ADMIN) return "/dashboard/admin";
  if (role === UserRole.PROVIDER) return "/dashboard/provider";
  return "/dashboard/customer";
}

function extractUnauthedBanner(search: string | null): string | null {
  const raw = search;
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const trimmed = decoded.trim();
    if (!trimmed || trimmed === "/" || trimmed === "/auth/login") return null;
    return `Sign in required to access this page.`;
  } catch {
    return null;
  }
}
     
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const fromParam = searchParams.get("from");

  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const storeLogin = useLoginAction();
  const loginMutation = useLogin();

  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const unauthedBanner = extractUnauthedBanner(fromParam);

  // If already authenticated (e.g. navigated back to login), redirect to correct dashboard
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    router.replace(roleDashboard(user.role));
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: LoginSchemaInput) => {
    try {
      const payload = await loginMutation.mutateAsync({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      // 1. Set cookie server-side so middleware can read it on the next request
      await fetch("/api/auth/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: payload.token }),
      });

      // 2. Update Zustand store (also writes localStorage + client cookie as fallback)
      storeLogin(payload.token, payload.user);

      const target = redirectParam && /^\/[A-Za-z0-9_/?=&%-]*$/.test(redirectParam)
        ? redirectParam
        : roleDashboard(payload.user.role);

      router.replace(target);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      const lower = message.toLowerCase();

      if (lower.includes("credential") || lower.includes("password") || lower.includes("email") || lower.includes("incorrect") || lower.includes("invalid")) {
        setError("email", { type: "server" });
        setError("password", {
          type: "server",
          message: "Invalid email or password. Please try again.",
        });
      } else if (lower.includes("suspended") || lower.includes("deactivated") || lower.includes("disabled") || lower.includes("inactive")) {
        setError("email", {
          type: "server",
          message: "Account suspended. Contact support@gearup.com for assistance.",
        });
        showError("Account suspended", message);
      } else if (lower.includes("verify") || lower.includes("confirmed")) {
        setError("email", {
          type: "server",
          message: message,
        });
      } else {
        showError("Login failed", message);
      }
    }
  };

  const isPending = loginMutation.isPending || isSubmitting;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to continue to your dashboard. Don't have an account?{" "}
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

      {unauthedBanner && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-800">
            Email address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-800">
              Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <LinkButton
              href="/forgot-password"
              variant="link"
              size="sm"
              className="!p-0 text-xs"
            >
              Forgot password?
            </LinkButton>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-0 flex h-full items-center px-3 text-slate-400 hover:text-slate-600 focus-visible:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-r-lg"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className={cn(
                "h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/40 focus:ring-2"
              )}
              {...register("remember")}
            />
            <span className="text-sm text-slate-700">Remember me</span>
          </label>

          <div className="text-xs text-slate-500" aria-hidden="true" />
        </div>

        {loginMutation.isError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <span className="font-semibold">Sign in failed:</span>{" "}
            {loginMutation.error?.message || "Please check your credentials and try again."}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          isLoading={isPending}
          disabled={isDirty ? !isValid : false}
        >
          Sign in
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6 0-1.1-.1-1.6H12Z"/>
            </svg>
            <span className="hidden sm:inline">Google</span>
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
              <path d="M17.05 12.05c0-2.7 2.2-3.95 2.3-4.02-1.25-1.85-3.2-2.1-3.9-2.13-1.65-.18-3.2.97-4.05.97-.85 0-2.13-.95-3.5-.92-1.8.03-3.46 1.04-4.4 2.65-1.87 3.25-.48 8.05 1.34 10.7.88 1.3 1.93 2.76 3.3 2.7 1.33-.06 1.84-.87 3.45-.87 1.6 0 2.06.87 3.47.84 1.44-.03 2.34-1.31 3.2-2.62.99-1.5 1.4-2.96 1.42-3.03-.03-.02-2.72-1.05-2.74-4.21Zm-2.55-6.92c.75-.9 1.25-2.15 1.11-3.4-1.08.04-2.38.72-3.15 1.61-.68.77-1.3 1.98-1.13 3.19 1.2.1 2.4-.57 3.17-1.4Z"/>
            </svg>
            <span className="hidden sm:inline">Apple</span>
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
              <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.11.83-.26.83-.58 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.62-4.04-1.62-.55-1.4-1.33-1.77-1.33-1.77-1.08-.75.08-.73.08-.73 1.2.09 1.82 1.24 1.82 1.24 1.07 1.82 2.8 1.29 3.49.99.11-.77.41-1.3.75-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.23-3.24-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.24 0 4.63-2.8 5.66-5.48 5.95.43.37.81 1.1.81 2.22 0 1.6-.02 2.88-.02 3.28 0 .32.22.7.84.58A12 12 0 0 0 12 .3Z"/>
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </button>
        </div>
       

        <p className="text-center text-xs text-slate-500 leading-relaxed">
          By signing in, you agree to GearUp's{" "}
          <LinkButton href="/terms" variant="link" size="sm" className="!p-0">Terms</LinkButton>{" "}
          and{" "}
          <LinkButton href="/privacy" variant="link" size="sm" className="!p-0">Privacy Policy</LinkButton>.
        </p>
      </form>
    </div>
  );
}

export { LoginForm };
