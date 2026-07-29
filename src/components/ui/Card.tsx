import { createContext, forwardRef, useContext, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardContextValue {
  flush?: boolean;
}

const CardContext = createContext<CardContextValue>({ flush: false });

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  flush?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, flush = false, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        flush ? "" : "",
        className,
      )}
      {...props}
    >
      <CardContext.Provider value={{ flush }}>{children}</CardContext.Provider>
    </div>
  );
});

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, children, ...props }, ref) {
    const { flush } = useContext(CardContext);
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1.5", flush ? "p-4" : "p-6 pb-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold leading-tight tracking-tight text-slate-900", className)}
        {...props}
      />
    );
  },
);

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-slate-500", className)}
        {...props}
      />
    );
  },
);

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    const { flush } = useContext(CardContext);
    return (
      <div
        ref={ref}
        className={cn(flush ? "px-4 pb-4" : "px-6 pb-6", className)}
        {...props}
      />
    );
  },
);

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    const { flush } = useContext(CardContext);
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center border-t border-slate-100",
          flush ? "p-4 pt-3" : "p-6 pt-4",
          className,
        )}
        {...props}
      />
    );
  },
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;

export function _cardTypeNarrow(_: ReactNode) {
  void _;
}
