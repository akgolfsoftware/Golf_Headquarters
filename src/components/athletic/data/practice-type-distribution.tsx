import { cn } from "@/lib/utils";

export type PracticeSlice = {
  type: "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST";
  count: number;
};

type PracticeTypeDistributionProps = {
  slices: PracticeSlice[];
  title?: string;
  className?: string;
};

const LABELS: Record<PracticeSlice["type"], string> = {
  BLOKK: "Blokk",
  RANDOM: "Random",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spill-test",
};

const DESCRIPTIONS: Record<PracticeSlice["type"], string> = {
  BLOKK: "Repetisjon · samme kølle/skill",
  RANDOM: "Variert · ulike skills",
  KONKURRANSE: "Press · score mot mål",
  SPILL_TEST: "Bane · realistisk situasjon",
};

const COLORS: Record<PracticeSlice["type"], string> = {
  BLOKK: "hsl(var(--primary))",
  RANDOM: "hsl(var(--primary))",
  KONKURRANSE: "hsl(var(--warning))",
  SPILL_TEST: "hsl(var(--accent))",
};

export function PracticeTypeDistribution({
  slices,
  title = "Treningsmodus-fordeling",
  className,
}: PracticeTypeDistributionProps) {
  const total = slices.reduce((acc, s) => acc + s.count, 0);
  const ordered: PracticeSlice["type"][] = ["BLOKK", "RANDOM", "KONKURRANSE", "SPILL_TEST"];

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {total} drills
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ordered.map((type) => {
          const slice = slices.find((s) => s.type === type);
          const count = slice?.count ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={type} className="rounded-xl border border-border bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[type] }} />
                <span className="font-display text-[13px] font-bold uppercase tracking-[0.04em]">
                  {LABELS[type]}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {DESCRIPTIONS[type]}
              </p>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold tabular-nums">{pct}%</span>
                <span className="font-mono text-[10px] text-muted-foreground">{count} drills</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: COLORS[type] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
