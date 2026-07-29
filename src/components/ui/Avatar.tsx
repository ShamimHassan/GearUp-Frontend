"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-20 w-20 text-2xl",
};

interface AvatarContextValue {
  size: AvatarSize;
  imageLoaded: boolean;
  setImageLoaded: (v: boolean) => void;
  name: string;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

function useAvatarContext(component: string) {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error(`${component} must be used inside <Avatar>`);
  return ctx;
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  name?: string;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, size = "md", name = "", children, ...props },
  ref,
) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ctx: AvatarContextValue = { size, imageLoaded, setImageLoaded, name };
  return (
    <AvatarContext.Provider value={ctx}>
      <span
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full bg-slate-200 font-semibold text-white ring-2 ring-white select-none items-center justify-center uppercase",
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
});

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(function AvatarImage(
  { className, alt, onLoad, src, ...props },
  ref,
) {
  const { setImageLoaded, imageLoaded } = useAvatarContext("AvatarImage");
  if (!src) return null;
  return (
    <img
      ref={ref}
      src={src}
      alt={alt ?? "avatar"}
      onLoad={(e) => {
        setImageLoaded(true);
        onLoad?.(e);
      }}
      className={cn(
        "aspect-square h-full w-full object-cover transition-opacity",
        imageLoaded ? "opacity-100" : "opacity-0",
        className,
      )}
      {...props}
    />
  );
});

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  delayMs?: number;
}

export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ className, children, delayMs, ...props }, ref) {
    const { imageLoaded, name } = useAvatarContext("AvatarFallback");

    const initials = useMemo(() => {
      const trimmed = name.trim();
      if (!trimmed) return "";
      const parts = trimmed.split(/\s+/);
      const first = parts[0]?.[0] ?? "";
      const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
      return (first + last).toUpperCase();
    }, [name]);

    const bgGradient = useMemo(() => {
      const colors = [
        "bg-emerald-500",
        "bg-sky-500",
        "bg-violet-500",
        "bg-amber-500",
        "bg-rose-500",
        "bg-indigo-500",
        "bg-teal-500",
      ];
      const seed = initials.length
        ? initials.charCodeAt(0) % colors.length
        : 0;
      return colors[seed];
    }, [initials]);

    if (imageLoaded) return null;
    return (
      <span
        ref={ref}
        className={cn(
          "absolute inset-0 flex h-full w-full items-center justify-center text-white font-semibold",
          bgGradient,
          className,
        )}
        {...props}
      >
        {children ?? initials}
      </span>
    );
  },
);

export { Avatar as default };
