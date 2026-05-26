import { cn } from "@/lib/utils";

export type HeatmapDay = {
  date: Date;
  value: number;
};

type HeatmapCalendarProps = {
  days: HeatmapDay[];
  weeks?: number;
  endDate?: Date;
  title?: string;
  unit?: string;
  className?: string;
};

const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function HeatmapCalendar({
  days,
  weeks = 26,
  endDate,
  title = "Aktivitet",
  unit = "min",
  className,
}: HeatmapCalendarProps) {
  const end = endDate ?? new Date();
  const totalDays = weeks * 7;
  const start = new Date(end);
  start.setDate(end.getDate() - totalDays + 1);

  const map = new Map<string, number>();
  days.forEach((d) => map.set(d.date.toDateString(), d.value));

  const maxVal = Math.max(1, ...days.map((d) => d.value));

  const cells: { date: Date; value: number; weekIndex: number; dayIndex: number }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      date: d,
      value: map.get(d.toDateString()) ?? 0,
      weekIndex: Math.floor(i / 7),
      dayIndex: (d.getDay() + 6) % 7,
    });
  }

  const total = days.reduce((acc, d) => acc + d.value, 0);
  const activeDays = days.filter((d) => d.value > 0).length;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {total.toLocaleString("nb-NO")} {unit} · {activeDays} aktive dager
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          <div className="flex flex-col gap-1 pr-2 text-right">
            {["Man", "Ons", "Fre", "Søn"].map((d, i) => (
              <span
                key={d}
                className="font-mono text-[8px] text-muted-foreground"
                style={{ marginTop: i === 0 ? 0 : 11 }}
              >
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {cells.map((c, idx) => {
              const intensity = c.value === 0 ? 0 : Math.ceil((c.value / maxVal) * 4);
              return (
                <span
                  key={idx}
                  title={`${c.date.toLocaleDateString("nb-NO")} — ${c.value} ${unit}`}
                  className={cn(
                    "h-3 w-3 rounded-[3px]",
                    intensity === 0 && "bg-muted/40",
                    intensity === 1 && "bg-primary/25",
                    intensity === 2 && "bg-primary/55",
                    intensity === 3 && "bg-primary/85",
                    intensity === 4 && "bg-accent",
                  )}
                  style={{ gridRow: c.dayIndex + 1 }}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
            {monthLabels.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
            <span>Mindre</span>
            <span className="h-3 w-3 rounded-[3px] bg-muted/40" />
            <span className="h-3 w-3 rounded-[3px] bg-primary/25" />
            <span className="h-3 w-3 rounded-[3px] bg-primary/55" />
            <span className="h-3 w-3 rounded-[3px] bg-primary/85" />
            <span className="h-3 w-3 rounded-[3px] bg-accent" />
            <span>Mer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
