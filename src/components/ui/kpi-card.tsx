import { Eyebrow } from "@/components/athletic/golfdata";
import { cn } from "@/lib/utils";

type KPICardProps = {
  eyebrow: string;
  value: React.ReactNode;
  delta?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  footnote?: string;
  icon?: React.ReactNode;
  variant?: "default" | "hero" | "muted" | "warn" | "danger";
  className?: string;
};

/**
 * Standardisert KPI-card med eyebrow + verdi + delta + footnote.
 *
 * Bruk:
 * <KPICard eyebrow="Aktive økter i dag" value="0" variant="hero" />
 * <KPICard eyebrow="Brennende oppgaver" value="3" variant="warn" delta={{ value: "+2", direction: "up" }} />
 */
export function KPICard({
  eyebrow,
  value,
  delta,
  footnote,
  icon,
  variant = "default",
  className,
}: KPICardProps) {
  const variantClasses = {
    default: "bg-card border-border text-foreground",
    hero: "bg-primary border-primary text-primary-foreground",
    muted: "bg-muted border-border text-foreground",
    warn: "bg-warning/10 border-warning/30 text-foreground",
    danger: "bg-destructive/10 border-destructive/30 text-foreground",
  } as const;

  const deltaColor =
    delta?.direction === "up"
      ? "text-success"
      : delta?.direction === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 md:p-6 transition-shadow",
        variantClasses[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <Eyebrow as="span"
            className={cn(
              variant === "hero" && "text-primary-foreground/80",
            )}
          >
            {eyebrow}
          </Eyebrow>
        </div>
        {icon && (
          <div
            className={cn(
              "shrink-0",
              variant === "hero" ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 font-mono text-3xl font-bold tabular-nums">
        {value}
      </div>
      {(delta || footnote) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {delta && (
            <span className={cn("font-mono font-semibold", deltaColor)}>
              {delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→"} {delta.value}
            </span>
          )}
          {footnote && (
            <span
              className={cn(
                "font-mono uppercase tracking-[0.06em]",
                variant === "hero"
                  ? "text-primary-foreground/60"
                  : "text-muted-foreground",
              )}
            >
              {footnote}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
