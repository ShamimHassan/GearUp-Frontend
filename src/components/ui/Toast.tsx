"use client";

import * as React from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import type { ToasterProps as SonnerToasterProps } from "sonner";
import { cn } from "@/lib/utils";

interface ToasterClassNames {
  toast?: string;
  title?: string;
  description?: string;
  actionButton?: string;
  cancelButton?: string;
  closeButton?: string;
  [key: string]: string | undefined;
}

export interface ToasterProps extends Omit<SonnerToasterProps, "theme"> {
  classNames?: ToasterClassNames;
}

export function Toaster({ className, classNames, ...props }: ToasterProps) {
  const mergedClassNames = {
    toast:
      "group toast shadow-lg ring-1 ring-slate-200 rounded-xl border-slate-200",
    title: "text-sm font-semibold text-slate-900",
    description: "text-xs text-slate-600",
    actionButton:
      "!bg-emerald-600 !text-white hover:!bg-emerald-700 rounded-md px-3 py-1.5 text-xs font-medium",
    cancelButton:
      "!bg-slate-100 !text-slate-700 hover:!bg-slate-200 rounded-md px-3 py-1.5 text-xs font-medium",
    closeButton:
      "!bg-transparent !text-slate-400 hover:!bg-slate-100 hover:!text-slate-600 rounded-md",
    ...classNames,
  };

  const SonnerToasterAny = SonnerToaster as unknown as React.ComponentType<
    SonnerToasterProps & { classNames?: ToasterClassNames }
  >;

  return (
    <SonnerToasterAny
      position="top-right"
      richColors
      closeButton
      theme="light"
      visibleToasts={5}
      gap={12}
      className={cn("font-sans", className)}
      classNames={mergedClassNames}
      {...props}
    />
  );
}

export const toast = sonnerToast;

export function showSuccess(message: string, description?: string) {
  return toast.success(message, description ? { description } : undefined);
}

export function showError(message: string, description?: string) {
  return toast.error(message, description ? { description } : undefined);
}

export function showInfo(message: string, description?: string) {
  return toast.info(message, description ? { description } : undefined);
}

export function showWarning(message: string, description?: string) {
  return toast.warning(message, description ? { description } : undefined);
}

export { Toaster as default };
