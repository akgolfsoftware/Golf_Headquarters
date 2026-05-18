import { cn } from "@/lib/utils";

export type Period = {
  key: string;
  label: string;
  startDay: number;
  endDay: number;
  focus?: string;
  tone?: "primary" | "accent" | "moss" | "gold" | "muted";
};

export type PeriodMarker = {
  key: string;
  day: number;
  label: string;
  type?: "tournament" | "test" | "review" | "rest";
};

type PeriodTimelineProps = {
  totalDays: number;
  periods: Period[];
  markers?: PeriodMarker[];
  currentDay?: number;
  title?: string;
  className?: string;
};

const periodTone: Record<NonNullable<Period["tone"]>, string> = {
  primary: "bg-primary/90 border-primary",
  accent: "bg-accent/80 border-accent",
  moss: "bg-emerald-700/85 border-emerald-700",
  gold: "bg-amber-500/85 border-amber-500",
  muted: "bg-muted border-border",
};

const markerStyle: Record<NonNullable<PeriodMarker["type"]>, string> = {
  tournament: "bg-accent border-primary",
  test: "bg-primary border-accent",
  review: "bg-card border-foreground",
  rest: "bg-muted border-muted-foreground",
};

export function PeriodTimeline({
  totalDays,
  periods,
  markers = [],
  currentDay,
  title = "Periodisering",
  className,
}: PeriodTimelineProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {totalDays} dager · {periods.length} faser
        </span>
      </div>

      <div className="relative">
        <div className="relative h-12 rounded-md bg-muted/50">
          {periods.map((p) => {
            const left = (p.startDay / totalDays) * 100;
            const width = ((p.endDay - p.startDay) / totalDays) * 100;
            return (
              <div
                key={p.key}
                className={cn(
                  "absolute top-1 h-10 overflow-hidden rounded-md border px-2 py-1 text-[10px] font-medium text-white",
                  periodTone[p.tone ?? "primary"],
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={p.focus}
              >
                <span className="block truncate font-display text-[11px] uppercase tracking-[0.04em]">
                  {p.label}
                </span>
                {p.focus && (
                  <span className="block truncate font-mono text-[9px] opacity-85">{p.focus}</span>
                )}
              </div>
            );
          })}

          {typeof currentDay === "number" && (
            <div
              className="absolute -top-1 bottom-[-4px] z-[5] w-[2px] bg-foreground"
              style={{ left: `${(currentDay / totalDays) * 100}%` }}
            >
              <span className="absolute -top-1 -translate-x-1/2 rounded-full bg-foreground px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-background">
                Nå
              </span>
            </div>
          )}
        </div>

        {markers.length > 0 && (
          <div className="relative mt-3 h-6">
            {markers.map((m) => (
              <div
                key={m.key}
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${(m.day / totalDays) * 100}%` }}
              >
                <span
                  className={cn(
                    "block h-3 w-3 rotate-45 border-2",
                    markerStyle[m.type ?? "tournament"],
                  )}
                  title={m.label}
                />
                <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
