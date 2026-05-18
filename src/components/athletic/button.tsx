import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type AthleticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "lime" | "primary" | "ghost-dark" | "ghost-light";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<NonNullable<AthleticButtonProps["variant"]>, string> = {
  lime: "bg-accent text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] hover:brightness-105",
  primary: "bg-primary text-accent hover:bg-primary/90",
  "ghost-dark": "bg-white/10 text-white hover:bg-white/15 border border-white/15",
  "ghost-light": "bg-white border border-border text-foreground hover:bg-muted",
};

const sizeClasses: Record<NonNullable<AthleticButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const AthleticButton = forwardRef<HTMLButtonElement, AthleticButtonProps>(
  function AthleticButton(
    { variant = "lime", size = "md", className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "font-display inline-flex items-center justify-center gap-1.5 rounded-full font-bold tracking-[-0.005em] transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
