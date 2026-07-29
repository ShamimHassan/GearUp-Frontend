"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  onOpenAutoFocus?: (e: Event) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error(`${component} must be used within <Dialog>`);
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  modal?: boolean;
}

export function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  modal = true,
}: DialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const open = isControlled ? (controlledOpen as boolean) : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const titleId = useId();
  const descriptionId = useId();

  const value: DialogContextValue = {
    open,
    setOpen,
    titleId,
    descriptionId,
  };

  return (
    <DialogContext.Provider value={value}>
      <DialogContentInner modal={modal}>{children}</DialogContentInner>
    </DialogContext.Provider>
  );
}

interface DialogContentInnerProps {
  children: ReactNode;
  modal: boolean;
}

function DialogContentInner({ children, modal }: DialogContentInnerProps) {
  const { open, setOpen, titleId, descriptionId } = useDialogContext("DialogContentInner");
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && modal) {
      if (!el.open) el.showModal();
    } else if (open) {
      if (!el.open) el.show();
    } else if (el.open) {
      el.close();
    }
  }, [open, modal]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => setOpen(false);
    el.addEventListener("close", handler);
    el.addEventListener("cancel", handler);
    return () => {
      el.removeEventListener("close", handler);
      el.removeEventListener("cancel", handler);
    };
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <>
      <div
        ref={overlayRef}
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm",
          "animate-[fadeIn_.15s_ease-out]",
        )}
      />
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "fixed inset-0 z-50 m-auto w-[92vw] max-w-lg p-0 rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop:bg-transparent",
          "open:animate-[scaleIn_.18s_ease-out]",
        )}
      >
        <form method="dialog" className="p-0">{children}</form>
      </dialog>
    </>
  );
}

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ className, children, onClick, type = "button", ...props }, ref) {
    const { setOpen } = useDialogContext("DialogTrigger");
    return (
      <button
        ref={ref}
        type={type}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setOpen(true);
        }}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, ...props }, ref) {
    useDialogContext("DialogContent");
    return (
      <div ref={ref} className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    );
  },
);

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-100", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ className, children, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 border-t border-slate-100 p-6 pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    const { titleId } = useDialogContext("DialogTitle");
    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn("text-lg font-semibold leading-6 text-slate-900", className)}
        {...props}
      />
    );
  },
);

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...props }, ref) {
    const { descriptionId } = useDialogContext("DialogDescription");
    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cn("text-sm text-slate-500", className)}
        {...props}
      />
    );
  },
);

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ className, children, onClick, ...props }, ref) {
    const { setOpen } = useDialogContext("DialogClose");
    return (
      <button
        ref={ref}
        type="button"
        value={props.value ?? "close"}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setOpen(false);
        }}
        className={cn(
          "rounded-md text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          className,
        )}
        {...props}
      >
        {children ?? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-label="Close"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        )}
      </button>
    );
  },
);

export {
  Dialog as default,
};

export const Modal = Dialog;
export const ModalTrigger = DialogTrigger;
export const ModalContent = DialogContent;
export const ModalHeader = DialogHeader;
export const ModalFooter = DialogFooter;
export const ModalTitle = DialogTitle;
export const ModalDescription = DialogDescription;
export const ModalClose = DialogClose;

export type ModalProps = DialogProps;
export type ModalTriggerProps = DialogTriggerProps;
export type ModalContentProps = DialogContentProps;
export type ModalHeaderProps = DialogHeaderProps;
export type ModalFooterProps = DialogFooterProps;
export type ModalTitleProps = DialogTitleProps;
export type ModalDescriptionProps = DialogDescriptionProps;
export type ModalCloseProps = DialogCloseProps;
