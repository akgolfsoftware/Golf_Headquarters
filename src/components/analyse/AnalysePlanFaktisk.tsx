"use client";

/**
 * Plan vs faktisk — adherence-tabell per pyramide.
 *
 * Viser hvor stor andel av den planlagte tiden som faktisk ble logget,
 * samt absolutt-tall og hopp-over (planlagt - faktisk).
 */
import type { PlanVsActual } from "@/app/admin/analyse/actions";

const PYRAMID_FARGER: Record<string, string> = {
  FYS: "hsl(var(--destructive))",
  TEK: "hsl(var(--primary))",
  SLAG: "hsl(var(--accent))",
  SPILL: "#0A5C8A",
  TURN: "#7F4F00",
};

function adherenceFarge(adh: number): string {
  if (adh >= 0.9) return "text-primary";
  if (adh >= 0.7) return "text-foreground";
  return "text-destructive";
}

export function AnalysePlanFaktisk({ data }: { data: PlanVsActual[] }) {
  const totalPlan = data.reduce((s, d) => s + d.planlagtMin, 0);
  const totalFaktisk = data.reduce((s, d) => s + d.faktiskMin, 0);
  const totalAdh = totalPlan === 0 ? 1 : Math.min(1, totalFaktisk / totalPlan);
  const hoppOver = Math.max(0, totalPlan - totalFaktisk);

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Plan vs faktisk</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hvor godt holder du planen din i denne perioden.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Planlagt</div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">
              {totalPlan}<span className="ml-1 text-xs text-muted-foreground">min</span>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Faktisk</div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">
              {totalFaktisk}<span className="ml-1 text-xs text-muted-foreground">min</span>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Adherence</div>
            <div className={`mt-1 font-mono text-xl font-semibold tabular-nums ${adherenceFarge(totalAdh)}`}>
              {Math.round(totalAdh * 100)}<span className="ml-0.5 text-xs">%</span>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Hopp-over</div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-destructive">
              {hoppOver}<span className="ml-1 text-xs text-muted-foreground">min</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-base font-semibold">Per pyramide</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 font-mono text-[10px] uppercase tracking-[0.1em]">Nivå</th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.1em]">Planlagt</th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.1em]">Faktisk</th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.1em]">Hopp-over</th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.1em]">Adherence</th>
                <th className="py-2 font-mono text-[10px] uppercase tracking-[0.1em]">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {data.sort((a, b) => b.planlagtMin - a.planlagtMin).map((rad) => {
                const hopp = Math.max(0, rad.planlagtMin - rad.faktiskMin);
                const pct = Math.round(rad.adherence * 100);
                const farge = PYRAMID_FARGER[rad.pyramide] ?? "hsl(var(--muted-foreground))";
                return (
                  <tr key={rad.pyramide} className="border-b border-border/50 last:border-0">
                    <td className="py-2">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em]" style={{ backgroundColor: `${farge}22`, color: farge }}>
                        {rad.pyramide}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">{rad.planlagtMin}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{rad.faktiskMin}</td>
                    <td className="py-2 text-right font-mono tabular-nums text-destructive">{hopp === 0 ? "–" : hopp}</td>
                    <td className={`py-2 text-right font-mono font-semibold tabular-nums ${adherenceFarge(rad.adherence)}`}>{pct}%</td>
                    <td className="py-2 pl-3">
                      <div className="relative h-2 w-28 overflow-hidden rounded-full bg-muted">
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: farge }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Adherence over 90 % = grønt. 70–90 % = OK. Under 70 % = trenger oppfølging.
        </p>
      </section>
    </div>
  );
}
