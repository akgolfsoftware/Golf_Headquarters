import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "active"
  | "behind"
  | "inactive"
  | "guide"
  | "alert"
  | "warn";

type StatusPillProps = {
  children: React.ReactNode;
  tone?: StatusTone;
  /** Valgfritt lucide-ikon foran teksten (i stedet for LED-dot). */
  icon?: LucideIcon;
  /** Vis LED-dot foran teksten. Default true når icon ikke er satt. */
  dot?: boolean;
  className?: string;
};

const toneClasses: Record<StatusTone, string> = {
  active: "bg-success/15 text-success",
  behind: "bg-destructive/10 text-destructive",
  inactive: "bg-secondary text-muted-foreground",
  guide: "bg-accent text-primary",
  alert: "bg-destructive/10 text-destructive",
  warn: "bg-warning/15 text-warning-foreground",
};

const dotClasses: Record<StatusTone, string> = {
  active: "bg-success [box-shadow:0_0_5px_currentColor]",
  behind: "bg-destructive",
  inactive: "bg-muted-foreground",
  guide: "bg-primary",
  alert: "bg-destructive [box-shadow:0_0_5px_currentColor]",
  warn: "bg-warning",
};

/**
 * Rund status-pill med LED-dot eller lucide-ikon. Brukes på tvers av agency-
 * flatene (Stallen, Bookinger, Spiller-panel) for primær status-informasjon.
 */
export function StatusPill({
  children,
  tone = "inactive",
  icon: Icon,
  dot,
  className,
}: StatusPillProps) {
  const showDot = dot ?? !Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
        toneClasses[tone],
        className,
      )}
    >
      {Icon ? (
        <Icon className="h-[11px] w-[11px]" strokeWidth={1.5} />
      ) : showDot ? (
        <span className={cn("h-[5px] w-[5px] rounded-full", dotClasses[tone])} />
      ) : null}
      {children}
    </span>
  );
}

type ScopeChipProps = {
  symbol: "@" | ">" | "?" | "/";
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
};

/**
 * Liten scope-pill (brukes i CommandPalette og filter-felt): symbol + label,
 * valgfri fjern-knapp.
 */
export function ScopeChip({ symbol, children, onRemove, className }: ScopeChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground",
        className,
      )}
    >
      <span className="text-primary">{symbol}</span>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Fjern scope"
          className="ml-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-2.5 w-2.5" strokeWidth={2} />
        </button>
      )}
    </span>
  );
}
