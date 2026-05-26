import { cn } from "@/lib/utils";

export type LoadDay = {
  date: Date;
  ctl?: number;
  atl?: number;
  tsb?: number;
  loadScore?: number;
};

type LoadCalendarProps = {
  days: LoadDay[];
  title?: string;
  showCtl?: boolean;
  showAtl?: boolean;
  showTsb?: boolean;
  className?: string;
};

export function LoadCalendar({
  days,
  title = "Treningsbelastning",
  showCtl = true,
  showAtl = true,
  showTsb = true,
  className,
}: LoadCalendarProps) {
  if (days.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
        <p className="text-sm text-muted-foreground">Ingen data</p>
      </div>
    );
  }

  const maxLoad = Math.max(
    ...days.map((d) => Math.max(d.ctl ?? 0, d.atl ?? 0, Math.abs(d.tsb ?? 0), d.loadScore ?? 0)),
  );
  const chartHeight = 120;

  const xStep = 100 / Math.max(1, days.length - 1);

  const ctlPath = days.map((d, i) => `${i === 0 ? "M" : "L"}${i * xStep},${chartHeight - ((d.ctl ?? 0) / maxLoad) * chartHeight}`).join(" ");
  const atlPath = days.map((d, i) => `${i === 0 ? "M" : "L"}${i * xStep},${chartHeight - ((d.atl ?? 0) / maxLoad) * chartHeight}`).join(" ");

  const latest = days[days.length - 1];

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <div className="flex items-baseline gap-4 font-mono text-[10px] uppercase tracking-[0.08em]">
          {showCtl && (
            <span className="text-muted-foreground">
              CTL <b className="ml-1 text-primary text-sm">{Math.round(latest.ctl ?? 0)}</b>
            </span>
          )}
          {showAtl && (
            <span className="text-muted-foreground">
              ATL <b className="ml-1 text-destructive text-sm">{Math.round(latest.atl ?? 0)}</b>
            </span>
          )}
          {showTsb && (
            <span className="text-muted-foreground">
              TSB <b className={cn("ml-1 text-sm", (latest.tsb ?? 0) >= 0 ? "text-emerald-600" : "text-destructive")}>
                {(latest.tsb ?? 0) > 0 ? "+" : ""}{Math.round(latest.tsb ?? 0)}
              </b>
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="h-32 w-full">
          {[0.25, 0.5, 0.75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={chartHeight * y}
              x2="100"
              y2={chartHeight * y}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-border"
            />
          ))}
          {showCtl && (
            <path d={ctlPath} fill="none" stroke="currentColor" strokeWidth="1.2" className="text-primary" />
          )}
          {showAtl && (
            <path d={atlPath} fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2,1" className="text-destructive" />
          )}
        </svg>

        {showTsb && (
          <div className="mt-2 flex h-6 items-end gap-[2px] overflow-hidden">
            {days.map((d, i) => {
              const tsb = d.tsb ?? 0;
              const h = Math.min(100, Math.abs(tsb) * 4);
              return (
                <span
                  key={i}
                  className={cn(
                    "flex-1 rounded-sm",
                    tsb >= 0 ? "bg-emerald-500/70" : "bg-destructive/70",
                  )}
                  style={{ height: `${h}%` }}
                  title={`${d.date.toLocaleDateString("nb-NO")} — TSB ${tsb.toFixed(1)}`}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
        <span>{days[0].date.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })}</span>
        <span>{latest.date.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })}</span>
      </div>
    </div>
  );
}
