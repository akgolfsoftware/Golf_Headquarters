"use client";

import { cn } from "@/lib/utils";

export type FilterPill = {
  key: string;
  label: string;
  count?: number;
  /** Tailwind bg-klasse for type-dot, f.eks. "bg-accent". Utelat for ingen dot. */
  dotClass?: string;
};

type FilterPillBarProps = {
  pills: FilterPill[];
  active: string;
  onSelect: (key: string) => void;
  className?: string;
};

/**
 * Horisontal pill-gruppe med type-dot og count-badge. Aktiv pill er fylt.
 * Gjenbrukes i innboks, multi-compare og tabell-toolbars.
 */
export function FilterPillBar({ pills, active, onSelect, className }: FilterPillBarProps) {
  return (
    <div role="tablist" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {pills.map((p) => {
        const on = p.key === active;
        return (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(p.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            {p.dotClass && <span className={cn("h-1.5 w-1.5 rounded-full", p.dotClass)} />}
            {p.label}
            {p.count != null && (
              <span
                className={cn(
                  "tabular-nums",
                  on ? "text-accent/80" : "text-foreground",
                )}
              >
                {p.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
