import { cn } from "@/lib/utils";

export type PyramidTone =
  | "primary"
  | "accent"
  | "neutral"
  | "pyr-fys"
  | "pyr-tek"
  | "pyr-slag"
  | "pyr-spill"
  | "pyr-turn";

export type PyramidRow = {
  label: string;
  fillPercent: number;
  value: string;
  tone?: PyramidTone;
};

type PyramidProgressProps = {
  rows: PyramidRow[];
  className?: string;
};

const toneClass: Record<PyramidTone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  neutral: "bg-muted-foreground",
  "pyr-fys": "bg-[var(--pyr-fys)]",
  "pyr-tek": "bg-[var(--pyr-tek)]",
  "pyr-slag": "bg-[var(--pyr-slag)]",
  "pyr-spill": "bg-[var(--pyr-spill)]",
  "pyr-turn": "bg-[var(--pyr-turn)]",
};

export function PyramidProgress({ rows, className }: PyramidProgressProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2 text-[10px]">
          <span className="w-11 shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {row.label}
          </span>
          <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className={cn("h-full rounded-full", toneClass[row.tone ?? "primary"])}
              style={{ width: `${Math.max(0, Math.min(100, row.fillPercent))}%` }}
            />
          </span>
          <span className="w-12 shrink-0 text-right font-mono text-[11px] font-semibold text-foreground">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
