import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type AthleticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "lime" | "primary" | "secondary" | "ghost-light" | "ghost-dark";
  size?: "sm" | "md" | "lg";
};

type Variant = NonNullable<AthleticButtonProps["variant"]>;
type Size = NonNullable<AthleticButtonProps["size"]>;

const variantClasses: Record<Variant, string> = {
  lime: "bg-accent text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] hover:brightness-105",
  primary: "bg-primary text-accent hover:bg-primary/90",
  secondary: "bg-transparent border border-primary text-primary hover:bg-primary/5",
  "ghost-light": "bg-transparent text-foreground hover:bg-muted",
  "ghost-dark": "bg-white/10 text-white hover:bg-white/15 border border-white/15",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-[52px] px-6 text-[15px]",
};

function radiusFor(variant: Variant): string {
  return variant === "lime" ? "rounded-full" : "rounded-md";
}

export const AthleticButton = forwardRef<HTMLButtonElement, AthleticButtonProps>(
  function AthleticButton(
    { variant = "lime", size = "md", className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "font-display inline-flex items-center justify-center gap-1.5 font-bold tracking-[-0.005em] transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          radiusFor(variant),
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
