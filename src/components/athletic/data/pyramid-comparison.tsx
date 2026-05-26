import { cn } from "@/lib/utils";

export type PyramidValue = {
  area: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  value: number;
};

type PyramidComparisonProps = {
  labelA: string;
  labelB: string;
  valuesA: PyramidValue[];
  valuesB: PyramidValue[];
  unit?: string;
  title?: string;
  className?: string;
};

const LABELS: Record<PyramidValue["area"], string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const COLORS: Record<PyramidValue["area"], string> = {
  FYS: "hsl(var(--success))",
  TEK: "hsl(var(--primary))",
  SLAG: "#003D2C",
  SPILL: "hsl(var(--warning))",
  TURN: "hsl(var(--accent))",
};

export function PyramidComparison({
  labelA,
  labelB,
  valuesA,
  valuesB,
  unit = "min",
  title = "Sammenligning",
  className,
}: PyramidComparisonProps) {
  const totalA = valuesA.reduce((acc, v) => acc + v.value, 0);
  const totalB = valuesB.reduce((acc, v) => acc + v.value, 0);

  const ordered: PyramidValue["area"][] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <div className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <span>
            {labelA} <b className="text-foreground">{totalA}{unit}</b>
          </span>
          <span>vs</span>
          <span>
            {labelB} <b className="text-foreground">{totalB}{unit}</b>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {ordered.map((area) => {
          const va = valuesA.find((v) => v.area === area)?.value ?? 0;
          const vb = valuesB.find((v) => v.area === area)?.value ?? 0;
          const pctA = totalA > 0 ? Math.round((va / totalA) * 100) : 0;
          const pctB = totalB > 0 ? Math.round((vb / totalB) * 100) : 0;
          const delta = pctA - pctB;
          return (
            <div key={area} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[area] }} />
                  <span className="font-display font-bold uppercase tracking-[0.04em]">
                    {LABELS[area]}
                  </span>
                </div>
                <span
                  className={cn(
                    "font-mono text-[10px] font-semibold",
                    Math.abs(delta) <= 3
                      ? "text-muted-foreground"
                      : delta > 0
                        ? "text-primary"
                        : "text-destructive",
                  )}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}pp
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="ml-auto font-mono tabular-nums">{pctA}%</span>
                  <div className="h-2 flex-1 max-w-[60%] overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-l-full"
                      style={{ width: `${pctA}%`, backgroundColor: COLORS[area], marginLeft: `${100 - pctA}%` }}
                    />
                  </div>
                </div>
                <span className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <div className="h-2 flex-1 max-w-[60%] overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-r-full"
                      style={{ width: `${pctB}%`, backgroundColor: COLORS[area], opacity: 0.5 }}
                    />
                  </div>
                  <span className="mr-auto font-mono tabular-nums text-muted-foreground">{pctB}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
