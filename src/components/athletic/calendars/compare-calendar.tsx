import { cn } from "@/lib/utils";

export type ComparePeriod = {
  label: string;
  startDate: Date;
  endDate: Date;
  values: { date: Date; value: number }[];
  totalLabel?: string;
};

type CompareCalendarProps = {
  periodA: ComparePeriod;
  periodB: ComparePeriod;
  metricLabel?: string;
  unit?: string;
  className?: string;
};

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function buildCells(period: ComparePeriod): { date: Date; value: number }[] {
  const total = daysBetween(period.startDate, period.endDate);
  const map = new Map<string, number>();
  period.values.forEach((v) => map.set(v.date.toDateString(), v.value));
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(period.startDate);
    d.setDate(period.startDate.getDate() + i);
    return { date: d, value: map.get(d.toDateString()) ?? 0 };
  });
}

export function CompareCalendar({
  periodA,
  periodB,
  metricLabel = "Treningstid",
  unit = "min",
  className,
}: CompareCalendarProps) {
  const cellsA = buildCells(periodA);
  const cellsB = buildCells(periodB);
  const maxVal = Math.max(
    1,
    ...cellsA.map((c) => c.value),
    ...cellsB.map((c) => c.value),
  );

  const totalA = cellsA.reduce((acc, c) => acc + c.value, 0);
  const totalB = cellsB.reduce((acc, c) => acc + c.value, 0);
  const delta = totalA - totalB;
  const deltaPct = totalB > 0 ? Math.round((delta / totalB) * 100) : 0;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">
          Sammenligning · {metricLabel}
        </h3>
        <span
          className={cn(
            "font-mono text-[11px] font-semibold uppercase tracking-[0.08em]",
            delta >= 0 ? "text-primary" : "text-destructive",
          )}
        >
          {delta >= 0 ? "+" : ""}
          {delta.toLocaleString("nb-NO")} {unit} ({deltaPct >= 0 ? "+" : ""}
          {deltaPct}%)
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CompareColumn
          label={periodA.label}
          tone="primary"
          cells={cellsA}
          total={totalA}
          maxVal={maxVal}
          unit={unit}
          totalLabel={periodA.totalLabel}
        />
        <CompareColumn
          label={periodB.label}
          tone="muted"
          cells={cellsB}
          total={totalB}
          maxVal={maxVal}
          unit={unit}
          totalLabel={periodB.totalLabel}
        />
      </div>
    </div>
  );
}

function CompareColumn({
  label,
  tone,
  cells,
  total,
  maxVal,
  unit,
  totalLabel,
}: {
  label: string;
  tone: "primary" | "muted";
  cells: { date: Date; value: number }[];
  total: number;
  maxVal: number;
  unit: string;
  totalLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[11px] font-semibold text-foreground">
          {totalLabel ?? `${total.toLocaleString("nb-NO")} ${unit}`}
        </span>
      </div>

      <div className="flex items-end gap-[2px]" style={{ height: 80 }}>
        {cells.map((c, i) => {
          const h = (c.value / maxVal) * 100;
          return (
            <span
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition",
                tone === "primary" ? "bg-primary" : "bg-muted-foreground/50",
              )}
              style={{ height: `${Math.max(2, h)}%` }}
              title={`${c.date.toLocaleDateString("nb-NO")} — ${c.value} ${unit}`}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
        <span>{cells[0]?.date.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })}</span>
        <span>{cells.length} dager</span>
        <span>{cells[cells.length - 1]?.date.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })}</span>
      </div>
    </div>
  );
}
