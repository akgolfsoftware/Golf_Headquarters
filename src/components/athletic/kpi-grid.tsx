import { cn } from "@/lib/utils";

// ── KpiCell ───────────────────────────────────────────────────────────────────

export type KpiCellProps = {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaPositive?: boolean;
  className?: string;
};

export function KpiCell({
  label,
  value,
  unit,
  delta,
  deltaPositive,
  className,
}: KpiCellProps) {
  return (
    <div className={cn("p-4", className)}>
      {/* Label */}
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>

      {/* Value row */}
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold tabular-nums leading-none text-foreground">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>

      {/* Delta */}
      {delta !== undefined && (
        <div
          className={cn(
            "mt-1 font-mono text-[10px] font-medium tabular-nums",
            deltaPositive === true
              ? "text-success"
              : deltaPositive === false
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          {deltaPositive === true && "▲ "}
          {deltaPositive === false && "▼ "}
          {delta}
        </div>
      )}
    </div>
  );
}

// ── KpiGrid ───────────────────────────────────────────────────────────────────

export type KpiGridProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

const colClass: Record<NonNullable<KpiGridProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

export function KpiGrid({ children, columns = 4, className }: KpiGridProps) {
  return (
    <div
      className={cn(
        "grid divide-x divide-y divide-border",
        colClass[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
