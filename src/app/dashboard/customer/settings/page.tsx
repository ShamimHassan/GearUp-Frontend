"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProfile, useChangePassword } from "@/hooks/useAuth";
import { useUser, useSetUserAction } from "@/store/authStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  profileSchema,
  changePasswordSchema,
  passwordStrength,
  type ProfileSchemaInput,
  type ChangePasswordSchemaInput,
} from "@/lib/validation";
import { UserRole } from "@/types";

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

// ─── Password strength bar ────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => passwordStrength(password), [password]);
  if (!password) return null;
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((seg) => (
          <div
            key={seg}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              seg < strength.score ? strength.color : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        Strength: <span className="font-semibold text-slate-700">{strength.label}</span>
      </p>
    </div>
  );
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

function AvatarInitials({ name, role }: { name: string; role: UserRole }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradients: Record<UserRole, string> = {
    [UserRole.CUSTOMER]: "from-emerald-400 to-teal-400",
    [UserRole.PROVIDER]: "from-indigo-400 to-sky-400",
    [UserRole.ADMIN]:    "from-red-400 to-rose-400",
  };

  const roleLabels: Record<UserRole, string> = {
    [UserRole.CUSTOMER]: "Customer",
    [UserRole.PROVIDER]: "Provider",
    [UserRole.ADMIN]:    "Admin",
  };

  const roleTones: Record<UserRole, "emerald" | "purple" | "red"> = {
    [UserRole.CUSTOMER]: "emerald",
    [UserRole.PROVIDER]: "purple",
    [UserRole.ADMIN]:    "red",
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br text-xl font-extrabold text-white shadow-sm",
          gradients[role],
        )}
        aria-hidden="true"
      >
        {initials}
      </div>
      <div>
        <p className="font-bold text-slate-900">{name}</p>
        <Badge tone={roleTones[role]} size="sm" className="mt-1">
          {roleLabels[role]}
        </Badge>
      </div>
    </div>
  );
}

// ─── Profile info form ────────────────────────────────────────────────────────

function ProfileForm() {
  const user = useUser();
  const setUser = useSetUserAction();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileSchemaInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:    user?.name    ?? "",
      email:   user?.email   ?? "",
      phone:   user?.phone   ?? "",
      address: user?.address ?? "",
    },
  });

  // Sync if user changes (e.g. after another tab saves)
  useEffect(() => {
    if (user) {
      reset({
        name:    user.name,
        email:   user.email,
        phone:   user.phone   ?? "",
        address: user.address ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileSchemaInput) => {
    const payload: ProfileSchemaInput = {};
    if (data.name    !== user?.name)    payload.name    = data.name?.trim();
    if (data.email   !== user?.email)   payload.email   = data.email?.trim().toLowerCase();
    if (data.phone   !== (user?.phone   ?? "")) payload.phone   = data.phone?.trim() || undefined;
    if (data.address !== (user?.address ?? "")) payload.address = data.address?.trim() || undefined;

    const updated = await updateProfile.mutateAsync(payload);
    setUser(updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Avatar */}
      {user && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <AvatarInitials name={user.name} role={user.role} />
          <p className="mt-3 text-xs text-slate-400">
            Profile photo upload coming soon. Your initials are shown as your avatar.
          </p>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="profile-name" className="block text-sm font-semibold text-slate-700">
          Full name <span className="text-red-500">*</span>
        </label>
        <Input
          id="profile-name"
          autoComplete="name"
          placeholder="Your full name"
          invalid={!!errors.name}
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="profile-email" className="block text-sm font-semibold text-slate-700">
          Email address
        </label>
        <Input
          id="profile-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label htmlFor="profile-phone" className="block text-sm font-semibold text-slate-700">
          Phone{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <Input
          id="profile-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+88 01774-500810"
          invalid={!!errors.phone}
          {...register("phone")}
        />
        <FieldError message={errors.phone?.message as string | undefined} />
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label htmlFor="profile-address" className="block text-sm font-semibold text-slate-700">
          Address{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <Textarea
          id="profile-address"
          rows={3}
          autoComplete="street-address"
          placeholder="Your delivery / pickup address"
          invalid={!!errors.address}
          {...register("address")}
        />
        <FieldError message={errors.address?.message as string | undefined} />
      </div>

      {/* API error */}
      {updateProfile.isError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">Update failed: </span>
          {updateProfile.error?.message ?? "Please try again."}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting || updateProfile.isPending}
          disabled={!isDirty || isSubmitting || updateProfile.isPending}
        >
          Save changes
        </Button>
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() =>
              reset({
                name:    user?.name    ?? "",
                email:   user?.email   ?? "",
                phone:   user?.phone   ?? "",
                address: user?.address ?? "",
              })
            }
            disabled={isSubmitting}
          >
            Discard
          </Button>
        )}
      </div>
    </form>
  );
}

// ─── Change password form ─────────────────────────────────────────────────────

function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchemaInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordSchemaInput) => {
    await changePassword.mutateAsync(data);
    reset();
  };

  const EyeToggle = ({
    show,
    onToggle,
    label,
  }: { show: boolean; onToggle: () => void; label: string }) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? `Hide ${label}` : `Show ${label}`}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-r-lg"
    >
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          className="h-4 w-4" aria-hidden="true">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          className="h-4 w-4" aria-hidden="true">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Current password */}
      <div className="space-y-1.5">
        <label htmlFor="old-password" className="block text-sm font-semibold text-slate-700">
          Current password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="old-password"
            type={showOld ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your current password"
            invalid={!!errors.oldPassword}
            {...register("oldPassword")}
          />
          <EyeToggle show={showOld} onToggle={() => setShowOld((v) => !v)} label="current password" />
        </div>
        <FieldError message={errors.oldPassword?.message} />
      </div>

      {/* New password */}
      <div className="space-y-1.5">
        <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700">
          New password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters with letters & numbers"
            invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          <EyeToggle show={showNew} onToggle={() => setShowNew((v) => !v)} label="new password" />
        </div>
        <PasswordStrengthBar password={newPassword} />
        <FieldError message={errors.newPassword?.message} />
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700">
          Confirm new password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </div>
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      {/* API error */}
      {changePassword.isError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">Failed to change password: </span>
          {changePassword.error?.message ?? "Please try again."}
        </div>
      )}

      {/* Requirements hint */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-600">Password requirements:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Minimum 6 characters</li>
          <li>At least one letter</li>
          <li>At least one number</li>
          <li>Must differ from your current password</li>
        </ul>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isSubmitting || changePassword.isPending}
        disabled={isSubmitting || changePassword.isPending}
      >
        Update password
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerSettingsPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              className="mr-2 h-4 w-4" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="password">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              className="mr-2 h-4 w-4" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Change Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-bold text-slate-900">Personal information</h2>
            <ProfileForm />
          </div>
        </TabsContent>

        <TabsContent value="password">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-bold text-slate-900">Change your password</h2>
            <ChangePasswordForm />
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
