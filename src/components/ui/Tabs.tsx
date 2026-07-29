"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${component} must be used inside <Tabs>`);
  return ctx;
}

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string>(defaultValue ?? "");
  const value = isControlled ? (controlledValue as string) : uncontrolled;
  const baseId = useId();

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const ctxValue = useMemo<TabsContextValue>(
    () => ({ value, setValue, baseId }),
    [value, setValue, baseId],
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <div className={cn("w-full", className)} data-tabs="">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, role = "tablist", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role={role}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-slate-100 p-1 text-slate-600",
        className,
      )}
      {...props}
    />
  );
});

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ className, value, children, type = "button", onClick, ...props }, ref) {
    const { value: current, setValue, baseId } = useTabsContext("TabsTrigger");
    const selected = current === value;
    return (
      <button
        ref={ref}
        type={type}
        role="tab"
        id={`${baseId}-tab-${value}`}
        aria-selected={selected}
        aria-controls={`${baseId}-panel-${value}`}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setValue(value);
        }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          selected
            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
            : "text-slate-600 hover:text-slate-800",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, value, children, ...props }, ref) {
    const { value: current, baseId } = useTabsContext("TabsContent");
    if (current !== value) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-tab-${value}`}
        tabIndex={0}
        className={cn("mt-4 focus-visible:outline-none", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export default Tabs;
