import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Primær knapp-primitiv for AK Golf HQ.
 *
 * Variants (5):
 * - `lime`         — signatur-CTA. Lime fyld, forest tekst, pill-radius, lime-glow.
 *                    Brukes sparsomt — kun for hero-acquisition og oppgrader-handlinger.
 * - `primary`      — standard CTA på lyse flater. Forest fyld, lime tekst.
 * - `secondary`    — alternativ ved siden av primary. Transparent + forest border + forest tekst.
 * - `ghost-light`  — de-emfaserte handlinger ("Avbryt", "Tilbake") på lyse flater.
 * - `ghost-dark`   — ghost på dark hero/featured. Hvit/10 bg, hvit tekst, hvit/15 border.
 *
 * Sizes (3): sm (36px / 13px), md (44px / 14px) — default, lg (52px / 15px).
 * Pill-radius gjelder kun lime-varianten; resten har md-radius (12px).
 *
 * Eksempel:
 *   <Button>Logg økt</Button>
 *   <Button variant="lime" size="lg">Start gratis prøving</Button>
 *   <Button variant="secondary" size="sm">Filter</Button>
 */

export type ButtonVariant =
  | "lime"
  | "primary"
  | "secondary"
  | "ghost-light"
  | "ghost-dark";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  lime: "bg-accent text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] hover:brightness-105",
  primary: "bg-primary text-accent hover:bg-primary/90",
  secondary:
    "bg-transparent border border-primary text-primary hover:bg-primary/5",
  "ghost-light": "bg-transparent text-foreground hover:bg-muted",
  "ghost-dark":
    "bg-white/10 text-white hover:bg-white/15 border border-white/15",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-[52px] px-6 text-[15px]",
};

function radiusFor(variant: ButtonVariant): string {
  return variant === "lime" ? "rounded-full" : "rounded-md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, ...rest },
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
});

/**
 * Hjelpemiddel for andre komponenter som vil reprodusere knapp-stilen
 * uten å rendre et `<button>` (f.eks. `<Link>` styled som knapp).
 *
 * @example
 *   <Link href="/booking" className={buttonClasses({ variant: "lime", size: "lg" })}>
 *     Bestill time
 *   </Link>
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "font-display inline-flex items-center justify-center gap-1.5 font-bold tracking-[-0.005em] transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    radiusFor(variant),
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}
