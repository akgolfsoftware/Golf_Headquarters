import { cn } from "@/lib/utils";

export type PyramidSlice = {
  area: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  current: number; // minutter eller andel
  recommended?: number; // anbefalt %
};

type PyramidDistributionProps = {
  slices: PyramidSlice[];
  unit?: string;
  level?: "D" | "C" | "B" | "A" | "JKNOTT" | "JUTVIK" | "JELITE";
  title?: string;
  className?: string;
};

const COLORS: Record<PyramidSlice["area"], string> = {
  FYS: "hsl(var(--success))",
  TEK: "hsl(var(--primary))",
  SLAG: "#003D2C",
  SPILL: "hsl(var(--warning))",
  TURN: "hsl(var(--accent))",
};

const LABELS: Record<PyramidSlice["area"], string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export function PyramidDistribution({
  slices,
  unit = "min",
  level,
  title = "Treningsfordeling",
  className,
}: PyramidDistributionProps) {
  const total = slices.reduce((acc, s) => acc + s.current, 0);
  const ordered = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const)
    .map((area) => slices.find((s) => s.area === area))
    .filter((s): s is PyramidSlice => Boolean(s));

  // Beregn donut-segments
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const segments = ordered.map((s) => {
    const fraction = total > 0 ? s.current / total : 0;
    const offset = cumulative;
    cumulative += fraction;
    return { ...s, fraction, offset };
  });

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        {level && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Nivå {level}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative mx-auto h-44 w-44 shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--muted)" strokeWidth="22" />
            {segments.map((s) => (
              <circle
                key={s.area}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={COLORS[s.area]}
                strokeWidth="22"
                strokeDasharray={`${s.fraction * circumference} ${circumference}`}
                strokeDashoffset={-s.offset * circumference}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              Total
            </span>
            <span className="font-display text-2xl font-bold leading-none">{total}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{unit}</span>
          </div>
        </div>

        <ul className="flex-1 space-y-2">
          {ordered.map((s) => {
            const pct = total > 0 ? Math.round((s.current / total) * 100) : 0;
            const recDelta = s.recommended != null ? pct - s.recommended : null;
            return (
              <li key={s.area} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: COLORS[s.area] }}
                />
                <span className="w-20 shrink-0 text-[13px] font-medium text-foreground">
                  {LABELS[s.area]}
                </span>
                <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[s.area], width: `${pct}%` }}
                  />
                </span>
                <span className="w-14 shrink-0 text-right font-mono text-[11px] font-semibold">
                  {pct}%
                </span>
                {recDelta != null && (
                  <span
                    className={cn(
                      "w-12 shrink-0 text-right font-mono text-[9px]",
                      Math.abs(recDelta) <= 5
                        ? "text-muted-foreground"
                        : recDelta > 0
                          ? "text-amber-600"
                          : "text-destructive",
                    )}
                    title={`Anbefalt ${s.recommended}%`}
                  >
                    {recDelta > 0 ? "+" : ""}
                    {recDelta}%
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
