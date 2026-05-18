import { cn } from "@/lib/utils";

export type ClubMetricRow = {
  club: string;
  avgTotal: number;
  avgSmash: number;
  avgClubPath: number;
  avgFaceAngle: number;
  sigmaBall: number;
  shotCount: number;
};

type ClubMetricGridProps = {
  rows: ClubMetricRow[];
  title?: string;
  className?: string;
};

const clubOrder = ["Driver", "3w", "5w", "3i", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "GW", "SW", "LW"];

export function ClubMetricGrid({ rows, title = "Klubb-metrics", className }: ClubMetricGridProps) {
  const sorted = [...rows].sort((a, b) => {
    const ai = clubOrder.indexOf(a.club);
    const bi = clubOrder.indexOf(b.club);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {sorted.length} køller
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-border font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              <th className="py-2 font-medium">Kølle</th>
              <th className="py-2 font-medium text-right">Total</th>
              <th className="py-2 font-medium text-right">Smash</th>
              <th className="py-2 font-medium text-right">Path</th>
              <th className="py-2 font-medium text-right">Face</th>
              <th className="py-2 font-medium text-right">σ Ball</th>
              <th className="py-2 font-medium text-right">N</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.club} className="border-b border-border/60 last:border-b-0">
                <td className="py-2 font-display font-semibold text-foreground">{r.club}</td>
                <td className="py-2 text-right font-mono font-semibold tabular-nums text-foreground">
                  {r.avgTotal.toFixed(0)}m
                </td>
                <td
                  className={cn(
                    "py-2 text-right font-mono tabular-nums",
                    r.avgSmash >= 1.48 ? "text-primary font-semibold" : "text-foreground",
                  )}
                >
                  {r.avgSmash.toFixed(2)}
                </td>
                <td
                  className={cn(
                    "py-2 text-right font-mono tabular-nums",
                    Math.abs(r.avgClubPath) > 2 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {r.avgClubPath > 0 ? "+" : ""}
                  {r.avgClubPath.toFixed(1)}°
                </td>
                <td
                  className={cn(
                    "py-2 text-right font-mono tabular-nums",
                    Math.abs(r.avgFaceAngle) > 1.5 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {r.avgFaceAngle > 0 ? "+" : ""}
                  {r.avgFaceAngle.toFixed(1)}°
                </td>
                <td
                  className={cn(
                    "py-2 text-right font-mono tabular-nums",
                    r.sigmaBall > 5 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {r.sigmaBall.toFixed(1)}
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-muted-foreground">{r.shotCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
