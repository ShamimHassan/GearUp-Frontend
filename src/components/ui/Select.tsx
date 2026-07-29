"use client";

import * as React from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type HTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import type { Option as OptionType } from "@/types";

interface SelectContextValue<Value extends string | number = string> {
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  value?: Value;
  generatedId: string;
  registerOption: (option: OptionType<Value>) => void;
  getOptions: () => OptionType<Value>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectContext = createContext<SelectContextValue<any> | null>(null);

function useSelectContext<Value extends string | number = string>() {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error("Select components must be used within a <Select> wrapper.");
  }
  return ctx as SelectContextValue<Value>;
}

export interface SelectProps<Value extends string | number = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value" | "defaultValue" | "children"> {
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  invalid?: boolean;
  placeholder?: string;
  children: ReactNode;
}

function SelectInner<Value extends string | number = string>(
  props: SelectProps<Value>,
  ref: React.ForwardedRef<HTMLSelectElement>,
) {
  const {
    className,
    children,
    invalid,
    placeholder,
    value,
    defaultValue,
    onValueChange,
    disabled,
    name,
    id,
    ...rest
  } = props;

  const generatedId = useId();
  const finalId = id ?? `select-${generatedId}`;
  const optionsRef = useRef<OptionType<Value>[]>([]);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const registerOption = useCallback((option: OptionType<Value>) => {
    const cur = optionsRef.current;
    if (!cur.some((o) => o.value === option.value)) {
      optionsRef.current = [...cur, option];
      forceRender();
    }
  }, []);
  const getOptions = useCallback(() => optionsRef.current, []);

  const ctxValue = useMemo<SelectContextValue<Value>>(
    () => ({
      name,
      disabled,
      invalid,
      placeholder,
      value,
      generatedId: finalId,
      registerOption,
      getOptions,
    }),
    [name, disabled, invalid, placeholder, value, finalId, registerOption, getOptions],
  );

  const controlledValue = value !== undefined ? String(value) : undefined;
  const controlledDefault = defaultValue !== undefined ? String(defaultValue) : undefined;

  return (
    <SelectContext.Provider value={ctxValue}>
      <div className="relative w-full">
        <select
          ref={ref as React.ForwardedRef<HTMLSelectElement>}
          id={finalId}
          name={name}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          value={controlledValue}
          defaultValue={controlledDefault as string | undefined}
          onChange={(e) => {
            const v = e.target.value as unknown as Value;
            onValueChange?.(v);
          }}
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white pr-10 pl-3 py-2 text-sm text-slate-900 shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            invalid
              ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/30 text-red-900"
              : "",
            className,
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </SelectContext.Provider>
  );
}

const Select = forwardRef(SelectInner) as <Value extends string | number = string>(
  p: SelectProps<Value> & { ref?: React.ForwardedRef<HTMLSelectElement> },
) => React.ReactElement;

export interface SelectTriggerProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const SelectTrigger = forwardRef<HTMLDivElement, SelectTriggerProps>(function SelectTrigger(
  _props,
  _ref,
) {
  return null;
});

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

function SelectValue(_props: SelectValueProps) {
  return null;
}

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

function SelectContent(_props: SelectContentProps) {
  return null;
}

export interface SelectItemProps<Value extends string | number = string>
  extends Omit<OptionHTMLAttributes<HTMLOptionElement>, "value" | "label"> {
  value: Value;
  label?: string;
  children?: ReactNode;
}

function SelectItemInner<Value extends string | number = string>(
  props: SelectItemProps<Value>,
  ref: React.ForwardedRef<HTMLOptionElement>,
) {
  const ctx = useSelectContext<Value>();
  const { value, label, children, className, disabled, ...rest } = props;
  const resolvedLabel =
    label ?? (typeof children === "string" ? children : String(value));

  React.useEffect(() => {
    ctx.registerOption({
      value,
      label: resolvedLabel as string,
      disabled: disabled ?? false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, resolvedLabel, disabled]);

  return (
    <option
      ref={ref}
      value={value as unknown as string | number}
      disabled={disabled}
      className={cn("", className)}
      {...rest}
    >
      {label ?? children}
    </option>
  );
}

const SelectItem = forwardRef(SelectItemInner) as <Value extends string | number = string>(
  p: SelectItemProps<Value> & { ref?: React.ForwardedRef<HTMLOptionElement> },
) => React.ReactElement;

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
export default Select;

void useState;
