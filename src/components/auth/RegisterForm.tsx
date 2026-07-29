"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  passwordStrength,
  registerSchema,
  type RegisterSchemaInput,
} from "@/lib/validation";
import { UserRole } from "@/types";
import { useRegister } from "@/hooks/useAuth";
import { useAuthActions, useIsAuthenticated } from "@/store/authStore";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { showError, showSuccess } from "@/components/ui/Toast";

const ROLE_OPTIONS: Array<{
  value: UserRole.CUSTOMER | UserRole.PROVIDER;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: UserRole.CUSTOMER,
    label: "Customer",
    description: "Browse and rent outdoor gear from providers.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    value: UserRole.PROVIDER,
    label: "Provider",
    description: "List your gear and earn from rentals.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M3 9h18l-1.5 9a2 2 0 0 1-2 1.7h-11A2 2 0 0 1 4.5 18L3 9Z" />
        <path d="M3 9 4 4h16l1 5" />
        <path d="M10 13v3" />
        <path d="M14 13v3" />
      </svg>
    ),
  },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-1.5 text-xs font-medium text-red-600"
    >
      {message}
    </p>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => passwordStrength(password), [password]);
  const segments = [0, 1, 2, 3];

  if (!password) return null;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {segments.map((seg) => (
          <div
            key={seg}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              seg < strength.score ? strength.color : "bg-slate-200"
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs font-medium text-slate-600">
        Password strength:{" "}
        <span className="text-slate-800">{strength.label}</span>
      </p>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? undefined;

  const isAuthenticated = useIsAuthenticated();
  const { login: storeLogin } = useAuthActions();
  const registerMutation = useRegister();

  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<RegisterSchemaInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: UserRole.CUSTOMER,
      phone: "",
      address: "",
    },
  });

  const role = watch("role");
  const password = watch("password");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/gear");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterSchemaInput) => {
    try {
      const payload = await registerMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        phone: data.phone?.trim() || undefined,
        address: data.address?.trim() || undefined,
      });

      storeLogin(payload.token, payload.user);
      showSuccess("Account created successfully", "Welcome to GearUp!");

      const dashboard =
        payload.user.role === UserRole.ADMIN
          ? "/dashboard/admin"
          : payload.user.role === UserRole.PROVIDER
            ? "/dashboard/provider"
            : "/dashboard/customer";

      router.replace(redirect ?? dashboard);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      const lower = message.toLowerCase();

      if (lower.includes("email") && lower.includes("exists")) {
        setError("email", { type: "server", message: "This email is already registered. Try logging in instead." });
      } else {
        showError("Registration failed", message);
      }
    }
  };

  const isPending = registerMutation.isPending || isSubmitting;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Join GearUp to rent gear or list your own. Already have an account?{" "}
          <LinkButton
            href="/auth/login"
            variant="link"
            size="md"
            className="!p-0"
          >
            Sign in
          </LinkButton>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2.5">
          <label className="block text-sm font-medium text-slate-800">
            Account type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((option) => {
              const selected = role === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                    "focus-within:ring-2 focus-within:ring-emerald-500/40",
                    selected
                      ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-200 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={option.value}
                    {...register("role")}
                  />
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      selected
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                    aria-hidden="true"
                  >
                    {option.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {option.label}
                      </p>
                      {selected && <Badge tone="emerald" size="sm">Selected</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      {option.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      selected ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"
                    )}
                    aria-hidden="true"
                  >
                    {selected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="white"
                        className="h-2.5 w-2.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          <FieldError message={errors.role?.message} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-slate-800">
            Full name
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="John Doe"
            invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
            Email address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-800">
              Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 chars with letters & numbers"
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
            <PasswordStrength password={password} />
            <FieldError message={errors.password?.message} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-800">
              Confirm password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              id="confirmPassword"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="block text-sm font-medium text-slate-800">
            Phone{" "}
            <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+88 01774-500810"
            invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message as string | undefined} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address" className="block text-sm font-medium text-slate-800">
            Address{" "}
            <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <Textarea
            id="address"
            rows={3}
            autoComplete="street-address"
            placeholder="123 Adventure Ave, Outdoor City"
            invalid={!!errors.address}
            {...register("address")}
          />
          <FieldError message={errors.address?.message as string | undefined} />
        </div>

        {registerMutation.isError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <span className="font-semibold">Could not create account:</span>{" "}
            {registerMutation.error?.message || "Please try again."}
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
          Create account
        </Button>

        <p className="text-center text-xs text-slate-500 leading-relaxed">
          By creating an account, you agree to GearUp's{" "}
          <LinkButton href="/terms" variant="link" size="sm" className="!p-0">Terms of Service</LinkButton>{" "}
          and{" "}
          <LinkButton href="/privacy" variant="link" size="sm" className="!p-0">Privacy Policy</LinkButton>.
        </p>
      </form>
    </div>
  );
}

export { RegisterForm };
