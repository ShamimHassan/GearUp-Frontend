"use client";

import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(function Table(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative w-full overflow-auto rounded-xl border border-slate-200 bg-white">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className, ...props }, ref) {
    return (
      <thead
        ref={ref}
        className={cn("bg-slate-50/60 [&_tr]:border-b border-slate-200", className)}
        {...props}
      />
    );
  },
);

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, ...props }, ref) {
    return (
      <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
      />
    );
  },
);

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableFooter({ className, ...props }, ref) {
    return (
      <tfoot
        ref={ref}
        className={cn(
          "border-t border-slate-200 bg-slate-50/60 font-medium text-slate-900",
          className,
        )}
        {...props}
      />
    );
  },
);

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          "border-b border-slate-100 transition-colors hover:bg-slate-50/60 data-[state=selected]:bg-emerald-50/40",
          className,
        )}
        {...props}
      />
    );
  },
);

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  function TableHead({ className, ...props }, ref) {
    return (
      <th
        ref={ref}
        className={cn(
          "h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-slate-500",
          className,
        )}
        {...props}
      />
    );
  },
);

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className, ...props }, ref) {
    return (
      <td
        ref={ref}
        className={cn("px-4 py-3 align-middle text-slate-700", className)}
        {...props}
      />
    );
  },
);

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  function TableCaption({ className, ...props }, ref) {
    return (
      <caption
        ref={ref}
        className={cn("mt-4 text-sm text-slate-500", className)}
        {...props}
      />
    );
  },
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
export default Table;
