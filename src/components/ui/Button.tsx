"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "destructive"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  block?: boolean;
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonBaseProps {
  href?: undefined;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm disabled:bg-emerald-300",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-400 shadow-sm disabled:bg-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-400",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm disabled:bg-red-300",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
  link:
    "bg-transparent text-emerald-700 underline-offset-4 hover:underline p-0 h-auto",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
  icon: "h-10 w-10 rounded-lg p-0",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    isLoading,
    leftIcon,
    rightIcon,
    block,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-70",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        block ? "w-full" : "",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span aria-live="polite">Loading…</span>
        </span>
      ) : (
        <>
          {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
          {children}
          {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
        </>
      )}
    </button>
  );
});

export interface LinkButtonProps extends ButtonBaseProps {
  href: string;
  target?: string;
  rel?: string;
  prefetch?: boolean;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

function LinkButton({
  href,
  variant = "primary",
  size = "md",
  block,
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    block ? "w-full" : "",
    className,
  );
  const content = (
    <>
      {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
    </>
  );
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}

export { Button, LinkButton };
export default Button;
