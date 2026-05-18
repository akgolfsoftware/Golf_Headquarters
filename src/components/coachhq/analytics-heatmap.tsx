import { initialsFromName, avatarBg } from "@/lib/avatar-colors";

/**
 * AnalyticsHeatmap — matrix av spillere × pyramide-områder, viser %
 * fullførte økter siste 30d. Subtilt fra bg-muted → bg-primary basert
 * på intensitet (0-100%).
 */

export type PyramidKey = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

const AREAS: { key: PyramidKey; label: string }[] = [
  { key: "FYS", label: "FYS" },
  { key: "TEK", label: "TEK" },
  { key: "SLAG", label: "SLAG" },
  { key: "SPILL", label: "SPILL" },
  { key: "TURN", label: "TURN" },
];

export type HeatmapPlayer = {
  id: string;
  name: string;
  hcp: number | null;
  cells: Record<PyramidKey, { completed: number; total: number }>;
};

function intensityClass(pct: number): string {
  // 6 trinn fra bg-muted → bg-primary via opacity
  if (pct === 0) return "bg-muted";
  if (pct < 20) return "bg-primary/15";
  if (pct < 40) return "bg-primary/30";
  if (pct < 60) return "bg-primary/50";
  if (pct < 80) return "bg-primary/75";
  return "bg-primary";
}

function textClass(pct: number): string {
  return pct >= 60 ? "text-primary-foreground" : "text-foreground";
}

export function AnalyticsHeatmap({ players }: { players: HeatmapPlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Ingen spillere med aktivitet siste 30 dager.
      </div>
    );
  }

  // Topp-rad: snitt per kategori
  const areaAverages: Record<PyramidKey, number> = {
    FYS: 0,
    TEK: 0,
    SLAG: 0,
    SPILL: 0,
    TURN: 0,
  };
  for (const a of AREAS) {
    let sumCompleted = 0;
    let sumTotal = 0;
    for (const p of players) {
      sumCompleted += p.cells[a.key].completed;
      sumTotal += p.cells[a.key].total;
    }
    areaAverages[a.key] =
      sumTotal > 0 ? Math.round((sumCompleted / sumTotal) * 100) : 0;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Trenings{" "}
            <em className="font-normal italic text-primary">heatmap</em>
          </h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Fullført-% per pyramide-område · siste 30 dager
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {players.length} spillere
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="w-48 px-2 py-2 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Spiller
              </th>
              {AREAS.map((a) => (
                <th
                  key={a.key}
                  className="px-2 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
                >
                  {a.label}
                </th>
              ))}
              <th className="w-16 px-2 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Snitt
              </th>
            </tr>
            <tr>
              <td className="px-2 py-1 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Snitt
              </td>
              {AREAS.map((a) => {
                const v = areaAverages[a.key];
                return (
                  <td
                    key={a.key}
                    className={`rounded-sm px-2 py-2 text-center font-mono text-xs font-semibold tabular-nums ${intensityClass(
                      v,
                    )} ${textClass(v)}`}
                  >
                    {v}%
                  </td>
                );
              })}
              <td className="rounded-sm bg-secondary px-2 py-2 text-center font-mono text-xs font-semibold tabular-nums text-foreground">
                {Math.round(
                  (areaAverages.FYS +
                    areaAverages.TEK +
                    areaAverages.SLAG +
                    areaAverages.SPILL +
                    areaAverages.TURN) /
                    5,
                )}
                %
              </td>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              let pSum = 0;
              let pTot = 0;
              for (const a of AREAS) {
                pSum += p.cells[a.key].completed;
                pTot += p.cells[a.key].total;
              }
              const pAvg = pTot > 0 ? Math.round((pSum / pTot) * 100) : 0;

              return (
                <tr key={p.id}>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold leading-none text-accent"
                        style={{ background: avatarBg(p.name) }}
                      >
                        {initialsFromName(p.name)}
                      </span>
                      <span className="truncate text-sm font-medium text-foreground">
                        {p.name}
                      </span>
                      {p.hcp !== null && (
                        <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
                          {p.hcp.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </td>
                  {AREAS.map((a) => {
                    const cell = p.cells[a.key];
                    const pct =
                      cell.total > 0
                        ? Math.round((cell.completed / cell.total) * 100)
                        : 0;
                    return (
                      <td
                        key={a.key}
                        title={`${p.name} · ${a.label}: ${cell.completed}/${cell.total} økter (${pct}%)`}
                        className={`rounded-sm px-2 py-2 text-center font-mono text-xs tabular-nums ${intensityClass(
                          pct,
                        )} ${textClass(pct)}`}
                      >
                        {cell.total > 0 ? `${pct}%` : "—"}
                      </td>
                    );
                  })}
                  <td className="rounded-sm bg-secondary px-2 py-2 text-center font-mono text-xs font-semibold tabular-nums text-foreground">
                    {pTot > 0 ? `${pAvg}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <span>0%</span>
        <span className="inline-block h-3 w-4 rounded-sm bg-muted" />
        <span className="inline-block h-3 w-4 rounded-sm bg-primary/15" />
        <span className="inline-block h-3 w-4 rounded-sm bg-primary/30" />
        <span className="inline-block h-3 w-4 rounded-sm bg-primary/50" />
        <span className="inline-block h-3 w-4 rounded-sm bg-primary/75" />
        <span className="inline-block h-3 w-4 rounded-sm bg-primary" />
        <span>100%</span>
      </div>
    </section>
  );
}
