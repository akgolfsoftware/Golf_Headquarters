import { cn } from "@/lib/utils";

export type LPhaseSlice = {
  phase: "GRUNN" | "SPESIAL" | "TURNERING";
  minutes: number;
};

type LPhaseDistributionProps = {
  slices: LPhaseSlice[];
  title?: string;
  className?: string;
};

const LABELS: Record<LPhaseSlice["phase"], string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialisering",
  TURNERING: "Turnering",
};

const DESCRIPTIONS: Record<LPhaseSlice["phase"], string> = {
  GRUNN: "Fysisk og teknisk grunnlag",
  SPESIAL: "Spesifikk mot sesongkrav",
  TURNERING: "Kampforberedelse + press",
};

const COLORS: Record<LPhaseSlice["phase"], string> = {
  GRUNN: "#1A7D56",
  SPESIAL: "#005840",
  TURNERING: "#D1F843",
};

export function LPhaseDistribution({
  slices,
  title = "Periodiseringsfordeling",
  className,
}: LPhaseDistributionProps) {
  const total = slices.reduce((acc, s) => acc + s.minutes, 0);
  const ordered: LPhaseSlice["phase"][] = ["GRUNN", "SPESIAL", "TURNERING"];

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {total} min totalt
        </span>
      </div>

      <div className="space-y-3">
        {ordered.map((phase) => {
          const slice = slices.find((s) => s.phase === phase);
          const min = slice?.minutes ?? 0;
          const pct = total > 0 ? Math.round((min / total) * 100) : 0;
          return (
            <div key={phase}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: COLORS[phase] }}
                  />
                  <span className="font-display text-[13px] font-bold uppercase tracking-[0.04em]">
                    {LABELS[phase]}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    · {DESCRIPTIONS[phase]}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-base font-bold tabular-nums">{pct}%</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{min}m</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: COLORS[phase] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
