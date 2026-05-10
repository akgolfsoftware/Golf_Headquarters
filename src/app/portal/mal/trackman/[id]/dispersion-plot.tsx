// Server-rendert SVG dispersion-plot fra TrackMan rawJson.
// Plotter total distance vs lateral (left/right) for hvert slag.

type Slag = Record<string, string | undefined>;

const PLOT_W = 400;
const PLOT_H = 300;
const PADDING = 30;

export function DispersionPlot({ rader }: { rader: Slag[] }) {
  const punkter = rader
    .map((r) => {
      const distanse = Number(r.Distance ?? r.distance ?? r.Carry ?? r.carry ?? 0);
      const lateral = Number(r.Lateral ?? r.lateral ?? r.Side ?? r.side ?? 0);
      const klubb = r.Club ?? r.club ?? r.kolle ?? null;
      if (Number.isNaN(distanse) || Number.isNaN(lateral)) return null;
      return { distanse, lateral, klubb };
    })
    .filter((p): p is NonNullable<typeof p> => p != null);

  if (punkter.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Klarte ikke parse dispersion-data fra CSV. Forventet kolonner:{" "}
        <code className="font-mono">Distance</code>,{" "}
        <code className="font-mono">Lateral</code>,{" "}
        <code className="font-mono">Club</code>.
      </div>
    );
  }

  const maxDist = Math.max(...punkter.map((p) => p.distanse), 100);
  const maxLat = Math.max(...punkter.map((p) => Math.abs(p.lateral)), 20);

  function tilX(lat: number): number {
    // 0 = sentrum, +max høyre, -max venstre
    return PADDING + ((lat + maxLat) / (maxLat * 2)) * (PLOT_W - PADDING * 2);
  }
  function tilY(dist: number): number {
    // Topp = max distanse, bunn = 0
    return PLOT_H - PADDING - (dist / maxDist) * (PLOT_H - PADDING * 2);
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
        className="h-auto w-full max-w-2xl"
        role="img"
        aria-label="Slag-dispersion"
      >
        {/* Akse-linjer */}
        <line
          x1={PLOT_W / 2}
          y1={PADDING}
          x2={PLOT_W / 2}
          y2={PLOT_H - PADDING}
          stroke="hsl(var(--border))"
          strokeDasharray="2 4"
        />
        <line
          x1={PADDING}
          y1={PLOT_H - PADDING}
          x2={PLOT_W - PADDING}
          y2={PLOT_H - PADDING}
          stroke="hsl(var(--border))"
        />

        {/* Distanse-skala (hver 50m) */}
        {[50, 100, 150, 200, 250].filter((d) => d <= maxDist).map((d) => (
          <g key={d}>
            <line
              x1={PADDING}
              y1={tilY(d)}
              x2={PLOT_W - PADDING}
              y2={tilY(d)}
              stroke="hsl(var(--border))"
              strokeDasharray="2 6"
              strokeOpacity={0.5}
            />
            <text
              x={PADDING - 4}
              y={tilY(d)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {d}m
            </text>
          </g>
        ))}

        {/* Punkter */}
        {punkter.map((p, i) => (
          <circle
            key={i}
            cx={tilX(p.lateral)}
            cy={tilY(p.distanse)}
            r={3}
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
        ))}

        {/* Akse-labels */}
        <text
          x={PLOT_W / 2}
          y={PLOT_H - 8}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[9px] uppercase tracking-[0.10em]"
        >
          Lateral (m)
        </text>
      </svg>
      <p className="mt-2 text-xs text-muted-foreground">
        {punkter.length} slag plottet. Sentrum = mål-linje, vertikal akse =
        distanse.
      </p>
    </div>
  );
}
