import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
        "shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
        invalid
          ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/30 text-red-900"
          : "",
        className,
      )}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
        "shadow-sm transition-colors resize-y",
        "focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
        invalid
          ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/30 text-red-900"
          : "",
        className,
      )}
      {...props}
    />
  );
});

export { Input, Textarea };
export default Input;
