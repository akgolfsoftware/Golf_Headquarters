/**
 * CreditMeter — segment-basert credit-saldo (port av components-credit-indicator.html).
 *
 * Én segment per credit (maks 12 — over det vises kun numerisk).
 * Farge-logikk: ≥ 50 % igjen = forest (default) · < 50 % = warning · 0 = destructive.
 * Siste aktive segment kan rendres i lime (--accent) for å forsterke "én igjen".
 * Tall i JetBrains Mono med tnum. Verdier kommer fra DB — aldri hardkodet.
 */

import { cn } from "@/lib/utils";

const MAX_SEGMENTS = 12;

type Size = "sm" | "md";

function tone(remaining: number, total: number): "ok" | "warn" | "danger" {
  if (total <= 0 || remaining <= 0) return "danger";
  const ratio = remaining / total;
  if (ratio >= 0.5) return "ok";
  return "warn";
}

const SEG_ON: Record<"ok" | "warn" | "danger", string> = {
  ok: "bg-primary",
  warn: "bg-warning",
  danger: "bg-destructive",
};

export function CreditMeter({
  remaining,
  total,
  size = "md",
  showLabel = true,
  className,
}: {
  remaining: number;
  total: number;
  size?: Size;
  showLabel?: boolean;
  className?: string;
}) {
  const t = tone(remaining, total);
  // Over 12 credits gir for mange segmenter — vis da kun numerisk brøk.
  const renderBar = total > 0 && total <= MAX_SEGMENTS;
  const segH = size === "sm" ? "h-1 w-3" : "h-1.5 w-[18px]";
  const labelSize = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono tabular-nums",
        className,
      )}
    >
      {showLabel && (
        <span className={cn("font-bold tracking-[-0.005em] text-foreground", labelSize)}>
          {remaining}
          <span className="font-semibold text-muted-foreground">
            {" "}
            / {total} credits
          </span>
        </span>
      )}
      {renderBar && (
        <span className="inline-flex shrink-0 gap-[3px]">
          {Array.from({ length: total }).map((_, i) => {
            const on = i < remaining;
            const isLast = on && i === remaining - 1;
            return (
              <span
                key={i}
                className={cn(
                  "rounded-full",
                  segH,
                  on
                    ? isLast && t === "ok"
                      ? "bg-accent"
                      : SEG_ON[t]
                    : "bg-foreground/[0.08]",
                )}
                aria-hidden
              />
            );
          })}
        </span>
      )}
    </span>
  );
}
