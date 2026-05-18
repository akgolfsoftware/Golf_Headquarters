import { cn } from "@/lib/utils";

export type PyramidRow = {
  label: string;
  fillPercent: number;
  value: string;
  tone?: "primary" | "accent" | "neutral";
};

type PyramidProgressProps = {
  rows: PyramidRow[];
  className?: string;
};

const toneClass: Record<NonNullable<PyramidRow["tone"]>, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  neutral: "bg-muted-foreground",
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
