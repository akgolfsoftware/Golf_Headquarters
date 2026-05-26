import { cn } from "@/lib/utils";

export type YearPhase = {
  key: string;
  label: string;
  startMonth: number;
  endMonth: number;
  intensity?: "base" | "build" | "peak" | "recovery";
  tone?: "primary" | "accent" | "moss" | "gold" | "muted";
};

export type YearMilestone = {
  key: string;
  month: number;
  day?: number;
  label: string;
  type?: "tournament" | "test" | "review";
};

type YearPlanGanttProps = {
  year: number;
  phases: YearPhase[];
  milestones?: YearMilestone[];
  currentMonth?: number;
  monthNames?: string[];
  className?: string;
};

const defaultMonths = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

const toneClass: Record<NonNullable<YearPhase["tone"]>, string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  moss: "bg-emerald-700 text-white",
  gold: "bg-amber-500 text-white",
  muted: "bg-muted text-muted-foreground border border-border",
};

const milestoneClass: Record<NonNullable<YearMilestone["type"]>, string> = {
  tournament: "bg-accent border-primary",
  test: "bg-primary border-accent",
  review: "bg-muted-foreground border-foreground",
};

export function YearPlanGantt({
  year,
  phases,
  milestones = [],
  currentMonth,
  monthNames = defaultMonths,
  className,
}: YearPlanGanttProps) {
  const totalUnits = 12;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">Årsplan {year}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {phases.length} faser · {milestones.length} milepæler
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(${totalUnits}, 1fr)` }}>
            <div />
            {monthNames.map((m, idx) => (
              <div
                key={m}
                className={cn(
                  "border-l border-border px-1 pb-2 text-center font-mono text-[10px] uppercase tracking-[0.08em]",
                  currentMonth === idx + 1
                    ? "text-primary font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {m}
              </div>
            ))}
          </div>

          <div className="relative space-y-2 border-t border-border pt-2">
            {phases.map((p) => {
              const left = `calc(120px + ${((p.startMonth - 1) / totalUnits) * 100}% * ${(totalUnits - 0) / totalUnits})`;
              const width = `calc((${(p.endMonth - p.startMonth + 1)} / ${totalUnits}) * (100% - 120px))`;
              return (
                <div key={p.key} className="relative h-8">
                  <div className="absolute left-0 top-0 flex h-full w-[120px] items-center pr-2 text-[11px] font-medium text-foreground">
                    {p.label}
                  </div>
                  <div
                    className={cn(
                      "absolute top-1 h-6 rounded-md px-2.5 text-[11px] font-semibold leading-6",
                      toneClass[p.tone ?? "primary"],
                    )}
                    style={{ left, width }}
                  >
                    <span className="block truncate font-mono uppercase tracking-[0.04em]">
                      {p.intensity ?? ""}
                    </span>
                  </div>
                </div>
              );
            })}

            {milestones.length > 0 && (
              <div className="relative mt-4 h-6 border-t border-dashed border-border pt-2">
                <div className="absolute left-0 top-2 flex h-4 w-[120px] items-center font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                  Milepæler
                </div>
                {milestones.map((m) => {
                  const offset = ((m.month - 1) / totalUnits) * 100 + ((m.day ?? 15) / 30) * (100 / totalUnits);
                  return (
                    <div
                      key={m.key}
                      className="absolute top-2"
                      style={{ left: `calc(120px + ${offset}%)`, transform: "translateX(-50%)" }}
                    >
                      <span
                        className={cn(
                          "block h-3 w-3 rotate-45 border-2",
                          milestoneClass[m.type ?? "tournament"],
                        )}
                        title={m.label}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
